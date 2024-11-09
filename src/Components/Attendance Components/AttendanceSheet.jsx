import React, { useState, useEffect } from 'react';
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

const AttendanceSheet = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [filteredData, setFilteredData] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const adminEmail = Cookies.get('email');

  useEffect(() => {
    fetchAttendanceData();
    fetchDepartments();
  }, [year, month]);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${config.apiUrl}/qubinest/allAttendance/${year}/${month}`
      );

      // Group attendance records by employeeId
      const groupedData = response.data.reduce((acc, record) => {
        if (!acc[record.employeeId]) {
          acc[record.employeeId] = {
            employeeId: record.employeeId,
            employeeName: record.employeeName,
            companyEmail: record.companyEmail,
            department: record.department,
            profileImage: record.profileImage,
            records: [],
            presentDays: 0,
            absentDays: 0,
            lateDays: 0,
            averageCheckin: 'N/A'
          };
        }
        acc[record.employeeId].records.push(record);
        return acc;
      }, {});

      // Calculate statistics for each employee
      const processedData = await Promise.all(
        Object.values(groupedData).map(async (employee) => {
          try {
            // Get average working time
            const avgTimeResponse = await axios.get(
              `${config.apiUrl}/qubinest/allAttendance/${employee.employeeId}`
            );

            // Calculate attendance metrics
            const metrics = employee.records.reduce(
              (acc, record) => {
                // Present Days
                if (record.status === 'approved') {
                  acc.presentDays++;
                }

                // Absent Days (no check-in)
                if (!record.checkin_Time) {
                  acc.absentDays++;
                }

                // Late Days
                if (record.checkin_Time) {
                  const checkinTime = new Date(record.checkin_Time);
                  const lateThreshold = new Date(checkinTime);
                  lateThreshold.setHours(9, 30, 0); // 9:30 AM threshold
                  if (checkinTime > lateThreshold) {
                    acc.lateDays++;
                  }
                }

                return acc;
              },
              { presentDays: 0, absentDays: 0, lateDays: 0 }
            );

            return {
              ...employee,
              ...metrics,
              averageCheckin: avgTimeResponse.data.averageCheckinTime || 'N/A',
              totalDays: employee.records.length
            };
          } catch (error) {
            console.error(`Error processing employee ${employee.employeeId}:`, error);
            return employee;
          }
        })
      );

      setAttendance(processedData);
      setFilteredData(processedData);
    } catch (error) {
      toast.error('Failed to fetch attendance data');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/qubinest/departments`);
      setDepartments(response.data);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
      toast.error('Failed to load departments');
    }
  };

  const handleDepartmentFilter = (dept) => {
    setSelectedDepartment(dept);
    if (dept === 'all') {
      setFilteredData(attendance);
    } else {
      setFilteredData(attendance.filter(item => item.department === dept));
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
  const renderAttendanceRow = (record) => (
    <tr key={record.employeeId}>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            {record.profileImage ? (
              <img
                className="h-10 w-10 rounded-full"
                src={record.profileImage}
                alt={record.employeeName || 'Employee'}
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                {(record.employeeName || 'N/A').charAt(0)}
              </div>
            )}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {record.employeeName || 'N/A'}
            </div>
            <div className="text-sm text-gray-500">
              {record.companyEmail || 'N/A'}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {record.department || 'N/A'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
          {record.presentDays} / {record.totalDays} 
          ({((record.presentDays / record.totalDays) * 100).toFixed(1)}%)
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
          {record.absentDays} / {record.totalDays}
          ({((record.absentDays / record.totalDays) * 100).toFixed(1)}%)
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
          {record.lateDays} / {record.totalDays}
          ({((record.lateDays / record.totalDays) * 100).toFixed(1)}%)
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {record.averageCheckin}
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

  // Add a useEffect to restore filters when coming back from single view
  useEffect(() => {
    const savedFilters = localStorage.getItem('attendanceFilters');
    if (savedFilters) {
      const { year: savedYear, month: savedMonth, selectedDepartment: savedDept } = JSON.parse(savedFilters);
      setYear(savedYear);
      setMonth(savedMonth);
      setSelectedDepartment(savedDept);
      localStorage.removeItem('attendanceFilters'); // Clear after restoring
    }
  }, []);

  return (
    <>
      <Header />
      <Sidemenu />
      <div className="content-wrapper p-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Header Section */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Attendance Sheet</h1>
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiDownload className="w-5 h-5" />
              Export to Excel
            </button>
          </div>

          {/* Filters Section */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-2">
              <FiCalendar className="text-gray-500" />
              <select
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                className="p-2 border rounded-md"
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
                className="p-2 border rounded-md"
              >
                {Array.from({ length: 5 }, (_, i) => (
                  <option key={i} value={new Date().getFullYear() - i}>
                    {new Date().getFullYear() - i}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <FiFilter className="text-gray-500" />
              <select
                value={selectedDepartment}
                onChange={(e) => handleDepartmentFilter(e.target.value)}
                className="p-2 border rounded-md"
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.name}>
                    {dept.name}
                  </option>
                ))}
              </select>
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
                      Average Check-in
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData.map(renderAttendanceRow)}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AttendanceSheet; 