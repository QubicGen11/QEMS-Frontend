import React, { useState, useEffect } from "react";
import Header from "../Homepage Components/Header";
import Sidemenu from "../Homepage Components/Sidemenu";
import Footer from "../Homepage Components/Footer";
import axios from "axios";
import config from "../config";
import * as XLSX from 'xlsx';
import { FiFilter } from 'react-icons/fi';
import { HiDownload } from 'react-icons/hi';
import { ThreeDots } from 'react-loader-spinner';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Allemployees = () => {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [allSelected, setAllSelected] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState(new Set());
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const navigate = useNavigate();

  // Get unique roles
  const uniqueRoles = [...new Set(employees.map(emp => emp.role))].filter(Boolean);

  // Filter employees based on search and role
  const filteredEmployees = employees.filter(employee => {
    const searchString = searchTerm.toLowerCase();
    const matchesSearch = (
      employee.username?.toLowerCase().includes(searchString) ||
      employee.email?.toLowerCase().includes(searchString) ||
      employee.employee_id?.toLowerCase().includes(searchString) ||
      employee.mainPosition?.toLowerCase().includes(searchString)
    );
    
    const matchesRole = !roleFilter || employee.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  // Export to Excel function
  const exportToExcel = () => {
    const dataToExport = filteredEmployees.map(employee => ({
      'Employee Name': employee.username || `${employee.firstname} ${employee.lastname}`,
      'Employee ID': employee.employee_id,
      'Email': employee.email,
      'Role': employee.role,
      'Position': employee.mainPosition,
      'Status': employee.status,
      'Salary': employee.salary,
      'Joining Date': employee.createdAt ? new Date(employee.createdAt).toLocaleDateString() : 'N/A'
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    
    // Add styling to header row
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_col(C) + "1";
      if (!ws[address]) continue;
      ws[address].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: "EFEFEF" } }
      };
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Employees");
    
    XLSX.writeFile(wb, `Employees_List_${new Date().toLocaleDateString()}.xlsx`);
    toast.success('Successfully exported to Excel!');
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Decline":
        return "bg-red-100 text-red-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // const getEmployeeImage = (employeeImg) => {
  //   if (!employeeImg) {
  //     return `${config.apiUrl}/uploads/default.png`;
  //   }
    
  //   if (employeeImg.startsWith('data:image')) {
  //     return employeeImg;
  //   }
    
  //   if (employeeImg.startsWith('http')) {
  //     return employeeImg;
  //   }
    
  //   return `${config.apiUrl}/uploads/${employeeImg}`;
  // };

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
      toast.error('Failed to load employees data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSelectAll = () => {
    const newSelectedEmployees = new Set();
    if (!allSelected) {
      employees.forEach(employee => newSelectedEmployees.add(employee.employee_id));
    }
    setSelectedEmployees(newSelectedEmployees);
    setAllSelected(!allSelected);
  };

  const handleSelectEmployee = (employeeId) => {
    const newSelectedEmployees = new Set(selectedEmployees);
    if (newSelectedEmployees.has(employeeId)) {
      newSelectedEmployees.delete(employeeId);
    } else {
      newSelectedEmployees.add(employeeId);
    }
    setSelectedEmployees(newSelectedEmployees);
    setAllSelected(newSelectedEmployees.size === employees.length);
  };

  const handleDelete = async (employeeId) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
        try {
            setIsLoading(true);
            const response = await axios.delete(`${config.apiUrl}/qubinest/employees/${employeeId}`);
            
            if (response.status === 204) {
                toast.success('Employee deleted successfully');
                fetchEmployees(); // Refresh the list
            }
        } catch (error) {
            console.error('Error deleting employee:', error);
            
            const errorMessage = error.response?.data?.details 
                || error.response?.data?.error 
                || 'Failed to delete employee';
            
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }
  };

  const handleEdit = async (employee) => {
    try {
      const response = await axios.put(`${config.apiUrl}/qubinest/employees/${employee.employeeId}`, {
        firstname: employee.firstname,
        lastname: employee.lastname,
        email: employee.email,
        position: employee.position,
        // Add other fields as needed
      });

      if (response.status === 200) {
        toast.success('Employee updated successfully');
        setIsEditModalOpen(false);
        fetchEmployees();
      }
    } catch (error) {
      console.error('Error updating employee:', error);
      toast.error('Failed to update employee');
    }
  };

  // Add these helper functions for avatars
  const getInitials = (name) => {
    if (!name) return '';
    const names = name.split(' ');
    if (names.length >= 2) {
      return `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
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
    'bg-gradient-to-r from-emerald-500 to-emerald-600'
  ];

  const getRandomGradient = (email) => {
    const index = email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return gradientColors[index % gradientColors.length];
  };

  const handleViewProfile = (email) => {
    navigate(`/employee-profile/${email}`);
  };

  return (
    <>
      <div>
        <Header />
        <Sidemenu />
        <div className="content-wrapper">
          <section className="container px-4 mx-auto">
            {/* Search and Filter Section */}
            <div className="sm:flex sm:items-center sm:justify-between">
              <div className="flex items-center gap-x-3">
                <h2 className="text-lg font-medium text-gray-800">
                  All Employees
                </h2>
                <span className="px-3 py-1 text-xs text-blue-600 bg-blue-100 rounded-full">
                  {filteredEmployees.length} users
                </span>
              </div>

              <div className="flex items-center mt-4 gap-x-3">
                <button 
                  onClick={exportToExcel}
                  className="flex items-center justify-center w-1/2 px-5 py-2 text-sm text-gray-700 transition-colors duration-200 bg-white border rounded-lg gap-x-2 sm:w-auto hover:bg-gray-100"
                >
                  <HiDownload className="w-5 h-5" />
                  <span>Export</span>
                </button>
              </div>
            </div>

            <div className="mt-6 md:flex md:items-center md:justify-between">
              <div className="relative flex items-center mt-4 md:mt-0">
                <span className="absolute">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 mx-3 text-gray-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Search by name, email, ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full py-1.5 pr-5 text-gray-700 bg-white border border-gray-200 rounded-lg md:w-80 placeholder-gray-400/70 pl-11 rtl:pr-11 rtl:pl-5 focus:border-blue-400 focus:ring-blue-300 focus:outline-none focus:ring focus:ring-opacity-40"
                />
              </div>

              <div className="relative flex items-center mt-4 md:mt-0">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="block w-full py-1.5 text-gray-700 bg-white border border-gray-200 rounded-lg md:w-80 placeholder-gray-400/70 pl-5 pr-11 rtl:pr-5 rtl:pl-11 focus:border-blue-400 focus:ring-blue-300 focus:outline-none focus:ring focus:ring-opacity-40"
                >
                  <option value="">All Roles</option>
                  {uniqueRoles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
                <FiFilter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* Table Section */}
            <div className="flex flex-col mt-6">
              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                  <div className="overflow-hidden border border-gray-200 md:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="py-3.5 px-4 text-sm font-normal text-left rtl:text-right text-gray-500">
                            <div className="flex items-center gap-x-3">
                              <input
                                type="checkbox"
                                className="text-blue-500 border-gray-300 rounded"
                                checked={allSelected}
                                onChange={handleSelectAll}
                              />
                              <span>Name</span>
                            </div>
                          </th>
                          <th className="px-4 py-3.5 text-sm font-normal text-left rtl:text-right text-gray-500">
                            Employee ID
                          </th>
                          <th className="px-4 py-3.5 text-sm font-normal text-left rtl:text-right text-gray-500">
                            Status
                          </th>
                          <th className="px-4 py-3.5 text-sm font-normal text-left rtl:text-right text-gray-500">
                            Email
                          </th>
                          <th className="px-4 py-3.5 text-sm font-normal text-left rtl:text-right text-gray-500">
                            Role
                          </th>
                          <th className="px-4 py-3.5 text-sm font-normal text-left rtl:text-right text-gray-500">
                            Position
                          </th>
                          <th className="px-4 py-3.5 text-sm font-normal text-left rtl:text-right text-gray-500">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredEmployees.map((employee) => (
                          <tr key={employee.employeeId}>
                            <td className="px-4 py-4 text-sm font-medium text-gray-700 whitespace-nowrap">
                              <div className="inline-flex items-center gap-x-3">
                                <input
                                  type="checkbox"
                                  className="text-blue-500 border-gray-300 rounded"
                                  checked={selectedEmployees.has(employee.employeeId)}
                                  onChange={() => handleSelectEmployee(employee.employeeId)}
                                />
                                <div className="flex items-center gap-x-2">
                                  <div 
                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium shadow-lg transform transition-all duration-300 hover:scale-110 ${getRandomGradient(employee.email)} cursor-pointer`}
                                    onClick={() => handleViewProfile(employee.email)}
                                  >
                                    {getInitials(employee.username || `${employee.firstname} ${employee.lastname}`)}
                                  </div>
                                  <div>
                                    <h2 
                                      className="font-medium text-gray-800 cursor-pointer hover:text-blue-600"
                                      onClick={() => handleViewProfile(employee.email)}
                                    >
                                      {employee.username || `${employee.firstname} ${employee.lastname}`}
                                    </h2>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
                              {employee.employeeId}
                            </td>
                            <td className={`px-4 py-4 text-sm whitespace-nowrap ${getStatusClasses(employee.status)}`}>
                              <div className="inline-flex items-center px-3 py-1 rounded-full gap-x-2">
                                <span>{employee.status}</span>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
                              {employee.email}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
                              {employee.role}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
                              {employee.mainPosition}
                            </td>
                            <td className="px-4 py-4 text-sm whitespace-nowrap">
                              <div className="flex items-center gap-x-6">
                                <button 
                                  onClick={() => handleDelete(employee.employeeId)}
                                  className="text-red-500 transition-colors duration-200 hover:text-red-700 focus:outline-none"
                                >
                                  Delete
                                </button>
                                <button 
                                  onClick={() => {
                                    setEditingEmployee(employee);
                                    setIsEditModalOpen(true);
                                  }}
                                  className="text-yellow-500 transition-colors duration-200 hover:text-yellow-700 focus:outline-none"
                                >
                                  Edit
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
        <Footer />
      </div>

      {/* Add Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-900">Edit Employee</h3>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleEdit(editingEmployee);
                }}>
                  <div className="mt-4 space-y-4">
                    <input
                      type="text"
                      value={editingEmployee?.firstname || ''}
                      onChange={(e) => setEditingEmployee({
                        ...editingEmployee,
                        firstname: e.target.value
                      })}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="First Name"
                    />
                    <input
                      type="text"
                      value={editingEmployee?.lastname || ''}
                      onChange={(e) => setEditingEmployee({
                        ...editingEmployee,
                        lastname: e.target.value
                      })}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Last Name"
                    />
                    <input
                      type="email"
                      value={editingEmployee?.email || ''}
                      onChange={(e) => setEditingEmployee({
                        ...editingEmployee,
                        email: e.target.value
                      })}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Email"
                    />
                    <input
                      type="text"
                      value={editingEmployee?.position || ''}
                      onChange={(e) => setEditingEmployee({
                        ...editingEmployee,
                        position: e.target.value
                      })}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Position"
                    />
                  </div>
                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3">
                    <button
                      type="submit"
                      className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(false)}
                      className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Allemployees;
