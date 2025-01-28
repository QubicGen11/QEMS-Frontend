import React, { useState, useEffect } from "react";
import Header from "../Homepage Components/Header";
import Sidemenu from "../Homepage Components/Sidemenu";
import Footer from "../Homepage Components/Footer";
import axios from "axios";
import { RiDeleteBinLine } from "react-icons/ri";
import { BiPencil } from "react-icons/bi";
import imgConfig from "../imgConfig"; // Ensure this is correctly configured
import { CiMenuKebab } from "react-icons/ci";
import { Link, useNavigate } from "react-router-dom";
import config from "../config";
import { ThreeDots } from 'react-loader-spinner';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import { FiFilter } from 'react-icons/fi';
import { HiDownload } from 'react-icons/hi';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Tooltip = ({ children, content }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative">
      <div
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {children}
      </div>
      {showTooltip && (
        <div className="absolute z-10 px-2 py-1 text-xs text-white bg-gray-800 rounded-md whitespace-nowrap -top-8 left-1/2 transform -translate-x-1/2">
          {content}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-800"></div>
        </div>
      )}
    </div>
  );
};

const getInitials = (name) => {
  if (!name) return '';
  const names = name.split(' ');
  if (names.length >= 2) {
    return `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase();
  }
  return name.charAt(0).toUpperCase();
};

const colors = [
  'bg-blue-500', 'bg-red-500', 'bg-green-500', 'bg-yellow-500', 
  'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500',
  'bg-orange-500', 'bg-cyan-500', 'bg-rose-500', 'bg-emerald-500',
  'bg-violet-500', 'bg-fuchsia-500', 'bg-lime-500', 'bg-amber-500'
];

const getRandomColor = (email) => {
  const colors = [
    'bg-blue-500', 'bg-red-500', 'bg-green-500', 'bg-yellow-500',
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
  ];
  const index = email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[index % colors.length];
};

const gradientColors = [
  'bg-gradient-to-r from-blue-500 to-blue-600',
  'bg-gradient-to-r from-red-500 to-red-600',
  'bg-gradient-to-r from-green-500 to-green-600',
  'bg-gradient-to-r from-yellow-500 to-yellow-600',
  'bg-gradient-to-r from-purple-500 to-purple-600',
  'bg-gradient-to-r from-pink-500 to-pink-600',
  'bg-gradient-to-r from-indigo-500 to-indigo-600',
  'bg-gradient-to-r from-teal-500 to-teal-600',
  'bg-gradient-to-r from-orange-500 to-orange-600',
  'bg-gradient-to-r from-cyan-500 to-cyan-600',
  'bg-gradient-to-r from-rose-500 to-rose-600',
  'bg-gradient-to-r from-emerald-500 to-emerald-600',
  'bg-gradient-to-r from-violet-500 to-violet-600',
  'bg-gradient-to-r from-fuchsia-500 to-fuchsia-600',
  'bg-gradient-to-r from-lime-500 to-lime-600',
  'bg-gradient-to-r from-amber-500 to-amber-600'
];

const getRandomGradient = (email) => {
  const index = email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return gradientColors[index % gradientColors.length];
};

const AllEmployeeAttendance = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const getStatusClasses = (status) => {
    switch (status) {
      case "Active":
        return " text-green-800";
      case "Decline":
        return " text-red-800";
      case "Pending":
        return " text-yellow-800";
      default:
        return " text-gray-800";
    }
  };

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${config.apiUrl}/qubinest/allusers`);
      
      // Filter users with valid employeeId and remove duplicates
      const filteredUsers = response.data
        .filter(user => user.employeeId && user.employeeId.startsWith('QG'))
        .reduce((acc, current) => {
          const x = acc.find(item => item.email === current.email);
          if (!x) {
            return acc.concat([current]);
          } else {
            return acc;
          }
        }, []);

      setEmployees(filteredUsers);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to load employees data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  
  

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleDeleteClick = (employee) => {
    setSelectedEmployee(employee);
    setModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`${config.apiUrl}/qubinest/employees/${selectedEmployee.employee_id}`);
      setEmployees(employees.filter(emp => emp.employee_id !== selectedEmployee.employee_id));
      setModalOpen(false);
      setSelectedEmployee(null);
    } catch (error) {
      console.error("Failed to delete the employee", error);
    }
  };

  const uniqueRoles = [...new Set(employees.map(emp => emp.role))].filter(Boolean);

  const filteredEmployees = employees.filter(user => {
    const searchString = searchTerm.toLowerCase();
    const matchesSearch = (
      user.username?.toLowerCase().includes(searchString) ||
      user.email?.toLowerCase().includes(searchString) ||
      user.employeeId?.toLowerCase().includes(searchString) ||
      user.mainPosition?.toLowerCase().includes(searchString)
    );
    
    const matchesRole = !roleFilter || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const exportToExcel = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all users first
      const usersResponse = await axios.get(`${config.apiUrl}/qubinest/allusers`);
      const users = usersResponse.data.filter(user => user.employeeId && user.employeeId.startsWith('QG'));

      // Fetch attendance data for each user
      const attendancePromises = users.map(user => 
        axios.get(`${config.apiUrl}/qubinest/singleUserAttendance/${user.employeeId}`)
          .then(response => ({
            user,
            attendance: response.data
          }))
          .catch(error => ({
            user,
            attendance: []
          }))
      );

      const allData = await Promise.all(attendancePromises);

      // Prepare data for Excel
      let excelData = [];
      allData.forEach(({ user, attendance }) => {
        if (attendance && attendance.length > 0) {
          attendance.forEach(record => {
            excelData.push({
              'Employee ID': user.employeeId,
              'Employee Name': user.username,
              'Position': user.mainPosition || 'N/A',
              'Email': user.email,
              'Department': user.department || 'N/A',
              'Date': new Date(record.date).toLocaleDateString(),
              'Check In': record.checkin_Time ? new Date(record.checkin_Time).toLocaleTimeString() : '---',
              'Check Out': record.checkout_Time ? new Date(record.checkout_Time).toLocaleTimeString() : '---',
              'Status': record.status?.toUpperCase() || 'PENDING',
              'Reports': record.reports ? 'Submitted' : 'Not Submitted'
            });
          });
        } else {
          // Add user even if no attendance records
          excelData.push({
            'Employee ID': user.employeeId,
            'Employee Name': user.username,
            'Position': user.mainPosition || 'N/A',
            'Email': user.email,
            'Department': user.department || 'N/A',
            'Date': '---',
            'Check In': '---',
            'Check Out': '---',
            'Status': 'NO RECORDS',
            'Reports': 'No report'
          });
        }
      });

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Add column widths
      const colWidths = [
        { wch: 15 }, // Employee ID
        { wch: 25 }, // Employee Name
        { wch: 20 }, // Position
        { wch: 30 }, // Email
        { wch: 20 }, // Department
        { wch: 15 }, // Date
        { wch: 15 }, // Check In
        { wch: 15 }, // Check Out
        { wch: 15 }, // Status
        { wch: 15 }  // Reports
      ];
      worksheet['!cols'] = colWidths;

      // Add the worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance Records');

      // Generate Excel file
      XLSX.writeFile(workbook, `all-employees-attendance-${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast.success('Attendance data exported to Excel successfully');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error('Failed to export attendance data to Excel');
    } finally {
      setIsLoading(false);
    }
  };

  const exportAttendanceToPDF = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all users first
      const usersResponse = await axios.get(`${config.apiUrl}/qubinest/allusers`);
      const users = usersResponse.data.filter(user => user.employeeId && user.employeeId.startsWith('QG'));

      // Fetch attendance data for each user
      const attendancePromises = users.map(user => 
        axios.get(`${config.apiUrl}/qubinest/singleUserAttendance/${user.employeeId}`)
          .then(response => ({
            user,
            attendance: response.data
          }))
          .catch(error => ({
            user,
            attendance: []
          }))
      );

      const allData = await Promise.all(attendancePromises);

      // Create PDF
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text('All Employees Attendance Report', 14, 15);
      doc.setFontSize(11);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 25);

      // Prepare data for PDF
      let allAttendanceRecords = [];
      allData.forEach(({ user, attendance }) => {
        if (attendance && attendance.length > 0) {
          attendance.forEach(record => {
            allAttendanceRecords.push({
              empId: user.employeeId,
              name: user.username || 'N/A',
              position: user.mainPosition || 'N/A',
              email: user.email,
              date: new Date(record.date).toLocaleDateString(),
              checkin: record.checkin_Time ? new Date(record.checkin_Time).toLocaleTimeString() : '---',
              checkout: record.checkout_Time ? new Date(record.checkout_Time).toLocaleTimeString() : '---',
              status: record.status?.toUpperCase() || 'PENDING',
              reports: record.reports || 'No report'
            });
          });
        } else {
          // Add user even if no attendance records
          allAttendanceRecords.push({
            empId: user.employeeId,
            name: user.username || 'N/A',
            position: user.mainPosition || 'N/A',
            email: user.email,
            date: '---',
            checkin: '---',
            checkout: '---',
            status: 'NO RECORDS',
            reports: 'No report'
          });
        }
      });

      // Sort by name and date
      allAttendanceRecords.sort((a, b) => {
        if (a.name === b.name) {
          return new Date(b.date) - new Date(a.date);
        }
        return a.name.localeCompare(b.name);
      });

      const columns = [
        { header: 'Employee ID', dataKey: 'empId' },
        { header: 'Name', dataKey: 'name' },
        { header: 'Position', dataKey: 'position' },
        { header: 'Date', dataKey: 'date' },
        { header: 'Check In', dataKey: 'checkin' },
        { header: 'Check Out', dataKey: 'checkout' },
        { header: 'Status', dataKey: 'status' }
      ];

      doc.autoTable({
        columns,
        body: allAttendanceRecords,
        startY: 35,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [71, 85, 105] },
        alternateRowStyles: { fillColor: [245, 247, 250] },
        didDrawPage: (data) => {
          doc.setFontSize(8);
          doc.text(
            `Page ${data.pageNumber} of ${doc.internal.getNumberOfPages()}`,
            doc.internal.pageSize.width - 20,
            doc.internal.pageSize.height - 10
          );
        }
      });

      // Add summary
      const summary = {
        totalEmployees: users.length,
        totalAttendanceRecords: allAttendanceRecords.length,
        employeesWithAttendance: new Set(allAttendanceRecords.map(r => r.empId)).size
      };

      const lastY = doc.lastAutoTable.finalY || 70;
      
      doc.setFontSize(10);
      doc.text('Summary:', 14, lastY + 10);
      doc.text(`Total Employees: ${summary.totalEmployees}`, 14, lastY + 20);
      doc.text(`Total Attendance Records: ${summary.totalAttendanceRecords}`, 14, lastY + 30);
      doc.text(`Employees with Attendance: ${summary.employeesWithAttendance}`, 14, lastY + 40);

      doc.save(`all-employees-attendance-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('Attendance report downloaded successfully');

    } catch (error) {
      console.error('Error exporting to PDF:', error);
      toast.error('Failed to export attendance data to PDF');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewAttendance = (employee) => {
    navigate(`/singleemployeeattendance/${employee.employeeId}`);
  };

  // Add pagination logic
  const indexOfLastRecord = currentPage * rowsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - rowsPerPage;
  const currentRecords = filteredEmployees.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredEmployees.length / rowsPerPage);

  return (
    <>
      <div>
        <Header />
        <Sidemenu />
        <div className="content-wrapper">
          <section className=" ">
            <div className="flex items-center">
              <h2 className="text-lg font-medium text-gray-800 text-black:text-white">
                Employees Attedance
              </h2>
              <span className="px-3 py-1 text-xs text-blue-600 bg-blue-100 rounded-full text-black:bg-gray-800 text-black:text-blue-400">
                {employees.length} users
              </span>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center h-[50vh]">
                <ThreeDots
                  height="80"
                  width="80"
                  radius="9"
                  color="#4338ca"
                  ariaLabel="loading"
                />
              </div>
            ) : (
              <div className="flex flex-col mt-6">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                    <div className="overflow-hidden border border-gray-200 text-black:border-gray-700 md:rounded-lg">
                      <div className="mt-4 mb-6">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                          <div className="relative w-full md:w-64">
                            <input
                              type="text"
                              className="w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:border-blue-500"
                              placeholder="Search by name, email, ID..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <span className="absolute right-3 top-2.5 text-gray-400">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                              </svg>
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <select
                                className="appearance-none px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:border-blue-500 pr-8"
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                              >
                                <option value="">All Roles</option>
                                {uniqueRoles.map(role => (
                                  <option key={role} value={role}>{role}</option>
                                ))}
                              </select>
                              <FiFilter className="absolute right-2 top-3 text-gray-400" />
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <button
                                onClick={exportToExcel}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                disabled={isLoading}
                              >
                                <HiDownload className="text-lg" />
                                Export to Excel
                              </button>

                              <button
                                onClick={exportAttendanceToPDF}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                disabled={isLoading}
                              >
                                <HiDownload className="text-lg" />
                                Export to PDF
                              </button>
                            </div>

                            <span className="px-3 py-1 text-xs text-blue-600 bg-blue-100 rounded-full">
                              {filteredEmployees.length} users
                            </span>
                          </div>
                        </div>
                      </div>
                      {filteredEmployees.length === 0 ? (
                        <div className="text-center py-4">
                          <p className="text-gray-500">No employees found</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200 text-black:divide-gray-700">
                            <thead className="bg-gray-50">
                              <tr>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Name
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Employee ID
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Status
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Email address
                                </th>
                               
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Position
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200 text-black:divide-gray-700 text-black:bg-gray-900">
                              {currentRecords.map((employee) => (
                                <tr key={employee.email} className="hover:bg-gray-50">
                                  <td className="px-4 py-2 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <div className={`h-10 w-10 rounded-full ${getRandomGradient(employee.email)} flex items-center justify-center text-white font-semibold`}>
                                        {getInitials(employee.username)}
                                      </div>
                                      <div className="ml-3">
                                        <div className="text-sm font-medium text-gray-900">{employee.username}</div>
                                        <div className="flex items-center mt-1">
                                          <Tooltip content={`Role: ${employee.role || 'Unassigned'}`}>
                                            <div 
                                              className={`w-4 h-4 rounded-full ${getRandomColor(employee.email)} flex items-center justify-center cursor-help`}
                                            >
                                              <span className="text-[8px] text-white font-medium">
                                                {employee.role?.charAt(0) || 'U'}
                                              </span>
                                            </div>
                                          </Tooltip>
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                      {employee.department || 'N/A'}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {employee.subDepartment || 'N/A'}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                      ID: {employee.employeeId || 'Not Assigned'}
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusClasses(employee.status)}`}>
                                      {employee.status || 'Active'}
                                    </span>
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{employee.email}</div>
                                  </td>
                                
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{employee.mainPosition || 'N/A'}</div>
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button 
                                      className="bg-blue-50 text-blue-600 px-3 py-1 rounded-md hover:bg-blue-100 flex items-center gap-2"
                                      onClick={() => handleViewAttendance(employee)}
                                    >
                                      <span className="text-sm">View Attendance</span>
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                      </svg>
                                    </button>
                                  </td>
                                </tr>
                              ))}
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
                                Page {currentPage} of {totalPages} ({filteredEmployees.length} total records)
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
                </div>
              </div>
            )}

           
          </section>
        </div>
        <Footer />
      </div>
      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Background overlay */}
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setModalOpen(false)}></div>
          {/* Modal */}
          <div className="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              {/* Modal content */}
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <RiDeleteBinLine className="h-6 w-6 text-red-600" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-headline">
                    Delete Employee
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete <span className="font-bold">{selectedEmployee?.username}</span>? This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 gap-3 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                onClick={handleDeleteConfirm}
                type="button"
                className="p-2 bg-red-500 text-white rounded-xl"
              >
                Delete
              </button>
              <button
                onClick={() => setModalOpen(false)}
                type="button" 
                className="p-2 bg-gray-200 rounded-xl"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AllEmployeeAttendance;
