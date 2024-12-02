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

  const handleDateClick = (date) => {
    if (!selectedDates.start) {
      setSelectedDates({ start: date, end: null });
    } else if (!selectedDates.end) {
      if (date.isBefore(selectedDates.start)) {
        setSelectedDates({ start: date, end: null });
      } else {
        setSelectedDates(prev => ({ ...prev, end: date }));
        setShowModal(true);
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
      const payload = {
        companyEmail: email,
        leaveType: formData.type,
        duration: formData.dayType,
        reason: formData.reason,
        startDate: selectedDates.start.toISOString(),
        endDate: selectedDates.end.toISOString(),
        comments: formData.comments || '',
      };

      await axios.post(`${config.apiUrl}/qubinest/newleaverequest`, payload);
      toast.success('Leave request submitted successfully');
      
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
                const hasLeave = leaveRequests.some(leave => 
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
                      ${!day.isSame(currentDate, 'month') ? 'bg-gray-50 text-gray-400' : 'bg-white'}
                      ${isSelected ? 'bg-blue-100 border-blue-500' : ''}
                      ${isInRange ? 'bg-blue-50' : ''}
                      ${hasLeave ? 'border-yellow-500' : ''}
                      ${isHoliday ? 'bg-red-50' : ''}
                      ${isToday ? 'border-2 border-green-500 font-bold text-green-500 shadow-xl' : ''}
                      ${isWeekend ? 'bg-red-50 text-red-500' : ''} // Weekend highlighting
                      hover:bg-gray-50
                    `}
                  >
                    <div className="flex justify-between">
                      <span className={`
                        ${isToday ? 'font-bold text-green-500' : ''}
                        ${isWeekend ? 'text-red-500' : ''}
                      `}>
                        {day.format('D')}
                      </span>
                      {hasLeave && <span className="text-xs text-yellow-600">Leave</span>}
                      {isHoliday && <span className="text-xs text-red-600">Holiday</span>}
                    </div>
                  </div>
                );
              })
            ))}
          </div>
        </div>

        {/* Leave Request Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">New Leave Request</h3>
              
              <div className="space-y-4">
                {/* Date Selection Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1">Start Date</label>
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
                    <label className="block mb-1">End Date</label>
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

                <div>
                  <label className="block mb-1">Leave Type</label>
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
                  <label className="block mb-1">Duration</label>
                  <select
                    value={formData.dayType}
                    onChange={(e) => setFormData(prev => ({ ...prev, dayType: e.target.value }))}
                    className="w-full p-2 border rounded"
                  >
                    <option value="full">Full Day</option>
                    <option value="half">Half Day</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1">Reason</label>
                  <textarea
                    value={formData.reason}
                    onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                    className="w-full p-2 border rounded"
                    rows="3"
                  />
                </div>

                <div>
                  <label className="block mb-1">Additional Comments</label>
                  <textarea
                    value={formData.comments}
                    onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
                    className="w-full p-2 border rounded"
                    rows="2"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedDates({ start: null, end: null });
                  }}
                  className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Submit Request
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
