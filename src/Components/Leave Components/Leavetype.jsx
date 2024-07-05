import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "../Homepage Components/Header";
import Sidemenu from "../Homepage Components/Sidemenu";
import Footer from "../Homepage Components/Footer";
import Holidaymodal from "./Holidaymodal"; // Import the modal component

const Leavetype = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [modalOpen, setModalOpen] = useState(false); // State to control modal visibility
  const [deleteModalOpen, setDeleteModalOpen] = useState(false); // State to control delete modal visibility
  const [currentLeave, setCurrentLeave] = useState({ leaveName: "", type: "", leaveUnit: "", status: "", note: "" });
  const [selectedLeave, setSelectedLeave] = useState(null); // State to track the selected leave request for deletion

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        const response = await axios.get("http://localhost:3000/qubinest/allholidays");
        setLeaveRequests(response.data);
      } catch (error) {
        console.error("Error fetching leave requests:", error);
      }
    };
    fetchLeaveRequests();
  }, []);

  const getStatusClasses = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 border border-green-500";
      case "Deactivate":
        return "bg-red-100 text-red-800 border border-red-500";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleRowClick = (request) => {
    console.log("Row clicked:", request);
  };

  const handleAddHolidayClick = () => {
    setCurrentLeave({ leaveName: "", type: "", leaveUnit: "", status: "", note: "" }); // Reset form fields
    setModalOpen(true);
  };

  const handleModalSave = async () => {
    try {
      await axios.post("http://localhost:3000/qubinest/createholiday", currentLeave);
      setModalOpen(false);
      const response = await axios.get("http://localhost:3000/qubinest/allholidays");
      setLeaveRequests(response.data); // Refresh the leave requests after adding a new one
    } catch (error) {
      console.error("Error saving leave request:", error);
    }
  };

  const handleModalCancel = () => {
    setModalOpen(false);
  };

  const handleDeleteModalOpen = (leave) => {
    console.log("Opening delete modal for:", leave);
    if (!leave.leaveName) {
      console.error("Error: leave.leaveName is undefined");
    }
    setSelectedLeave(leave);
    setDeleteModalOpen(true);
  };

  const handleDeleteModalCancel = () => {
    setDeleteModalOpen(false);
    setSelectedLeave(null);
  };

  const handleDeleteConfirm = async () => {
    console.log("Selected leave for deletion:", selectedLeave);
    if (selectedLeave && selectedLeave.leaveName) {
      try {
        await axios.delete(`http://localhost:3000/qubinest/deleteholiday/${selectedLeave.leaveName}`);
        setDeleteModalOpen(false);
        const response = await axios.get("http://localhost:3000/qubinest/allholidays");
        setLeaveRequests(response.data); // Refresh the leave requests after deletion
      } catch (error) {
        console.error("Error deleting leave request:", error);
      }
    } else {
      console.error("Error: selectedLeave.leaveName is undefined");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentLeave((prevLeave) => ({
      ...prevLeave,
      [name]: value,
    }));
  };

  return (
    <div>
      <Header />
      <Sidemenu />
      <div className="content-wrapper">
        <section className="container mx-auto p-4">
          <div className="top-row flex items-center h-9 justify-between">
            <h2 className="text-lg font-bold mb-3">Employee Leaves</h2>
            <button className="p-2 bg-blue-500 mb-3 text-white rounded-md font-bold" onClick={handleAddHolidayClick}>
              Add Holiday
            </button>
          </div>
          <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="py-3 px-6">Leave Name</th>
                  <th scope="col" className="py-3 px-6">Leave Type</th>
                  <th scope="col" className="py-3 px-6">Leave Unit</th>
                  <th scope="col" className="py-3 px-6">Status</th>
                  <th scope="col" className="py-3 px-6">Note</th>
                  <th scope="col" className="py-3 px-6">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaveRequests.map((request) => (
                  <tr key={request.id} className="bg-white border-b" onClick={() => handleRowClick(request)}>
                    <td className="py-4 px-6">{request.LeaveName}</td>
                    <td className="py-4 px-6">{request.Type}</td>
                    <td className="py-4 px-6">{request.LeaveUnit}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full ${getStatusClasses(request.Status)}`}>
                        {request.Status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {request.Note && request.Note.length > 20 ? `${request.Note.substring(0, 20)}...` : request.Note}
                    </td>
                    <td className="py-4 px-6">
                      <div className="btns flex gap-3">
                        <button className="text-red-600 font-semibold" onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteModalOpen(request);
                        }}>Delete</button>
                        <button className="text-green-600 font-semibold">Edit</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
      <Footer />
      {modalOpen && (
        <Holidaymodal
          event={currentLeave}
          onSave={handleModalSave}
          onCancel={handleModalCancel}
          onChange={handleInputChange}
        />
      )}
      {deleteModalOpen && (
        <div className="modal" style={{ display: 'block' }}>
          <div className="modal-dialog w-1/3" style={{ maxHeight: '90vh', maxWidth: '500px' }}>
            <div className="modal-content">
              <div className="modal-header bg-red-500">
                <h5 className="modal-title text-white text-lg">Confirm Delete</h5>
                <button type="button" className="close" onClick={handleDeleteModalCancel}>
                  <span>&times;</span>
                </button>
              </div>

              <div className="modal-body">
                <p>Are you sure you want to delete this leave type?</p>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleDeleteModalCancel}>
                  Cancel
                </button>
                <button type="button" className="btn btn-danger" onClick={handleDeleteConfirm}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leavetype;
