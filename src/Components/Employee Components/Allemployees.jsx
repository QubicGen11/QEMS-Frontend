import React, { useState, useEffect } from "react";
import Header from "../Homepage Components/Header";
import Sidemenu from "../Homepage Components/Sidemenu";
import Footer from "../Homepage Components/Footer";
import axios from "axios";
import imgConfig from "../imgConfig"; // Ensure this is correctly configured

const Allemployees = () => {
  const [employees, setEmployees] = useState([]);
  const [allSelected, setAllSelected] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState(new Set());

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

  const fetchEmployees = async () => {
    try {
      const response = await axios.get("http://localhost:3000/qubinest/allusers");
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSelectAll = () => {
    const newSelectedEmployees = new Set();
    if (!allSelected) {
      employees.forEach(employee => newSelectedEmployees.add(employee.employeeId));
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

  const handleDeleteClick = (employee) => {
    // Handle individual employee delete logic here
  };

  const handleDeleteSelected = async () => {
    // Handle deleting selected employees
  };

  return (
    <>
      <div>
        <Header />
        <Sidemenu />
        <div className="content-wrapper">
          <section className="container px-4 mx-auto">
            <div className="top-bar flex justify-between items-center">
              <div className="flex items-center gap-x-3">
                <h2 className="text-lg font-medium text-gray-800 text-black:text-white">
                  All Employees
                </h2>
                <span className="px-3 py-1 text-xs text-blue-600 bg-blue-100 rounded-full text-black:bg-gray-800 text-black:text-blue-400">
                  {employees.length} users
                </span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleDeleteSelected} 
                  className=" bg text-gray-900 px-2 rounded-md"
                >
                  Delete 
                </button>
                <button 
                  onClick={handleDeleteSelected} 
                  className=" bg0 text-gray-900e px-2 rounded-md"
                >
                  Make Team Lead
                </button>
                <button 
                  onClick={handleDeleteSelected} 
                  className=" 500 text-gray-900ite px-2 rounded-md"
                >
                  Disable Employee
                </button>
              </div>
            </div>
            <div className="flex flex-col mt-6">
              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                  <div className="overflow-hidden border border-gray-200 text-black:border-gray-700 md:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200 text-black:divide-gray-700">
                      <thead className="bg-gray-50 text-black:bg-gray-800">
                        <tr>
                          <th className="py-3.5 px-4 text-sm font-normal text-left rtl:text-right text-gray-500 text-black:text-gray-400">
                            <div className="flex items-center gap-x-3">
                              <input
                                type="checkbox"
                                className="text-blue-500 border-gray-300 rounded text-black:bg-gray-900 text-black:ring-offset-gray-900 text-black:border-gray-700"
                                checked={allSelected}
                                onChange={handleSelectAll}
                              />
                              <span>Name</span>
                            </div>
                          </th>
                          <th className="px-4 py-3.5 text-sm font-normal text-left rtl:text-right text-gray-500 text-black:text-gray-400">
                            Status
                          </th>
                          <th className="px-4 py-3.5 text-sm font-normal text-left rtl:text-right text-gray-500 text-black:text-gray-400">
                            Email address
                          </th>
                          <th className="px-4 py-3.5 text-sm font-normal text-left rtl:text-right text-gray-500 text-black:text-gray-400">
                            Role
                          </th>
                          <th className="px-4 py-3.5 text-sm font-normal text-left rtl:text-right text-gray-500 text-black:text-gray-400">
                            Salary
                          </th>
                          <th className="px-4 py-3.5 text-sm font-normal text-left rtl:text-right text-gray-500 text-black:text-gray-400">
                            Position
                          </th>
                          <th className="px-4 py-3.5 text-sm font-normal text-left rtl:text-right text-gray-500 text-black:text-gray-400">
                            Joining Date
                          </th>
                          <th scope="col" className="relative py-3.5 px-4">
                            <span className="sr-only">Edit</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200 text-black:divide-gray-700 text-black:bg-gray-900">
                        {employees.map((employee) => (
                          <tr key={employee.employeeId || employee.username}>
                            <td className="px-4 py-4 text-sm font-medium text-gray-700 whitespace-nowrap">
                              <div className="inline-flex items-center gap-x-3">
                                <input
                                  type="checkbox"
                                  className="text-blue-500 border-gray-300 rounded text-black:bg-gray-900 text-black:ring-offset-gray-900 text-black:border-gray-700"
                                  checked={selectedEmployees.has(employee.employeeId)}
                                  onChange={() => handleSelectEmployee(employee.employeeId)}
                                />
                                <div className="flex items-center gap-x-2">
                                  <img
                                    className="object-cover w-10 h-10 rounded-full"
                                    src={`${imgConfig.apiUrl}/${employee.employeeImg || 'default.png'}`}
                                    alt=""
                                  />
                                  <div>
                                    <h2 className="font-medium text-gray-800 text-black:text-white">
                                      {employee.username}
                                    </h2>
                                    <p className="text-sm font-normal text-gray-600 text-black:text-gray-400">
                                      @{employee.username ? employee.username.split(' ').join('') : 'unknown'}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className={`relative px-4 py-4 text-sm font-medium text-gray-700 whitespace-nowrap ${getStatusClasses(employee.status)}`}>
                              {employee.status}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-500 text-black:text-gray-300 whitespace-nowrap">
                              {employee.email}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-500 text-black:text-gray-300 whitespace-nowrap">
                              {employee.role}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-500 text-black:text-gray-300 whitespace-nowrap">
                              {employee.salary}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-500 text-black:text-gray-300 whitespace-nowrap">
                              {employee.mainPosition}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-500 text-black:text-gray-300 whitespace-nowrap">
                              {new Date(employee.joiningDate).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-4 text-sm whitespace-nowrap">
                              <div className="relative">
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
            <div className="flex items-center justify-between mt-6">
              <a
                href="#"
                className="flex items-center px-5 py-2 text-sm text-gray-700 capitalize transition-colors duration-200 bg-white border rounded-md gap-x-2 hover:bg-gray-100 text-black:bg-gray-900 text-black:text-gray-200 text-black:border-gray-700 text-black:hover:bg-gray-800"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-5 h-5 rtl:-scale-x-100"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18"
                  />
                </svg>
                <span>Previous</span>
              </a>
              <div className="items-center hidden lg:flex gap-x-3">
                <a
                  href="#"
                  className="px-2 py-1 text-sm text-blue-500 rounded-md text-black:bg-gray-800 bg-blue-100/60"
                >
                  1
                </a>
                <a
                  href="#"
                  className="px-2 py-1 text-sm text-gray-500 rounded-md text-black:hover:bg-gray-800 text-black:text-gray-300 hover:bg-gray-100"
                >
                  2
                </a>
                <a
                  href="#"
                  className="px-2 py-1 text-sm text-gray-500 rounded-md text-black:hover:bg-gray-800 text-black:text-gray-300 hover:bg-gray-100"
                >
                  3
                </a>
                <a
                  href="#"
                  className="px-2 py-1 text-sm text-gray-500 rounded-md text-black:hover:bg-gray-800 text-black:text-gray-300 hover:bg-gray-100"
                >
                  ...
                </a>
                <a
                  href="#"
                  className="px-2 py-1 text-sm text-gray-500 rounded-md text-black:hover:bg-gray-800 text-black:text-gray-300 hover:bg-gray-100"
                >
                  12
                </a>
                <a
                  href="#"
                  className="px-2 py-1 text-sm text-gray-500 rounded-md text-black:hover:bg-gray-800 text-black:text-gray-300 hover:bg-gray-100"
                >
                  13
                </a>
                <a
                  href="#"
                  className="px-2 py-1 text-sm text-gray-500 rounded-md text-black:hover:bg-gray-800 text-black:text-gray-300 hover:bg-gray-100"
                >
                  14
                </a>
              </div>
              <a
                href="#"
                className="flex items-center px-5 py-2 text-sm text-gray-700 capitalize transition-colors duration-200 bg-white border rounded-md gap-x-2 hover:bg-gray-100 text-black:bg-gray-900 text-black:text-gray-200 text-black:border-gray-700 text-black:hover:bg-gray-800"
              >
                <span>Next</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-5 h-5 rtl:-scale-x-100"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
                  />
                </svg>
              </a>
            </div>
          </section>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default Allemployees;
