import React, { useState } from "react";
import Header from "../Homepage Components/Header";
import Sidemenu from "../Homepage Components/Sidemenu";
import Footer from "../Homepage Components/Footer";

const Leavebalance = () => {
  const [leaveRequests, setLeaveRequests] = useState([
    {
      id: 1,
      image: "https://randomuser.me/api/portraits/men/1.jpg",
      name: "John Deo",
      previousYear: 10,
      currentYear: 15,
      total: 25,
      used: 15,
      accepted: 10,
      rejected: 2,
      expired: 5,
      carryOver: 5
    },
    {
      id: 2,
      image: "https://randomuser.me/api/portraits/women/2.jpg",
      name: "Sarah Smith",
      previousYear: 10,
      currentYear: 15,
      total: 25,
      used: 15,
      accepted: 10,
      rejected: 2,
      expired: 5,
      carryOver: 5
    },
    // Add other entries similarly
  ]);

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
                  <th scope="col" className="py-3 px-6">Image</th>
                  <th scope="col" className="py-3 px-6">Name</th>
                  <th scope="col" className="py-3 px-6">Previous Year</th>
                  <th scope="col" className="py-3 px-6">Current Year</th>
                  <th scope="col" className="py-3 px-6">Total</th>
                  <th scope="col" className="py-3 px-6">Used</th>
                  <th scope="col" className="py-3 px-6">Accepted</th>
                  <th scope="col" className="py-3 px-6">Rejected</th>
                  <th scope="col" className="py-3 px-6">Expired</th>
                  <th scope="col" className="py-3 px-6">Carry Over</th>
                </tr>
              </thead>
              <tbody>
                {leaveRequests.map((request) => (
                  <tr key={request.id} className="bg-white border-b" onClick={() => handleRowClick(request)}>
                    <td className="py-4 px-6">
                      <img className="w-10 h-10 rounded-full" src={request.image} alt={request.name} />
                    </td>
                    <td className="py-4 px-6">{request.name}</td>
                    <td className="py-4 px-6">{request.previousYear}</td>
                    <td className="py-4 px-6">{request.currentYear}</td>
                    <td className="py-4 px-6">{request.total}</td>
                    <td className="py-4 px-6">{request.used}</td>
                    <td className="py-4 px-6">{request.accepted}</td>
                    <td className="py-4 px-6">{request.rejected}</td>
                    <td className="py-4 px-6">{request.expired}</td>
                    <td className="py-4 px-6">{request.carryOver}</td>
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

export default Leavebalance;