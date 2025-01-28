import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Header from '../Homepage Components/Header';
import Sidemenu from '../Homepage Components/Sidemenu';
import Footer from '../Homepage Components/Footer';
import { FiDownload, FiFilter, FiCalendar } from 'react-icons/fi';
import * as XLSX from 'xlsx';
import LoadingSkeleton from './LoadingSkeleton';
import config from '../config';
import Cookies from 'js-cookie';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const AttendanceSheet = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const adminEmail = Cookies.get('email');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchAttendanceData();
  }, [year, month]);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${config.apiUrl}/qubinest/allAttendance/${year}/${month}`
      );
  
      const attendanceData = response.data.attendance || response.data;
      
      if (!Array.isArray(attendanceData)) {
        console.error('Expected array but got:', attendanceData);
        setAttendance([]);
        setFilteredData([]);
        return;
      }
  
      // Get current date
      const today = new Date();
      const currentDay = today.getDate();
  
      const groupedData = attendanceData.reduce((acc, record) => {
        if (!acc[record.employeeId]) {
          acc[record.employeeId] = {
            employeeId: record.employeeId,
            employeeName: record.employeeName,
            companyEmail: record.companyEmail,
            department: record.department || 'N/A',
            profileImage: record.profileImage,
            records: [],
            presentDays: 0,
            absentDays: 0,
            lateDays: 0,
            totalDays: 1,
            averageCheckin: 'N/A'
          };
        }
  
        // Add record to records array
        acc[record.employeeId].records.push(record);
  
        // Count today's attendance
        if (record.date) {
          const recordDate = new Date(record.date);
          if (recordDate.getDate() === currentDay) {
            if (record.checkin_Time) {
              const checkinTime = new Date(record.checkin_Time);
              // Check if late (after 9:30 AM)
              if (checkinTime.getHours() > 9 || 
                  (checkinTime.getHours() === 9 && checkinTime.getMinutes() > 30)) {
                acc[record.employeeId].lateDays = 1;
              } else {
                acc[record.employeeId].presentDays = 1;
              }
            } else {
              acc[record.employeeId].absentDays = 1;
            }
          }
        }
  
        return acc;
      }, {});
  
      // Calculate average check-in time
      Object.values(groupedData).forEach(employee => {
        const validCheckins = employee.records
          .filter(r => r.checkin_Time)
          .map(r => new Date(r.checkin_Time));
  
        if (validCheckins.length > 0) {
          const totalMinutes = validCheckins.reduce((sum, date) => {
            return sum + date.getHours() * 60 + date.getMinutes();
          }, 0);
          
          const avgMinutes = Math.round(totalMinutes / validCheckins.length);
          const hours = Math.floor(avgMinutes / 60);
          const minutes = avgMinutes % 60;
          
          employee.averageCheckin = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        }
      });
  
      setAttendance(Object.values(groupedData));
      setFilteredData(Object.values(groupedData));
    } catch (error) {
      toast.error('Failed to fetch attendance data');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique departments from attendance data
  const departments = useMemo(() => {
    const uniqueDepartments = [...new Set(attendance.map(item => item.department))];
    return uniqueDepartments
      .filter(dept => dept) // Remove null/undefined values
      .sort((a, b) => a.localeCompare(b)); // Sort alphabetically
  }, [attendance]);

  const handleDepartmentFilter = (dept) => {
    setSelectedDepartment(dept);
    if (dept === 'all') {
      setFilteredData(attendance);
    } else {
      const filtered = attendance.filter(item => 
        item.department?.toLowerCase() === dept.toLowerCase()
      );
      setFilteredData(filtered);
    }
  };

  const exportToExcel = () => {
    const exportData = filteredData.map(record => ({
      'Employee Name': record.employeeName,
      'Employee ID': record.employeeId,
      'Department': record.department,
      'Present Days': record.presentDays,
      'Absent Days': record.absentDays,
      'Late Days': record.lateDays,
      'Average Check-in': record.averageCheckin,
      'Status': record.status
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance Sheet");
    XLSX.writeFile(wb, `Attendance_${year}_${month}.xlsx`);
  };

  const handleViewDetails = (employeeId, companyEmail) => {
    try {
      // Store the current filters in localStorage for back navigation
      localStorage.setItem('attendanceFilters', JSON.stringify({
        year,
        month,
        selectedDepartment
      }));

      // Navigate to single employee view with both ID and email
      window.location.href = `/singleemployeeattendance/${employeeId}?email=${encodeURIComponent(companyEmail)}`;
    } catch (error) {
      console.error('Error navigating to employee details:', error);
      toast.error('Failed to view employee details');
    }
  };

  // Update the table row to show total days and percentages
  const renderAttendanceRow = (record) => {
    // Split the full name into first and last name
    const nameParts = (record.employeeName || 'N/A').split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');

    return (
      <tr key={record.employeeId}>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10">
              {record.profileImage ? (
                <img
                  className="h-10 w-10 rounded-full object-cover"
                  src={record.profileImage}
                  alt={record.employeeName || 'Employee'}
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                  {firstName.charAt(0)}
                  {lastName ? lastName.charAt(0) : ''}
                </div>
              )}
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium">
                <span className="text-blue-600">{firstName}</span>
                {lastName && (
                  <span className="text-gray-900">{' '}{lastName}</span>
                )}
              </div>
              <div className="text-sm text-gray-500">
                {record.companyEmail || 'N/A'}
              </div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className="px-2 py-1 text-sm rounded-full bg-purple-100 text-purple-800">
            {record.department || 'N/A'}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
            {record.presentDays} / {record.totalDays}
            <span className="ml-1">
              ({((record.presentDays / record.totalDays) * 100).toFixed(1)}%)
            </span>
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
            {record.absentDays} / {record.totalDays}
            <span className="ml-1">
              ({((record.absentDays / record.totalDays) * 100).toFixed(1)}%)
            </span>
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
            {record.lateDays} / {record.totalDays}
            <span className="ml-1">
              ({((record.lateDays / record.totalDays) * 100).toFixed(1)}%)
            </span>
          </span>
        </td>
      
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
          <button
            onClick={() => handleViewDetails(record.employeeId, record.companyEmail)}
            className="inline-flex items-center px-3 py-1.5 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
          >
            <span className="mr-2">View Details</span>
            <svg 
              className="w-4 h-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 5l7 7-7 7" 
              />
            </svg>
          </button>
        </td>
      </tr>
    );
  };

  // Add pagination logic
  const indexOfLastRecord = currentPage * rowsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - rowsPerPage;
  const currentRecords = filteredData.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  return (
    <>
      <Header />
      <Sidemenu />
      <div className="content-wrapper ">
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Header Section */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Attendance Sheet</h1>
            <button
              onClick={exportToExcel}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <FiDownload className="mr-2" />
              Export to Excel
            </button>
          </div>

          {/* Updated Filters Section */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center space-x-2">
              <FiCalendar className="text-gray-500" />
              <select
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2024, i, 1).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
              <select
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Array.from({ length: 5 }, (_, i) => (
                  <option key={i} value={new Date().getFullYear() - i}>
                    {new Date().getFullYear() - i}
                  </option>
                ))}
              </select>
            </div>

            {/* Updated Department Filter */}
            <div className="relative">
              <div className="flex items-center space-x-2">
                <FiFilter className="text-gray-500" />
                <select
                  value={selectedDepartment}
                  onChange={(e) => handleDepartmentFilter(e.target.value)}
                  className="p-2 pr-8 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
              {selectedDepartment !== 'all' && (
                <div className="mt-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                    {selectedDepartment}
                    <button
                      onClick={() => handleDepartmentFilter('all')}
                      className="ml-2 focus:outline-none"
                    >
                      ×
                    </button>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Attendance Table */}
          {loading ? (
            <LoadingSkeleton />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Present Days
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Absent Days
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Late Days
                    </th>
                
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentRecords.map(renderAttendanceRow)}
                </tbody>
              </table>

              {/* Pagination Controls */}
              <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4">
                <div className="flex items-center">
                  <span className="text-sm text-gray-700 mr-4">Rows per page:</span>
                  <select
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                  >
                    {[10, 25, 50].map((pageSize) => (
                      <option key={pageSize} value={pageSize}>
                        {pageSize}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700">
                    Page {currentPage} of {totalPages} ({filteredData.length} total records)
                  </span>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                        currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <span className="sr-only">Previous</span>
                      <FontAwesomeIcon icon={faChevronLeft} className="h-3 w-3" />
                    </button>

                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                        currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <span className="sr-only">Next</span>
                      <FontAwesomeIcon icon={faChevronRight} className="h-3 w-3" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AttendanceSheet; 