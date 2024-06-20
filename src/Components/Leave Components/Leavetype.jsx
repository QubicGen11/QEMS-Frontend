import React, { useState } from "react";
import Header from "../Homepage Components/Header";
import Sidemenu from "../Homepage Components/Sidemenu";
import Footer from "../Homepage Components/Footer";

const Leavetype = () => {
  const [leaveRequests, setLeaveRequests] = useState([
    {
      id: 1,
      leaveName: "Work From Home Leave",
      leaveType: "Paid",
      leaveUnit: "Days",
      status: "Deactivate",
      note: "Winged lights seed don't…"
    },
    {
      id: 2,
      leaveName: "Casual Leave",
      leaveType: "Unpaid",
      leaveUnit: "Hours",
      status: "Active",
      note: "Winged lights seed don't…"
    },
    {
      id: 3,
      leaveName: "Emergency Leave",
      leaveType: "Unpaid",
      leaveUnit: "Days",
      status: "Active",
      note: "Winged lights seed don't…"
    },
    {
      id: 4,
      leaveName: "Family Leave",
      leaveType: "Unpaid",
      leaveUnit: "Hours",
      status: "Deactivate",
      note: "Winged lights seed don't…"
    },
    {
      id: 5,
      leaveName: "Sick Leave",
      leaveType: "Unpaid",
      leaveUnit: "Days",
      status: "Active",
      note: "Winged lights seed don't…"
    },
    {
      id: 6,
      leaveName: "Casual Leave",
      leaveType: "Unpaid",
      leaveUnit: "Days",
      status: "Active",
      note: "Winged lights seed don't…"
    },
    {
      id: 7,
      leaveName: "Maternity Leave",
      leaveType: "Paid",
      leaveUnit: "Days",
      status: "Deactivate",
      note: "Winged lights seed don't…"
    },
    {
      id: 8,
      leaveName: "Sick Leave",
      leaveType: "Unpaid",
      leaveUnit: "Days",
      status: "Active",
      note: "Winged lights seed don't…"
    },
    // Add other entries similarly
  ]);

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

  return (
    <div>
      <Header />
      <Sidemenu />
      <div className="content-wrapper">
        <section className="container mx-auto p-4">
          <h2 className="text-lg font-bold mb-3">Employee Leaves</h2>
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
                    <td className="py-4 px-6">{request.leaveName}</td>
                    <td className="py-4 px-6">{request.leaveType}</td>
                    <td className="py-4 px-6">{request.leaveUnit}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full ${getStatusClasses(request.status)}`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">{request.note.length > 20 ? `${request.note.substring(0, 20)}...` : request.note}</td>
                    <td className="py-4 px-6">
                      <button className="text-gray-500 hover:text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12h10.5M6.75 9h10.5m-10.5 6h10.5" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default Leavetype;