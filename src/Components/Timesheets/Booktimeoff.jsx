import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import { toast } from 'react-toastify';
import config from '../config';
import Cookies from 'js-cookie';
import Header from '../Homepage Components/Header';
import Sidemenu from '../Homepage Components/Sidemenu';

const Booktimeoff = () => {
  const [currentDate, setCurrentDate] = useState(moment());
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDates, setSelectedDates] = useState({ start: null, end: null });
  const email = Cookies.get('email');
  
  const [formData, setFormData] = useState({
    type: '',
    dayType: 'full',
    reason: '',
    comments: '',
  });

  // Add loading state
  const [isLoading, setIsLoading] = useState(false);

  // Add a new state for submit loading
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calendar generation logic
  const generateCalendar = () => {
    const startDay = currentDate.clone().startOf('month').startOf('week');
    const endDay = currentDate.clone().endOf('month').endOf('week');
    const calendar = [];
    let day = startDay.clone();

    while (day.isBefore(endDay, 'day')) {
      calendar.push(
        Array(7).fill(0).map(() => {
          const currentDay = day.clone();
          day.add(1, 'day');
          return currentDay;
        })
      );
    }
    return calendar;
  };

  // Fetch leave requests and holidays
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch leave requests
        const response = await axios.get(
          `${config.apiUrl}/qubinest/getleaverequests/${encodeURIComponent(email)}`
        );
        setLeaveRequests(response.data || []);

        // Set predefined holidays
        setHolidays([
          { date: '2024-01-01', title: "New Year's Day" },
          { date: '2024-01-26', title: 'Republic Day' },
          // ... add other holidays
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [email]);

  const handleDateClick = async (date) => {
    if (!selectedDates.start) {
      setSelectedDates({ start: date, end: null });
    } else if (!selectedDates.end) {
      if (date.isBefore(selectedDates.start)) {
        setSelectedDates({ start: date, end: null });
      } else {
        setSelectedDates(prev => ({ ...prev, end: date }));
        setIsLoading(true); // Start loading
        // Simulate loading for modal (you can remove setTimeout if not needed)
        setTimeout(() => {
          setShowModal(true);
          setIsLoading(false); // Stop loading
        }, 500);
      }
    } else {
      setSelectedDates({ start: date, end: null });
    }
  };

  const handleSubmit = async () => {
    if (!selectedDates.start || !selectedDates.end || !formData.type || !formData.reason) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true); // Start loading

      const payload = {
        companyEmail: email,
        leaveType: formData.type,
        duration: formData.dayType,
        reason: formData.reason,
        startDate: selectedDates.start.toISOString(),
        endDate: selectedDates.end.toISOString(),
        comments: formData.comments || '',
        status: 'pending'
      };

      await axios.post(`${config.apiUrl}/qubinest/newleaverequest`, payload);
      
      toast.info('Leave request submitted for approval. You will be notified once it is reviewed.', {
        autoClose: 5000
      });
      
      // Reset form and modal
      setShowModal(false);
      setSelectedDates({ start: null, end: null });
      setFormData({
        type: '',
        dayType: 'full',
        reason: '',
        comments: '',
      });

      // Reload leave requests
      const response = await axios.get(
        `${config.apiUrl}/qubinest/getleaverequests/${encodeURIComponent(email)}`
      );
      setLeaveRequests(response.data || []);

    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit leave request');
    } finally {
      setIsSubmitting(false); // Stop loading
    }
  };

  return (
    <>
      <Header />
      <Sidemenu />
      <div className="content-wrapper p-4">
        <div className="calendar-container bg-white rounded-lg shadow-lg p-6">
          {/* Calendar Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {currentDate.format('MMMM YYYY')}
            </h2>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentDate(prev => prev.clone().subtract(1, 'month'))}
                className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentDate(moment())}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Today
              </button>
              <button 
                onClick={() => setCurrentDate(prev => prev.clone().add(1, 'month'))}
                className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Next
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Weekday headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
              <div 
                key={day} 
                className={`text-center py-2 font-semibold ${index === 0 || index === 6 ? 'text-red-500' : ''}`}
              >
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {generateCalendar().map((week, weekIdx) => (
              week.map((day, dayIdx) => {
                const isSelected = selectedDates.start && day.isSame(selectedDates.start, 'day') ||
                                   selectedDates.end && day.isSame(selectedDates.end, 'day');
                const isInRange = selectedDates.start && selectedDates.end &&
                                  day.isBetween(selectedDates.start, selectedDates.end, 'day', '[]');
                const hasApprovedLeave = leaveRequests.some(leave => 
                  leave.status.toLowerCase() === 'approved' && 
                  day.isBetween(moment(leave.startDate), moment(leave.endDate), 'day', '[]')
                );
                const hasPendingLeave = leaveRequests.some(leave => 
                  leave.status.toLowerCase() === 'pending' && 
                  day.isBetween(moment(leave.startDate), moment(leave.endDate), 'day', '[]')
                );
                const hasRejectedLeave = leaveRequests.some(leave => 
                  leave.status.toLowerCase() === 'rejected' && 
                  day.isBetween(moment(leave.startDate), moment(leave.endDate), 'day', '[]')
                );
                const isHoliday = holidays.some(holiday => 
                  day.isSame(moment(holiday.date), 'day')
                );
                const isToday = day.isSame(moment(), 'day');
                const isWeekend = dayIdx === 0 || dayIdx === 6; // Check if it's Saturday or Sunday

                return (
                  <div
                    key={`${weekIdx}-${dayIdx}`}
                    onClick={() => handleDateClick(day)}
                    className={`
                      min-h-[80px] p-2 border rounded-lg cursor-pointer
                      transition-all duration-200 ease-in-out
                      hover:bg-gray-100 hover:shadow-sm
                      ${!day.isSame(currentDate, 'month') ? 'bg-gray-50 text-gray-400 hover:bg-gray-200' : 'bg-gray-200'}
                      ${isSelected ? 'bg-blue-100 border-blue-500 hover:bg-blue-200' : ''}
                      ${isInRange ? 'bg-blue-50 hover:bg-blue-100' : ''}
                      ${hasApprovedLeave ? 'border-green-500' : ''} 
                      ${hasPendingLeave ? 'border-yellow-500' : ''} 
                      ${hasRejectedLeave ? 'border-red-500' : ''} 
                      ${isHoliday ? 'bg-red-50 hover:bg-red-100' : ''}
                      ${isToday ? 'border-2 border-green-500 font-bold text-green-500 shadow-xl' : ''}
                      ${isWeekend ? 'bg-red-50 hover:bg-red-100 text-red-500' : ''}
                    `}
                  >
                    <div className="flex justify-between">
                      <span className={`
                        ${isToday ? 'font-bold text-green-500' : ''}
                        ${isWeekend ? 'text-red-500' : ''}
                      `}>
                        {day.format('D')}
                      </span>
                      {hasApprovedLeave && <span className="text-xs text-green-600">Approved</span>}
                      {hasPendingLeave && <span className="text-xs text-yellow-600">Pending</span>}
                      {hasRejectedLeave && <span className="text-xs text-red-600">Rejected</span>}
                      {isHoliday && <span className="text-xs text-red-600">Holiday</span>}
                    </div>
                  </div>
                );
              })
            ))}
          </div>
        </div>

        {/* Leave Request Modal */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-4 rounded-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <h3 className="text-xl font-bold mb-3">New Leave Request</h3>
              
              <div className="space-y-3">
                {/* Date Selection Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1">Start Date</label>
                    <input
                      type="date"
                      value={selectedDates.start ? selectedDates.start.format('YYYY-MM-DD') : ''}
                      onChange={(e) => setSelectedDates(prev => ({
                        ...prev,
                        start: moment(e.target.value)
                      }))}
                      className="w-full p-2 border rounded"
                      min={moment().format('YYYY-MM-DD')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">End Date</label>
                    <input
                      type="date"
                      value={selectedDates.end ? selectedDates.end.format('YYYY-MM-DD') : ''}
                      onChange={(e) => setSelectedDates(prev => ({
                        ...prev,
                        end: moment(e.target.value)
                      }))}
                      className="w-full p-2 border rounded"
                      min={selectedDates.start ? selectedDates.start.format('YYYY-MM-DD') : moment().format('YYYY-MM-DD')}
                    />
                  </div>
                </div>

                {/* Leave Type and Duration - Side by Side */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1">Leave Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full p-2 border rounded"
                    >
                      <option value="">Select Type</option>
                      <option value="Casual">Casual Leave</option>
                      <option value="Sick">Sick Leave</option>
                      <option value="Personal">Personal Leave</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm mb-1">Duration</label>
                    <select
                      value={formData.dayType}
                      onChange={(e) => setFormData(prev => ({ ...prev, dayType: e.target.value }))}
                      className="w-full p-2 border rounded"
                    >
                      <option value="full">Full Day</option>
                      <option value="half">Half Day</option>
                    </select>
                  </div>
                </div>

                {/* Reason and Comments */}
                <div>
                  <label className="block text-sm mb-1">Reason</label>
                  <textarea
                    value={formData.reason}
                    onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                    className="w-full p-2 border rounded"
                    rows="2"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1">Additional Comments</label>
                  <textarea
                    value={formData.comments}
                    onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
                    className="w-full p-2 border rounded"
                    rows="2"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedDates({ start: null, end: null });
                  }}
                  className="px-3 py-1.5 bg-gray-100 rounded hover:bg-gray-200 text-sm"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`px-3 py-1.5 rounded text-sm flex items-center justify-center min-w-[100px] ${
                    isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
                  } text-white`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    'Submit Request'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Booktimeoff;
