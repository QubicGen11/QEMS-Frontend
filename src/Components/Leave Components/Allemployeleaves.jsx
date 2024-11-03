import React, { useState, useEffect } from "react";
import Header from "../Homepage Components/Header";
import Sidemenu from "../Homepage Components/Sidemenu";
import Footer from "../Homepage Components/Footer";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCalendarAlt, faCheckSquare, faHashtag, faInfoCircle, faFileAlt, faPersonThroughWindow } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import Cookies from 'js-cookie';
import config from "../config";

const Allemployeleaves = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalData, setModalData] = useState(null);
  const companyEmail = Cookies.get('email');

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${config.apiUrl}/qubinest/allleaverequests`);
      
      const formattedRequests = response.data.map(request => {
        // Format without waiting for employee data
        return {
          id: request.leave_id,
          employee_id: request.employee_id,
          image: `https://ui-avatars.com/api/?name=${encodeURIComponent(request.employee_id)}&background=random&size=200`,
          name: request.employee_id,
          position: 'Employee',
          department: request.department,
          employeeEmail: request.companyEmail,
          leaveType: request.leaveType,
          leaveFrom: new Date(request.startDate).toLocaleDateString(),
          leaveTo: new Date(request.endDate).toLocaleDateString(),
          noOfDays: Math.ceil(Math.abs(new Date(request.endDate) - new Date(request.startDate)) / (1000 * 60 * 60 * 24)) + 1,
          status: request.status || 'Pending',
          reason: request.reason || 'No reason provided'
        };
      });

      // Try to fetch employee details in background
      formattedRequests.forEach(async (request, index) => {
        try {
          const employeeResponse = await axios.get(
            `${config.apiUrl}/qubinest/getemployee/${request.employee_id}`
          );
          if (employeeResponse.data.success && employeeResponse.data.data) {
            const employeeData = employeeResponse.data.data;
            setLeaveRequests(prev => prev.map((req, i) => 
              i === index ? {
                ...req,
                image: employeeData.profileImage || req.image,
                name: `${employeeData.firstName} ${employeeData.lastName}`,
                position: employeeData.position || req.position,
                department: employeeData.department || req.department
              } : req
            ));
          }
        } catch (error) {
          console.warn(`Error fetching employee details for ${request.employee_id}:`, error);
        }
      });

      setLeaveRequests(formattedRequests);
    } catch (error) {
      console.error("Error fetching leave requests:", error);
      setError("Failed to fetch leave requests. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (leaveId, newStatus, employeeEmail) => {
    try {
      const endpoint = newStatus === "Approved" ? "approveleave" : "declineleave";
      
      console.log('Sending request:', {
        endpoint,
        leaveId,
        employeeEmail,
        companyEmail
      });

      const response = await axios.post(`${config.apiUrl}/qubinest/${endpoint}`, {
        companyEmail,
        employeeEmail,
        leaveId: parseInt(leaveId)
      });

      if (response.data.success) {
        setLeaveRequests(prev => 
          prev.map(request => 
            request.id === leaveId 
              ? { ...request, status: newStatus } 
              : request
          )
        );
        alert(response.data.message);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert(error.response?.data?.message || error.message);
    }
  };

  return (
    <div>
      <Header />
      <Sidemenu />
      <div className="content-wrapper">
        <section className="container mx-auto p-4">
          <h2 className="text-lg font-bold mb-3">Leave Requests</h2>
          
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
                    <th scope="col" className="py-3 px-6">Image</th>
                    <th scope="col" className="py-3 px-6">Name</th>
                    <th scope="col" className="py-3 px-6">Leave Type</th>
                    <th scope="col" className="py-3 px-6">From</th>
                    <th scope="col" className="py-3 px-6">To</th>
                    <th scope="col" className="py-3 px-6">Days</th>
                    <th scope="col" className="py-3 px-6">Status</th>
                    <th scope="col" className="py-3 px-6">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leaveRequests.map((request) => (
                    <tr key={request.id} className="bg-white border-b hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <img 
                          src={request.image} 
                          alt={request.name} 
                          className="w-10 h-10 rounded-full"
                        />
                      </td>
                      <td className="py-4 px-6">{request.name}</td>
                      <td className="py-4 px-6">{request.leaveType}</td>
                      <td className="py-4 px-6">{request.leaveFrom}</td>
                      <td className="py-4 px-6">{request.leaveTo}</td>
                      <td className="py-4 px-6">{request.noOfDays}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          request.status === 'Approved' ? 'bg-green-100 text-green-800' :
                          request.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex gap-2">
                          <button 
                            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm"
                            onClick={() => handleStatusChange(request.id, "Approved", request.employeeEmail)}
                            disabled={request.status !== 'Pending'}
                          >
                            Approve
                          </button>
                          <button 
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                            onClick={() => handleStatusChange(request.id, "Rejected", request.employeeEmail)}
                            disabled={request.status !== 'Pending'}
                          >
                            Decline
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default Allemployeleaves;
