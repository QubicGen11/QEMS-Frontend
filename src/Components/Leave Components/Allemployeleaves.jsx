import React, { useState, useEffect, useMemo } from "react";
import Header from "../Homepage Components/Header";
import Sidemenu from "../Homepage Components/Sidemenu";
import Footer from "../Homepage Components/Footer";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCalendarAlt, faCheckSquare, faHashtag, faInfoCircle, faFileAlt, faPersonThroughWindow } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import Cookies from 'js-cookie';
import config from "../config";
import { Checkbox } from '@mui/material';
import { toast } from 'react-hot-toast';

const Allemployeleaves = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const companyEmail = Cookies.get('email');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequests, setSelectedRequests] = useState([]);
  const [filters, setFilters] = useState({
    employeeId: '',
    email: '',
    leaveType: '',
    startDate: '',
    endDate: '',
    status: '',
    duration: '',
    noOfDays: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const uniqueLeaveTypes = useMemo(() => {
    if (!leaveRequests) return [];
    return [...new Set(leaveRequests.map(request => request.leaveType))].filter(Boolean);
  }, [leaveRequests]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      employeeId: '',
      email: '',
      leaveType: '',
      startDate: '',
      endDate: '',
      status: '',
      duration: '',
      noOfDays: ''
    });
  };

  const filteredLeaveRequests = useMemo(() => {
    if (!leaveRequests) return [];
    
    return leaveRequests
      .filter(request => {
        if (request.employee_id === 'N/A' || !request.employee_id) {
          return false;
        }

        const matchesEmployeeId = request?.employee_id?.toString().toLowerCase().includes(filters.employeeId.toLowerCase());
        const matchesEmail = request?.employeeEmail?.toLowerCase().includes(filters.email.toLowerCase());
        
        const matchesLeaveType = filters.leaveType === 'All Types' || filters.leaveType === '' || 
                                request?.leaveType?.toLowerCase() === filters.leaveType.toLowerCase();
        
        const matchesStatus = !filters.status || request?.status === filters.status;
        const matchesDuration = !filters.duration || request?.duration?.toLowerCase() === filters.duration.toLowerCase();
        const matchesNoOfDays = !filters.noOfDays || request?.noOfDays === parseInt(filters.noOfDays);
        
        let matchesDateRange = true;
        if (filters.startDate && filters.endDate) {
          const requestStart = new Date(request.leaveFrom);
          const requestEnd = new Date(request.leaveTo);
          const filterStart = new Date(filters.startDate);
          const filterEnd = new Date(filters.endDate);
          
          matchesDateRange = requestStart >= filterStart && requestEnd <= filterEnd;
        }

        return matchesEmployeeId && 
               matchesEmail && 
               matchesLeaveType && 
               matchesDateRange && 
               matchesStatus && 
               matchesDuration && 
               matchesNoOfDays;
      })
      .sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (a.status !== 'pending' && b.status === 'pending') return 1;
        return new Date(b.leaveFrom || 0) - new Date(a.leaveFrom || 0);
      });
  }, [leaveRequests, filters]);

  const fetchLeaveRequests = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${config.apiUrl}/qubinest/allleaverequests`);
      
      const formattedRequests = response.data.map(request => ({
        id: request.leave_id,
        employee_id: request.employee_id || 'N/A',
        employeeEmail: request.companyEmail || 'N/A',
        leaveType: request.leaveType || 'N/A',
        leaveFrom: request.startDate,  // Keep original date format
        leaveTo: request.endDate,      // Keep original date format
        duration: request.duration || 'N/A',
        noOfDays: request.startDate && request.endDate 
          ? Math.ceil(Math.abs(new Date(request.endDate) - new Date(request.startDate)) / (1000 * 60 * 60 * 24)) + 1
          : 0,
        status: request.status?.toLowerCase() || 'pending',
        reason: request.reason || 'No reason provided',
        createdAt: request.createdAt,
        updatedAt: request.updatedAt
      }));

      setLeaveRequests(formattedRequests);
    } catch (error) {
      console.error("Error fetching leave requests:", error);
      setError("Failed to fetch leave requests");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const handleStatusChange = async (leaveId, newStatus, employeeEmail) => {
    try {
      const endpoint = newStatus === "Approved" ? "approveleaves" : "declineleaves";
      
      console.log('Sending request:', {
        companyEmail,
        employeeEmail,
        leaveId: parseInt(leaveId)
      });

      // First, update the leave status
      const response = await axios.post(`${config.apiUrl}/qubinest/${endpoint}`, {
        companyEmail,
        employeeEmail,
        leaveId: parseInt(leaveId)
      });

      if (response.data.success) {
        // Find the leave request details
        const leaveRequest = leaveRequests.find(req => req.id === leaveId);
        
        // Create notification using the test endpoint that we know works
        try {
          await axios.post(`${config.apiUrl}/qubinest/notifications/create`, {
            employeeId: leaveRequest.employee_id,
            message: `Your leave request from ${leaveRequest.leaveFrom} to ${leaveRequest.leaveTo} has been ${newStatus.toLowerCase()}`,
            type: newStatus === "Approved" ? "LEAVE_APPROVED" : "LEAVE_REJECTED",
            isRead: false
          });
          
          console.log('Notification created successfully');
        } catch (notifError) {
          console.error('Error creating notification:', notifError);
        }

        // Update UI
        setLeaveRequests(prevRequests => 
          prevRequests.map(request => 
            request.id === leaveId 
              ? { 
                  ...request, 
                  status: newStatus.toLowerCase()
                } 
              : request
          )
        );
        
        alert(`Leave request ${newStatus.toLowerCase()} successfully`);
        await fetchLeaveRequests();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert(error.response?.data?.message || 'Failed to update leave status');
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const allIds = filteredLeaveRequests.map(request => request.id);
      setSelectedRequests(allIds);
    } else {
      setSelectedRequests([]);
    }
  };

  const handleSelectRequest = (requestId) => {
    setSelectedRequests(prev => {
      if (prev.includes(requestId)) {
        return prev.filter(id => id !== requestId);
      } else {
        return [...prev, requestId];
      }
    });
  };

  const handleBulkAction = async (action) => {
    if (selectedRequests.length === 0) {
      toast.warning('Please select at least one request');
      return;
    }

    const confirmMessage = `Are you sure you want to ${action.toLowerCase()} ${selectedRequests.length} selected request(s)?`;
    if (!window.confirm(confirmMessage)) return;

    try {
      for (const requestId of selectedRequests) {
        const request = filteredLeaveRequests.find(r => r.id === requestId);
        await handleStatusChange(requestId, action, request.employeeEmail);
      }
      
      setSelectedRequests([]); // Clear selections after action
      toast.success(`Successfully ${action.toLowerCase()} ${selectedRequests.length} request(s)`);
    } catch (error) {
      toast.error(`Failed to ${action.toLowerCase()} some requests`);
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredLeaveRequests.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLeaveRequests.length / itemsPerPage);

  const leaveTypes = [
    'All Types',
    'Personal',
    'Casual',
    'sick' // Keep only one version of sick leave
  ];

  return (
    <div>
      <Header />
      <Sidemenu />
      <div className="content-wrapper">
        <section className="container mx-auto p-4">
          <h2 className="text-lg font-bold mb-3">Leave Requests</h2>

          {/* Filters Section */}
          <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Employee ID Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee ID
                </label>
                <input
                  type="text"
                  name="employeeId"
                  value={filters.employeeId}
                  onChange={handleFilterChange}
                  placeholder="Search by ID"
                  className="w-full p-2 border rounded-md"
                />
              </div>

              {/* Email Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="text"
                  name="email"
                  value={filters.email}
                  onChange={handleFilterChange}
                  placeholder="Search by email"
                  className="w-full p-2 border rounded-md"
                />
              </div>

              {/* Leave Type Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Leave Type</label>
                <select
                  name="leaveType"
                  value={filters.leaveType}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  {leaveTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Range Filters */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  className="w-full p-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  className="w-full p-2 border rounded-md"
                />
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {/* Duration Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration
                </label>
                <select
                  name="duration"
                  value={filters.duration}
                  onChange={handleFilterChange}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">All Duration</option>
                  <option value="full day">Full Day</option>
                  <option value="half day">Half Day</option>
                </select>
              </div>

              {/* Number of Days Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Days
                </label>
                <input
                  type="number"
                  name="noOfDays"
                  value={filters.noOfDays}
                  onChange={handleFilterChange}
                  placeholder="Filter by days"
                  min="0"
                  className="w-full p-2 border rounded-md"
                />
              </div>
            </div>

            {/* Clear Filters Button */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="bg-gray-100 text-gray-600 px-4 py-2 rounded-md hover:bg-gray-200"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Bulk Actions Section */}
          {selectedRequests.length > 0 && (
            <div className="mb-4 flex justify-end gap-2">
              <button
                onClick={() => handleBulkAction('Approved')}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              >
                Approve Selected ({selectedRequests.length})
              </button>
              <button
                onClick={() => handleBulkAction('Rejected')}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
              >
                Reject Selected ({selectedRequests.length})
              </button>
            </div>
          )}

          {/* Results Count */}
          <div className="mb-4 text-sm text-gray-600">
            Showing {filteredLeaveRequests.length} results
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="py-3 px-6">Select</th>
                    <th className="py-3 px-6">Employee ID</th>
                    <th className="py-3 px-6">Email</th>
                    <th className="py-3 px-6">Leave Type</th>
                    <th className="py-3 px-6">Duration</th>
                    <th className="py-3 px-6">From</th>
                    <th className="py-3 px-6">To</th>
                    <th className="py-3 px-6">Days</th>
                    <th className="py-3 px-6">Reason</th>
                    <th className="py-3 px-6">Status</th>
                    <th className="py-3 px-6">Created At</th>
                  
                    <th className="py-3 px-6">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((request) => (
                    <tr key={request.id} className="bg-white border-b hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <Checkbox
                          checked={selectedRequests.includes(request.id)}
                          onChange={() => handleSelectRequest(request.id)}
                          disabled={
                            request.status === 'approved' || 
                            request.status === 'rejected'
                          }
                        />
                      </td>
                      <td className="py-4 px-6">{request.employee_id}</td>
                      <td className="py-4 px-6">{request.employeeEmail}</td>
                      <td className="py-4 px-6">{request.leaveType}</td>
                      <td className="py-4 px-6">{request.duration}</td>
                      <td className="py-4 px-6">{formatDateTime(request.leaveFrom)}</td>
                      <td className="py-4 px-6">{formatDateTime(request.leaveTo)}</td>
                      <td className="py-4 px-6">{request.noOfDays}</td>
                      <td className="py-4 px-6">
                        <div className="max-w-xs truncate" title={request.reason}>
                          {request.reason}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          request.status === 'approved' ? 'bg-green-100 text-green-800' :
                          request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-6">{formatDateTime(request.createdAt)}</td>
                    
                      <td className="py-4 px-6">
                        <div className="flex gap-2">
                          <button 
                            className={`px-3 py-1 rounded text-sm ${
                              request.status === 'approved' 
                                ? 'bg-gray-300 cursor-not-allowed text-gray-600' 
                                : 'bg-green-500 hover:bg-green-600 text-white'
                            }`}
                            onClick={() => handleStatusChange(request.id, "Approved", request.employeeEmail)}
                            disabled={request.status === 'approved'}
                          >
                            Approve
                          </button>
                          <button 
                            className={`px-3 py-1 rounded text-sm ${
                              request.status === 'rejected' 
                                ? 'bg-gray-300 cursor-not-allowed text-gray-600' 
                                : 'bg-red-500 hover:bg-red-600 text-white'
                            }`}
                            onClick={() => handleStatusChange(request.id, "Rejected", request.employeeEmail)}
                            disabled={request.status === 'rejected'}
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">


                      {/* Showing entries info */}
                      <div className="text-sm text-gray-600">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredLeaveRequests.length)} of {filteredLeaveRequests.length} entries
            </div>
            {/* Items per page dropdown */}
            



            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                Previous
              </button>

              {/* Page numbers */}
              <div className="flex space-x-1">
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => handlePageChange(index + 1)}
                    className={`px-3 py-1 rounded ${
                      currentPage === index + 1
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-gray-700 border hover:bg-gray-50'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                Next
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Show</label>
              <select
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span className="text-sm text-gray-600">entries</span>
            </div>

            {/* Pagination controls */}
          
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default Allemployeleaves;
