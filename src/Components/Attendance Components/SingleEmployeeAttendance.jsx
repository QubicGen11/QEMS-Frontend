import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Header from '../Homepage Components/Header';
import Sidemenu from '../Homepage Components/Sidemenu';
import Footer from '../Homepage Components/Footer';
import Cookies from 'js-cookie';
import config from '../config';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DOMPurify from 'dompurify';
import './Singleattendace.css'
import LoadingSkeleton from './LoadingSkeleton';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { FaFileDownload, FaCheck, FaTimes, FaUsers } from 'react-icons/fa';

const formatIndianDate = (date) => {
  if (!date) return '---';
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const formatIndianTime = (date) => {
  if (!date) return '---';
  return new Date(date).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

const calculateWorkingHours = (checkinTime, checkoutTime) => {
  if (!checkinTime || !checkoutTime) return '---';
  
  const checkin = new Date(checkinTime);
  const checkout = new Date(checkoutTime);
  
  // Calculate difference in milliseconds
  const diff = checkout - checkin;
  
  // Convert to hours and minutes
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  // Format the output
  if (hours < 0 || minutes < 0) return '---';
  return `${hours}h ${minutes}m`;
};

const SingleEmployeeAttendance = () => {
  const [employee, setEmployee] = useState(null);
  const [employeeTitle, setEmployeeTitle] = useState('');
  const [attendance, setAttendance] = useState([]);
  const [filteredAttendance, setFilteredAttendance] = useState([]);
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [avgTimings, setAvgTimings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { employeeId } = useParams();
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const adminEmail = Cookies.get('email');
  const [isApproving, setIsApproving] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    const email = Cookies.get('email');

    const fetchEmployeeData = async () => {
      if (!email) {
        toast.error('No email found in cookies');
        return;
      }

      try {
        const response = await axios.get(`${config.apiUrl}/qubinest/getemployees/${email}`);
        console.log('API response:', response.data); // Log the response data
        if (response.data) {
          const employeeData = response.data;
          const title = employeeData.gender === 'male' ? 'Mr.' : employeeData.gender === 'female' ? 'Ms.' : '';
          setEmployeeTitle(title);
        } else {
          toast.error('Unexpected response format');
        }
      } catch (error) {
        console.error('Error fetching employee data:', error);
      }
    };

    fetchEmployeeData();
  }, []);

  useEffect(() => {
    fetchAttendance();
    fetchEmployeeDetails();
  }, [employeeId, year, month]);

  const fetchEmployeeDetails = async () => {
    try {
      const cleanEmployeeId = employeeId.replace(':', '');
      const response = await axios.get(`${config.apiUrl}/qubinest/employee/${cleanEmployeeId}`);
      const employeeData = response.data;
      const fullName = `${employeeData.firstname || ''} ${employeeData.lastname || ''}`.trim();
      setEmployee({
        ...employeeData,
        username: fullName,
        mainPosition: employeeData.companyEmail || 'Email Not Set'
      });
    } catch (error) {
      console.error('Error fetching employee details:', error);
    }
  };

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const cleanEmployeeId = employeeId.replace(':', '');
      const response = await axios.get(
        `${config.apiUrl}/qubinest/singleUserAttendance/${cleanEmployeeId}`
      );

      if (response.data) {
        const processedData = response.data.map(record => ({
          ...record,
          date: new Date(record.date),
          checkin_Time: record.checkin_Time,
          checkout_Time: record.checkout_Time,
          status: record.status || 'pending'
        }));

        setAttendance(processedData);
        setFilteredAttendance(processedData);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setError('Failed to fetch attendance data');
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFilter();
  }, [year, month, attendance]);

  const handleFilter = () => {
    if (!year || !month) {
      setFilteredAttendance(attendance);
      return;
    }

    // Filter attendance records for selected month and year
    const filtered = attendance.filter(record => {
      const recordDate = new Date(record.date);
      const recordMonth = recordDate.getMonth() + 1; // Adding 1 because getMonth() returns 0-11
      const recordYear = recordDate.getFullYear();
      
      return recordMonth === parseInt(month) && recordYear === parseInt(year);
    });

    setFilteredAttendance(filtered);

    // Update monthly statistics
    const monthStats = {
      totalDays: filtered.length,
      presentDays: filtered.filter(record => record.checkin_Time).length,
      absentDays: filtered.filter(record => !record.checkin_Time).length,
      onTime: filtered.filter(record => getCheckinStatus(record.checkin_Time, record.checkout_Time) === 'ontime').length,
      late: filtered.filter(record => getCheckinStatus(record.checkin_Time, record.checkout_Time) === 'late').length,
      earlyDeparture: filtered.filter(record => getCheckinStatus(record.checkin_Time, record.checkout_Time) === 'early departure').length
    };

    // Calculate average check-in time for the month
    const checkInTimes = filtered
      .filter(record => record.checkin_Time)
      .map(record => new Date(record.checkin_Time));
    
    if (checkInTimes.length > 0) {
      const avgTime = checkInTimes.reduce((acc, time) => {
        return acc + time.getHours() * 60 + time.getMinutes();
      }, 0) / checkInTimes.length;

      const avgHours = Math.floor(avgTime / 60);
      const avgMinutes = Math.floor(avgTime % 60);
      
      setAvgTimings({
        hours: avgHours,
        minutes: avgMinutes
      });
    } else {
      setAvgTimings({ hours: 0, minutes: 0 });
    }
  };

  const handleApprove = async () => {
    if (selectedRecords.length === 0) {
      toast.warning("Please select records to approve");
      return;
    }

    try {
      setIsApproving(true);
      const selectedIds = selectedRecords.map(record => record.id);
      const response = await axios.post(`${config.apiUrl}/qubinest/approveAttendance`, {
        employeeId: employeeId.split(':')[1],
        adminEmail,
        year,
        month,
        selectedIds
      });

      if (response.status === 200) {
        toast.success("Attendance approved successfully");
        
        // Create notification for approved attendance
        try {
          const dates = selectedRecords.map(record => 
            new Date(record.date).toLocaleDateString()
          ).join(', ');

          await axios.post(`${config.apiUrl}/qubinest/notifications/create`, {
            employeeId: employeeId.split(':')[1],
            message: `Your attendance for dates: ${dates} has been approved`,
            type: 'ATTENDANCE_APPROVED',
            isRead: false
          });
          
          console.log('Attendance approval notification created successfully');
        } catch (notifError) {
          console.error('Error creating attendance approval notification:', notifError);
        }

        // Update UI
        const updatedAttendance = filteredAttendance.map(record => ({
          ...record,
          status: selectedIds.includes(record.id) ? 'approved' : record.status
        }));

        setFilteredAttendance(updatedAttendance);
        setAttendance(prevAttendance =>
          prevAttendance.map(record => ({
            ...record,
            status: selectedIds.includes(record.id)
              ? 'approved'
              : record.status
          }))
        );
      }
    } catch (error) {
      console.error('Error approving attendance:', error);
      toast.error('Failed to approve attendance');
    } finally {
      setIsApproving(false);
    }
  };

  const handleDecline = async () => {
    if (selectedRecords.length === 0) {
      toast.warning("Please select records to decline");
      return;
    }

    try {
      setIsDeclining(true);
      const selectedIds = selectedRecords.map(record => record.id);
      const response = await axios.post(`${config.apiUrl}/qubinest/declineAttendance`, {
        employeeId: employeeId.split(':')[1],
        adminEmail,
        year,
        month,
        selectedIds
      });

      if (response.status === 200) {
        toast.success("Attendance declined successfully");

        // Create notification for declined attendance
        try {
          const dates = selectedRecords.map(record => 
            new Date(record.date).toLocaleDateString()
          ).join(', ');

          await axios.post(`${config.apiUrl}/qubinest/notifications/create`, {
            employeeId: employeeId.split(':')[1],
            message: `Your attendance for dates: ${dates} has been declined`,
            type: 'ATTENDANCE_REJECTED',
            isRead: false
          });
          
          console.log('Attendance rejection notification created successfully');
        } catch (notifError) {
          console.error('Error creating attendance rejection notification:', notifError);
        }

        // Update UI
        const updatedAttendance = filteredAttendance.map(record => ({
          ...record,
          status: selectedIds.includes(record.id) ? 'declined' : record.status
        }));

        setFilteredAttendance(updatedAttendance);
        setAttendance(prevAttendance =>
          prevAttendance.map(record => ({
            ...record,
            status: selectedIds.includes(record.id)
              ? 'declined'
              : record.status
          }))
        );
      }
    } catch (error) {
      console.error('Error declining attendance:', error);
      toast.error('Failed to decline attendance');
    } finally {
      setIsDeclining(false);
    }
  };

  const handleSelectRecord = (record) => {
    setSelectedRecords(prevSelected => {
      if (prevSelected.includes(record)) {
        return prevSelected.filter(r => r !== record);
      } else {
        return [...prevSelected, record];
      }
    });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRecords(filteredAttendance);
    } else {
      setSelectedRecords([]);
    }
  };

  const renderReport = (reportContent) => {
    if (!reportContent) return '---';
    
    // Sanitize the HTML content
    const sanitizedContent = DOMPurify.sanitize(reportContent);
    
    return (
      <div 
        className="report-content max-w-md overflow-auto"
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />
    );
  };

  const getCheckinStatus = (checkinTime, checkoutTime) => {
    if (!checkinTime) return 'absent';
    
    const checkin = new Date(checkinTime);
    const startThreshold = new Date(checkin);
    startThreshold.setHours(10, 30, 0); // 10:30 AM start threshold
    
    // Check for late arrival
    if (checkin > startThreshold) {
      return 'late';
    }

    // If checkout time exists, check for early departure
    if (checkoutTime) {
      const checkout = new Date(checkoutTime);
      const endThreshold = new Date(checkout);
      endThreshold.setHours(17, 30, 0); // 5:30 PM end threshold

      if (checkout < endThreshold) {
        return 'early departure';
      }
    }
    
    return 'ontime';
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Add title with employee name and title
    doc.setFontSize(16);
    doc.text(`Attendance Report - ${employeeTitle} ${employee?.username}`, 14, 15);
    doc.setFontSize(11);
    doc.text(`Period: ${month}/${year}`, 14, 25);

    // Define the columns including approval status
    const columns = [
      { header: 'Date', dataKey: 'date' },
      { header: 'Check-in', dataKey: 'checkin' },
      { header: 'Check-out', dataKey: 'checkout' },
      { header: 'Status', dataKey: 'status' },
      { header: 'Approval', dataKey: 'approval' }
    ];

    // Prepare the data
    const data = filteredAttendance.map(record => ({
      date: formatIndianDate(record.date),
      checkin: formatIndianTime(record.checkin_Time),
      checkout: record.checkout_Time ? formatIndianTime(record.checkout_Time) : '---',
      status: getCheckinStatus(record.checkin_Time, record.checkout_Time),
      approval: record.status?.toUpperCase() || 'PENDING'
    }));

    // Generate the table
    doc.autoTable({
      columns,
      body: data,
      startY: 35,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [71, 85, 105] }
    });

    // Save the PDF
    doc.save(`attendance-report-${employee?.username}-${month}-${year}.pdf`);
  };

  const fetchAllEmployeesAttendance = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${config.apiUrl}/qubinest/allEmployeesAttendance`);
      return response.data;
    } catch (error) {
      console.error('Error fetching all attendance:', error);
      toast.error('Failed to fetch all employees attendance');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const exportAllEmployeesAttendance = async () => {
    const allAttendance = await fetchAllEmployeesAttendance();
    if (!allAttendance) return;

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`All Employees Attendance Report`, 14, 15);
    doc.setFontSize(11);
    doc.text(`Period: ${month}/${year}`, 14, 25);

    // Define columns
    const columns = [
      { header: 'Employee Name', dataKey: 'name' },
      { header: 'Employee ID', dataKey: 'empId' },
      { header: 'Position', dataKey: 'position' },
      { header: 'Date', dataKey: 'date' },
      { header: 'Check-in', dataKey: 'checkin' },
      { header: 'Check-out', dataKey: 'checkout' },
      { header: 'Status', dataKey: 'status' },
      { header: 'Approval', dataKey: 'approval' }
    ];

    // Process data
    const data = allAttendance.map(record => ({
      name: record.username || 'N/A',
      empId: record.employeeId || 'N/A',
      position: record.mainPosition || 'N/A',
      date: formatIndianDate(record.date),
      checkin: record.checkin_Time ? formatIndianTime(record.checkin_Time) : '---',
      checkout: record.checkout_Time ? formatIndianTime(record.checkout_Time) : '---',
      status: getCheckinStatus(record.checkin_Time, record.checkout_Time),
      approval: record.status?.toUpperCase() || 'PENDING'
    }));

    // Generate table
    doc.autoTable({
      columns,
      body: data,
      startY: 35,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [71, 85, 105] },
      didDrawPage: function(data) {
        // Add page number
        doc.setFontSize(8);
        doc.text(
          `Page ${data.pageNumber} of ${doc.internal.getNumberOfPages()}`,
          doc.internal.pageSize.width - 20, 
          doc.internal.pageSize.height - 10
        );
      }
    });

    // Save the PDF
    doc.save(`all-employees-attendance-${month}-${year}.pdf`);
  };

  const sortByDate = (records) => {
    return records.slice().sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
  };

  return (
    <>
      <Header />
      <Sidemenu />
      <div className="content-wrapper">
        <section className="container px-4 mx-auto">
          {loading ? (
            <div className="mt-8">
              <h2 className="text-xl font-medium text-gray-800 text-center mb-6">
                Loading Employee Attendance...
              </h2>
              <div className="bg-white p-8 rounded-lg shadow">
                <LoadingSkeleton />
              </div>
            </div>
          ) : error ? (
            <div className="text-center mt-8 text-red-600">
              <p>{error}</p>
            </div>
          ) : (
            <>
              {employee && (
                <div className="mb-6 text-center">
                  <h2 className="text-2xl font-medium text-gray-800">
                    Employee Attendance of {employeeTitle} {employee.username}
                  </h2>
                  <p className="text-gray-600 mt-2">
                    {employee.mainPosition || 'Position Not Set'}
                  </p>
                </div>
              )}
              <div className="flex flex-col mt-6">
                <div className="topbar-table flex justify-between items-center p-3 bg-gray-50 rounded-t-lg">
                  <div className="dropdowns flex gap-3">
                    <select
                      value={year}
                      className="px-4 py-2 rounded-md font-semibold bg-white border border-gray-300 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onChange={(e) => setYear(parseInt(e.target.value, 10))}
                    >
                      {[...Array(5)].map((_, index) => (
                        <option key={index} value={new Date().getFullYear() - index}>
                          {new Date().getFullYear() - index}
                        </option>
                      ))}
                    </select>
                    <select
                      className="px-4 py-2 rounded-md font-semibold bg-white border border-gray-300 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={month}
                      onChange={(e) => setMonth(parseInt(e.target.value, 10))}
                    >
                      {[...Array(12)].map((_, index) => (
                        <option key={index} value={index + 1}>
                          {index + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="actions flex items-center gap-3">
                    <button
                      onClick={exportToPDF}
                      className="px-4 py-2 flex items-center gap-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <FaFileDownload className="text-gray-600" />
                      Export Individual PDF
                    </button>

                    <button
                      onClick={exportAllEmployeesAttendance}
                      className="px-4 py-2 flex items-center gap-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <FaUsers className="text-gray-600" />
                      Export All Employees
                    </button>
                    
                    <button 
                      className={`px-4 py-2 flex items-center gap-2 rounded-md text-sm font-medium transition-colors
                        ${isApproving || selectedRecords.length === 0
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-green-50 text-green-700 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500'
                        }`}
                      onClick={handleApprove}
                      disabled={isApproving || selectedRecords.length === 0}
                    >
                      <FaCheck className={isApproving || selectedRecords.length === 0 ? 'text-gray-400' : 'text-green-600'} />
                      {isApproving ? 'Approving...' : 'Approve'}
                    </button>
                    
                    <button 
                      className={`px-4 py-2 flex items-center gap-2 rounded-md text-sm font-medium transition-colors
                        ${isDeclining || selectedRecords.length === 0
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-red-50 text-red-700 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500'
                        }`}
                      onClick={handleDecline}
                      disabled={isDeclining || selectedRecords.length === 0}
                    >
                      <FaTimes className={isDeclining || selectedRecords.length === 0 ? 'text-gray-400' : 'text-red-600'} />
                      {isDeclining ? 'Declining...' : 'Decline'}
                    </button>
                  </div>
                </div>
                <div className="flex flex-col mt-4 mb-6">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Month Summary */}
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-blue-800">Monthly Summary</h3>
                        <p className="text-sm text-blue-600 mt-2">
                          Total Days: {filteredAttendance.length}
                        </p>
                        <p className="text-sm text-blue-600">
                          Present Days: {filteredAttendance.filter(record => record.checkin_Time).length}
                        </p>
                        <p className="text-sm text-blue-600">
                          Absent Days: {filteredAttendance.filter(record => !record.checkin_Time).length}
                        </p>
                      </div>

                      {/* Average Timings */}
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-green-800">Average Timings</h3>
                        <p className="text-sm text-green-600 mt-2">
                          Average Check-in: {avgTimings.hours}:{String(avgTimings.minutes).padStart(2, '0')}
                        </p>
                      </div>

                      {/* Status Summary */}
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-purple-800">Status Summary</h3>
                        <p className="text-sm text-purple-600 mt-2">
                          On Time: {filteredAttendance.filter(record => getCheckinStatus(record.checkin_Time, record.checkout_Time) === 'ontime').length}
                        </p>
                        <p className="text-sm text-purple-600">
                          Late: {filteredAttendance.filter(record => getCheckinStatus(record.checkin_Time, record.checkout_Time) === 'late').length}
                        </p>
                        <p className="text-sm text-purple-600">
                          Early Departure: {filteredAttendance.filter(record => getCheckinStatus(record.checkin_Time, record.checkout_Time) === 'early departure').length}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                    <div className="overflow-hidden border border-gray-200 md:rounded-lg">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              <input
                                type="checkbox"
                                className="form-checkbox"
                                onChange={handleSelectAll}
                                checked={selectedRecords.length === filteredAttendance.length}
                              />
                            </th>
                            <th 
                              scope="col" 
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                            >
                              Date
                              <span className="ml-1">
                                {sortOrder === 'asc' ? '▲' : '▼'}
                              </span>
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Check-in Time
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Check-out Time
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Total Working Time
                            </th>
                  
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Approval Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Reports
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {sortByDate(filteredAttendance).map((record) => (
                            <tr key={record.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                <input
                                  type="checkbox"
                                  className="form-checkbox"
                                  checked={selectedRecords.includes(record)}
                                  onChange={() => handleSelectRecord(record)}
                                />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatIndianDate(record.date)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatIndianTime(record.checkin_Time)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {record.checkout_Time ? formatIndianTime(record.checkout_Time) : '---'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  record.checkin_Time && record.checkout_Time 
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {calculateWorkingHours(record.checkin_Time, record.checkout_Time)}
                                </span>
                              </td>
                          
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  record.status === 'approved' 
                                    ? 'bg-green-100 text-green-800'
                                    : record.status === 'declined'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {record.status?.toUpperCase() || 'PENDING'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-normal text-sm text-gray-500">
                                {renderReport(record.reports)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
      <Footer />
    </>
  );
};

export default SingleEmployeeAttendance;
