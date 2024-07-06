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
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [modalData, setModalData] = useState(null);
  const companyEmail = Cookies.get('email'); // Assuming the email of the current user is stored in cookies
  useEffect(() => {
    fetchLeaveRequests();
  }, []);
  const fetchLeaveRequests = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/qubinest/allleaverequests`);
      const formattedRequests = response.data.map((request, index) => ({
        id: request.leave_id,
        image: `https://randomuser.me/api/portraits/men/${index + 1}.jpg`, // Assign a random image
        name: request.employee_id, // Assuming employee_id is the name for demonstration
        leaveType: request.leaveType,
        leaveFrom: request.startDate ? new Date(request.startDate).toLocaleDateString() : '',
        leaveTo: request.endDate ? new Date(request.endDate).toLocaleDateString() : '',
        noOfDays: request.duration === "full day" ? 1 : 0.5, // Example calculation
        status: request.status,
        reason: request.reason
      }));
      setLeaveRequests(formattedRequests);
    } catch (error) {
      console.error("Error fetching leave requests:", error);
    }
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      case "Pending":
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
          <h2 className="text-lg font-bold mb-3">Leave Requests</h2>
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
                  <th scope="col" className="py-3 px-6">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaveRequests.map((request) => (
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
                      <div
                        className={`inline-flex items-center px-3 py-1 rounded-full gap-x-2 cursor-pointer ${getStatusClasses(request.status)}`}
                        onClick={() => setOpenDropdownId(openDropdownId === request.id ? null : request.id)}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${getStatusClasses(request.status)}`} />
                        <h2 className={`text-sm font-normal ${getStatusClasses(request.status)}`}>{request.status}</h2>
                      </div>
                    </td>
                    <td className="py-4 px-6">{request.reason.length > 20 ? `${request.reason.substring(0, 20)}...` : request.reason}</td>
                    <td className="py-4 px-6 flex gap-2">
                      <a href="#" className="font-medium bg-green-600 text-white rounded-md p-2" onClick={(e) => { e.stopPropagation(); handleStatusChange(request.id, "Approved", request.name); }}>Approve</a>
                      <a href="#" className="font-medium bg-red-600 text-white rounded-md p-2" onClick={(e) => { e.stopPropagation(); handleStatusChange(request.id, "Rejected", request.name); }}>Decline</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
      <Footer />
      {modalData && (
        <div className="fixed inset-0 z-50 overflow-auto flex rounded-3xl shadow-inner">
          <div className="relative p-8 bg-white w-full max-w-md m-auto flex-col flex rounded-lg">
            <span className="absolute top-0 right-0 p-4">
              <button onClick={closeModal}>
                <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
              </button>
            </span>
            <div className="flex flex-col items-center">
              <img className="w-24 h-24 rounded-full mb-4" src={modalData.image} alt={modalData.name} />
              <h2 className="text-2xl font-semibold mb-2">{modalData.name}</h2>
              <p className="text-sm text-gray-500 mb-4">Position</p>
              <div className="flex flex-col items-start w-full space-y-5">
                <div className="flex items-center mb-2">
                  <FontAwesomeIcon icon={faPersonThroughWindow} className="w-6 h-6 mr-7" />
                  <p>{modalData.leaveType}</p>
                </div>
                <div className="flex items-center mb-2">
                  <FontAwesomeIcon icon={faCalendarAlt} className="w-4 h-4 mr-7" />
                  <p>{modalData.leaveFrom}</p>
                </div>
                <div className="flex items-center mb-2">
                  <FontAwesomeIcon icon={faCheckSquare} className="w-4 h-4 mr-7" />
                  <p>{modalData.leaveTo}</p>
                </div>
                <div className="flex items-center mb-2">
                  <FontAwesomeIcon icon={faHashtag} className="w-4 h-4 mr-7" />
                  <p>{modalData.noOfDays} days</p>
                </div>
                <div className="flex items-center mb-2">
                  <FontAwesomeIcon icon={faInfoCircle} className="w-4 h-4 mr-7" />
                  <p>{modalData.status}</p>
                </div>
                <div className="flex items-center mb-2">
                  <FontAwesomeIcon icon={faFileAlt} className="w-4 h-4 mr-7" />
                  <p>{modalData.reason}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Allemployeleaves;
