import React, { useState, useEffect } from "react";
import Header from "../Homepage Components/Header";
import Sidemenu from "../Homepage Components/Sidemenu";
import Footer from "../Homepage Components/Footer";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCalendarAlt, faCheckSquare, faHashtag, faInfoCircle, faFileAlt, faPersonThroughWindow } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import Cookies from 'js-cookie';
import config from "../config";
import { Modal, Box, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  borderRadius: '16px',
  boxShadow: 24,
  p: 4,
};

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center min-h-[400px]">
    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mb-4"></div>
    <p className="text-gray-600">Loading leave requests...</p>
  </div>
);

const EmployeeLeaves = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  
  useEffect(() => {
    fetchInitialData();
  }, []);

  // First fetch just the leave requests
  const fetchInitialData = async () => {
    try {
      setIsInitialLoading(true);
      const leaveResponse = await axios.get(`${config.apiUrl}/qubinest/allleaverequests`);
      
      // Set initial data with placeholder images
      const initialRequests = leaveResponse.data.map(request => ({
        id: request.leave_id,
        image: `https://ui-avatars.com/api/?name=${encodeURIComponent(request.employee_id)}&background=random`,
        name: request.employee_id,
        position: 'Loading...',
        leaveType: request.leaveType,
        leaveFrom: new Date(request.startDate).toLocaleDateString(),
        leaveTo: new Date(request.endDate).toLocaleDateString(),
        noOfDays: Math.ceil(Math.abs(new Date(request.endDate) - new Date(request.startDate)) / (1000 * 60 * 60 * 24)) + 1,
        status: request.status?.toLowerCase() || 'pending',
        reason: request.reason,
        employeeEmail: request.companyEmail,
        department: 'Loading...',
        teamName: 'Loading...'
      }));

      setLeaveRequests(initialRequests);
      setIsInitialLoading(false);

      // Then fetch employee details
      fetchEmployeeDetails(leaveResponse.data);
    } catch (error) {
      console.error("Error fetching initial leave requests:", error);
      setIsInitialLoading(false);
    }
  };

  // Then fetch employee details
  const fetchEmployeeDetails = async (requests) => {
    setIsLoadingDetails(true);
    const employeeDataMap = new Map();
    
    const BATCH_SIZE = 5;
    
    for (let i = 0; i < requests.length; i += BATCH_SIZE) {
      const batch = requests.slice(i, i + BATCH_SIZE);
      
      await Promise.all(
        batch.map(async (request) => {
          try {
            if (!employeeDataMap.has(request.companyEmail) && request.companyEmail) {
              const employeeResponse = await axios.get(
                `${config.apiUrl}/qubinest/getemployees/${encodeURIComponent(request.companyEmail)}`
              );
              const employeeData = employeeResponse.data;
              employeeDataMap.set(request.companyEmail, employeeData);

              // Update the specific request with employee data
              setLeaveRequests(prevRequests => 
                prevRequests.map(prevRequest => 
                  prevRequest.employeeEmail === request.companyEmail ? {
                    ...prevRequest,
                    image: employeeData.employeeImg || prevRequest.image,
                    name: `${employeeData.firstname} ${employeeData.lastname}`,
                    position: employeeData.users?.[0]?.mainPosition || 'Employee',
                    department: employeeData.department || 'N/A',
                    teamName: employeeData.teamName || 'N/A'
                  } : prevRequest
                )
              );
            }
          } catch (error) {
            console.error(`Error fetching employee details:`, error);
          }
        })
      );
    }
    setIsLoadingDetails(false);
  };

  const getStatusClasses = (status) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleStatusChange = async (id, newStatus, employeeEmail) => {
    const endpoint = newStatus === "Approved" ? "approveleaves" : "declineleaves";

    try {
      await axios.post(`${config.apiUrl}/qubinest/${endpoint}`, {
        companyEmail,
        employeeEmail
      });
      setLeaveRequests((prevRequests) =>
        prevRequests.map((request) =>
          request.id === id ? { ...request, status: newStatus } : request
        )
      );
    } catch (error) {
      console.error(`Error updating leave request status to ${newStatus}:`, error);
    }
    setOpenDropdownId(null); // Close the dropdown after selection
  };

  const handleRowClick = (request) => {
    setModalData(request);
  };

  const closeModal = () => {
    setModalData(null);
  };

  return (
    <div>
      <Header />
      <Sidemenu />
      <div className="content-wrapper">
        <section className="container mx-auto p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-bold">Employee Leaves</h2>
            {isLoadingDetails && (
              <span className="text-sm text-gray-500">
                Loading employee details...
              </span>
            )}
          </div>
          
          {isInitialLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3 px-6">Image</th>
                    <th scope="col" className="py-3 px-6">Name</th>
                    <th scope="col" className="py-3 px-6">Leave Type</th>
                    <th scope="col" className="py-3 px-6">Leave From</th>
                    <th scope="col" className="py-3 px-6">Leave To</th>
                    <th scope="col" className="py-3 px-6">No Of Days</th>
                    <th scope="col" className="py-3 px-6">Status</th>
                    <th scope="col" className="py-3 px-6">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {leaveRequests.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-4 px-6 text-center text-gray-500">
                        No leave requests found
                      </td>
                    </tr>
                  ) : (
                    leaveRequests.map((request) => (
                      <tr key={request.id} className="bg-white border-b" onClick={() => handleRowClick(request)}>
                        <td className="py-4 px-6">
                          <img className="w-10 h-10 rounded-full" src={request.image} alt={request.name} />
                        </td>
                        <td className="py-4 px-6">{request.name}</td>
                        <td className="py-4 px-6">{request.leaveType}</td>
                        <td className="py-4 px-6">{request.leaveFrom}</td>
                        <td className="py-4 px-6">{request.leaveTo}</td>
                        <td className="py-4 px-6">{request.noOfDays}</td>
                        <td className="relative py-4 px-6" onClick={(e) => e.stopPropagation()}>
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusClasses(request.status)}`}>
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-4 px-6">{request.reason.length > 20 ? `${request.reason.substring(0, 20)}...` : request.reason}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
      <Footer />

      <Modal
        open={Boolean(modalData)}
        onClose={closeModal}
        aria-labelledby="leave-details-modal"
        aria-describedby="leave-request-details"
      >
        <Box sx={modalStyle}>
          <IconButton
            aria-label="close"
            onClick={closeModal}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>

          {modalData && (
            <div className="flex flex-col items-center">
              <img 
                className="w-24 h-24 rounded-full mb-4 object-cover border-4 border-gray-200" 
                src={modalData.image} 
                alt={modalData.name}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(modalData.name)}&background=random`;
                }}
              />
              <h2 className="text-2xl font-semibold mb-2">{modalData.name}</h2>
              <div className="text-gray-600 mb-4">
                <p className="mb-1"><span className="font-medium">Department:</span> {modalData.department}</p>
                <p className="mb-1"><span className="font-medium">Position:</span> {modalData.position}</p>
                <p className="mb-1"><span className="font-medium">Team:</span> {modalData.teamName}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm mb-6 ${getStatusClasses(modalData.status)}`}>
                {modalData.status.charAt(0).toUpperCase() + modalData.status.slice(1)}
              </span>

              <div className="w-full space-y-4">
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <FontAwesomeIcon icon={faPersonThroughWindow} className="w-5 h-5 text-gray-500 mr-4" />
                  <div>
                    <p className="text-sm text-gray-500">Leave Type</p>
                    <p className="font-medium">{modalData.leaveType}</p>
                  </div>
                </div>

                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <FontAwesomeIcon icon={faCalendarAlt} className="w-5 h-5 text-gray-500 mr-4" />
                  <div>
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="font-medium">{modalData.leaveFrom} - {modalData.leaveTo}</p>
                    <p className="text-sm text-gray-500">({modalData.noOfDays} days)</p>
                  </div>
                </div>

                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <FontAwesomeIcon icon={faFileAlt} className="w-5 h-5 text-gray-500 mr-4" />
                  <div>
                    <p className="text-sm text-gray-500">Reason</p>
                    <p className="font-medium">{modalData.reason}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Box>
      </Modal>
    </div>
  );
};
export default EmployeeLeaves;
