import React, { useState } from "react";
import Header from "../Homepage Components/Header";
import Sidemenu from "../Homepage Components/Sidemenu";
import Footer from "../Homepage Components/Footer";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCalendarAlt, faCheckSquare, faHashtag, faInfoCircle, faFileAlt, faFolderOpen,faPersonThroughWindow } from '@fortawesome/free-solid-svg-icons';

const Allemployeleaves = () => {
  const [leaveRequests, setLeaveRequests] = useState([
    {
      id: 1,
      image: "https://randomuser.me/api/portraits/men/1.jpg",
      name: "Harsha",
      leaveType: "Medical Leave",
      leaveFrom: "04/10/1985",
      leaveTo: "02/25/2018",
      noOfDays: 5,
      status: "Approved",
      reason: "I am testing the codeeeeeee."
    },
    {
      id: 2,
      image: "https://randomuser.me/api/portraits/men/44.jpg",
      name: "Sanjuuu",
      leaveType: "Medical Leave",
      leaveFrom: "04/10/1985",
      leaveTo: "02/25/2018",
      noOfDays: 10,
      status: "Pending",
      reason: "My wish i will not come to office what will you do."
    },
    {
      id: 3,
      image: "https://randomuser.me/api/portraits/women/70.jpg",
      name: "Bharath",
      leaveType: "Medical Leave",
      leaveFrom: "04/10/1985",
      leaveTo: "02/25/2018",
      noOfDays: 10,
      status: "Pending",
      reason: "chii tuchhhh tondiiiii"
    },
    {
      id: 4,
      image: "https://randomuser.me/api/portraits/women/48.jpg",
      name: "Uday",
      leaveType: "Medical Leave",
      leaveFrom: "04/10/1985",
      leaveTo: "02/25/2018",
      noOfDays: 10,
      status: "Pending",
      reason: "God creature is amazing."
    },
    // Add other entries similarly
  ]);

  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [modalData, setModalData] = useState(null);

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

  const handleStatusChange = (id, newStatus) => {
    setLeaveRequests((prevRequests) =>
      prevRequests.map((request) =>
        request.id === id ? { ...request, status: newStatus } : request
      )
    );
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
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      {openDropdownId === request.id && (
                        <div className="absolute mt-2 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                          <div className="py-1">
                            <a
                              href="#"
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => handleStatusChange(request.id, "Approved")}
                            >
                              Approved
                            </a>
                            <a
                              href="#"
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => handleStatusChange(request.id, "Rejected")}
                            >
                              Rejected
                            </a>
                            <a
                              href="#"
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => handleStatusChange(request.id, "Pending")}
                            >
                              Pending
                            </a>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6">{request.reason.length > 20 ? `${request.reason.substring(0, 20)}...` : request.reason}</td>
                    <td className="py-4 px-6">
                      <a href="#" className="font-medium text-blue-600 hover:underline">Edit</a>
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
  <div className="fixed inset-0 z-50 overflow-auto flex rounded-3xl shadow-inner" >
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
            <FontAwesomeIcon icon={faPersonThroughWindow}  className="w-6 h-6 mr-7 " />
            <p>{modalData.leaveType }</p>
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