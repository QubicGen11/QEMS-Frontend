import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Header from '../Homepage Components/Header';
import Sidemenu from '../Homepage Components/Sidemenu';
import Footer from '../Homepage Components/Footer';
import { FiClock, FiCalendar, FiUsers, FiAlertCircle, FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import LoadingSkeleton from './LoadingSkeleton';
import config from '../config';
import Cookies from 'js-cookie';
import * as XLSX from 'xlsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExcel, faFilter, faTimes, faSearch, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

const TodaysAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    lateToday: 0,
    absentToday: 0
  });
  const [filters, setFilters] = useState({
    department: '',
    position: '',
    status: 'all',
    searchQuery: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [departments, setDepartments] = useState(['All']);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchTodaysAttendance();
  }, []);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get(`${config.apiUrl}/qubinest/employees/departments`, {
          headers: {
            'Authorization': `Bearer ${Cookies.get('token')}`,
            'Content-Type': 'application/json'
          }
        });
        setDepartments(['All', ...response.data]);
      } catch (error) {
        console.error('Error fetching departments:', error);
        toast.error('Failed to fetch departments');
      }
    };

    fetchDepartments();
  }, []);

  const fetchTodaysAttendance = async () => {
    try {
      setLoading(true);
      console.log('Fetching attendance data...');
      
      const response = await axios.get(`${config.apiUrl}/qubinest/todaysAttendance`, {
        headers: {
          'Authorization': `Bearer ${Cookies.get('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Response received:', response.data);

      if (!response.data) {
        throw new Error('No data received from server');
      }

      const processedData = response.data.map(record => ({
        ...record,
        checkinStatus: getCheckinStatus(record.checkin_Time),
        formattedCheckin: formatTime(record.checkin_Time),
        formattedCheckout: formatTime(record.checkout_Time),
        email: record.employeeId || record.employeeId || 'N/A'
      }));

      console.log('Processed data:', processedData);

      // Calculate statistics
      const stats = {
        totalEmployees: processedData.length,
        presentToday: processedData.filter(r => r.checkin_Time).length,
        lateToday: processedData.filter(r => 
          r.checkin_Time && getCheckinStatus(r.checkin_Time) === 'late'
        ).length,
        absentToday: processedData.filter(r => !r.checkin_Time).length
      };

      setStats(stats);
      setAttendance(processedData);

    } catch (error) {
      console.error('Error fetching today\'s attendance:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      toast.error(
        error.response?.data?.details || 
        'Failed to load today\'s attendance. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const getCheckinStatus = (checkinTime) => {
    if (!checkinTime) return 'absent';
    
    const checkin = new Date(checkinTime);
    const targetTime = new Date(checkin);
    targetTime.setHours(10, 30, 0); // Set target time to 10:30 AM
    
    return checkin > targetTime ? 'late' : 'ontime';
  };

  const getCheckoutStatus = (checkoutTime) => {
    if (!checkoutTime) return 'pending';
    
    const checkout = new Date(checkoutTime);
    const targetTime = new Date(checkout);
    targetTime.setHours(17, 0, 0); // Set target time to 5:00 PM
    
    return checkout < targetTime ? 'early' : 'complete';
  };

  const formatTime = (time) => {
    if (!time) return '---';
    return new Date(time).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ontime': return 'bg-green-100 text-green-800';
      case 'late': return 'bg-yellow-100 text-yellow-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'early': return 'bg-orange-100 text-orange-800';
      case 'complete': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Add this helper function to calculate working hours
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

  // Add export to Excel function
  const exportToExcel = () => {
    const dataToExport = attendance.map(record => ({
      'Employee ID': record.employeeId,
      'Name': record.employeeName,
      'Role': record.role || 'N/A',
      'Email': record.email,
      'Department': record.department || 'N/A',
      'Check-in Time': record.formattedCheckin,
      'Check-out Time': record.formattedCheckout,
      'Status': record.checkinStatus
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance');
    XLSX.writeFile(wb, 'todays_attendance.xlsx');
  };

  // Enhanced filter function
  const filteredAttendance = useMemo(() => {
    return attendance.filter(record => {
      // Department filter
      const departmentMatch = 
        !filters.department || 
        filters.department === 'All' || 
        record.department === filters.department;

      // Position filter
      const positionMatch = 
        !filters.position ||
        filters.position === 'All' || 
        record.mainPosition === filters.position;

      // Status filter
      const statusMatch = 
        filters.status === 'all' || 
        record.checkinStatus === filters.status;

      // Search filter (ID, Name, Email)
      const searchMatch = 
        !filters.searchQuery ||
        record.employeeId.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        record.employeeName.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        (record.email && record.email.toLowerCase().includes(filters.searchQuery.toLowerCase()));

      return departmentMatch && positionMatch && statusMatch && searchMatch;
    });
  }, [attendance, filters]);

  // Add this helper function to check if any filters are active
  const isAnyFilterActive = () => {
    return filters.searchQuery !== '' || 
           filters.department !== '' || 
           filters.status !== 'all' || 
           filters.position !== 'All';
  };

  // Add this pagination logic
  const indexOfLastRecord = currentPage * rowsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - rowsPerPage;
  const currentRecords = filteredAttendance.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredAttendance.length / rowsPerPage);

  return (
    <>
      <Header />
      <Sidemenu />
      <div className="content-wrapper p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Today's Attendance</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faFilter} />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            <button
              onClick={exportToExcel}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faFileExcel} />
              Export to Excel
            </button>
          </div>
        </div>

        {/* Filters Section */}
        {showFilters && (
          <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
              {/* Search Filter */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">
                  Search (ID, Name, Email)
                </label>
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faSearch} className="text-gray-500" />
                  <input
                    className="border rounded-md px-3 py-1.5 text-gray-700 w-full"
                    value={filters.searchQuery}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      searchQuery: e.target.value 
                    }))}
                  />
                </div>
              </div>

              {/* Position Filter */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">
                  Filter by Position
                </label>
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faFilter} className="text-gray-500" />
                  <select
                    className="border rounded-md px-3 py-1.5 text-gray-700 w-full"
                    value={filters.position}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      position: e.target.value 
                    }))}
                  >
                    <option value="All">All Positions</option>
                    {[...new Set(attendance.map(item => item.mainPosition))].map((position) => (
                      <option key={position} value={position}>
                        {position || 'N/A'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Department Filter */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">
                  Filter by Department
                </label>
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faFilter} className="text-gray-500" />
                  <select
                    className="border rounded-md px-3 py-1.5 text-gray-700 w-full"
                    value={filters.department}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      department: e.target.value 
                    }))}
                  >
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status Filter */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">
                  Filter by Status
                </label>
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faFilter} className="text-gray-500" />
                  <select
                    className="border rounded-md px-3 py-1.5 text-gray-700 w-full"
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      status: e.target.value 
                    }))}
                  >
                    <option value="all">All</option>
                    <option value="ontime">On Time</option>
                    <option value="late">Late</option>
                    <option value="absent">Absent</option>
                  </select>
                </div>
              </div>

              {/* Clear Filters Button */}
              <div className="flex flex-col justify-end">
                <button
                  onClick={() => setFilters({ 
                    department: '', 
                    position: '',
                    status: 'all', 
                    searchQuery: '' 
                  })}
                  disabled={!isAnyFilterActive()}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-md transition-colors w-40
                    ${isAnyFilterActive() 
                      ? 'bg-blue-400 text-black hover:bg-blue-100' 
                      : 'bg-gray-50 text-gray-400 cursor-not-allowed'}`}
                >
                  <FontAwesomeIcon icon={faTimes} />
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Attendance Table */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {loading ? (
            <LoadingSkeleton />
          ) : (
            <>
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
                        Check-in Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Check-out Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Working Time
                      </th>
                      {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Check-in Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Check-out Status
                      </th> */}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Position
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentRecords.map((record) => (
                      <tr key={record.employeeId}>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {record.profileImage ? (
                                <img
                                  className="h-10 w-10 rounded-full object-cover"
                                  src={record.profileImage}
                                  alt=""
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                                  {record.employeeName?.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {record.employeeName}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">{record.email}</span>
                                <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
                                  {record.role || 'N/A'}
                                </span>
                              </div>
                              <div className="text-xs text-gray-400">
                                ID: {record.employeeId}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.department || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.formattedCheckin}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.formattedCheckout}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{calculateWorkingHours(record.checkin_Time, record.checkout_Time)}</td>
                        {/* <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(record.checkinStatus)}`}>
                            {record.checkinStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(getCheckoutStatus(record.checkout_Time))}`}>
                            {getCheckoutStatus(record.checkout_Time)}
                          </span>
                        </td> */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {record.mainPosition || 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

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
                    Page {currentPage} of {totalPages}
                  </span>
                  <span className="ml-2 text-gray-500">({filteredAttendance.length} records)</span>
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

                    <div className="flex items-center px-4 bg-white text-sm text-gray-700">
                      Page {currentPage} of {totalPages}
                      <span className="ml-2 text-gray-500">({filteredAttendance.length} records)</span>
                    </div>

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
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

// Stat Card Component
const StatCard = ({ icon, title, value, color }) => (
  <div className="bg-white rounded-lg shadow p-6 flex items-center">
    <div className={`${color} text-white p-3 rounded-lg mr-4`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-600">{title}</p>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  </div>
);

export default TodaysAttendance;
