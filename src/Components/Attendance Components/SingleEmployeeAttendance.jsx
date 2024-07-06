import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Header from '../Homepage Components/Header';
import Sidemenu from '../Homepage Components/Sidemenu';
import Footer from '../Homepage Components/Footer';
import Cookies from 'js-cookie';
import config from '../config';

const SingleEmployeeAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [filteredAttendance, setFilteredAttendance] = useState([]);
  const [avgTimings, setAvgTimings] = useState({});
  const { employeeId } = useParams();
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const adminEmail = Cookies.get('email');

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await axios.get(`${config.apiUrl}/qubinest/singleUserAttendance/${employeeId.split(':')[1]}`);
        setAttendance(response.data);
        setFilteredAttendance(response.data);
      } catch (error) {
        console.error('Error fetching attendance:', error);
      }
    };

    const fetchAvgTimings = async () => {
      try {
        const response = await axios.get(`${config.apiUrl}/qubinest/allAttendance/${employeeId.split(':')[1]}`);
        setAvgTimings(response.data);
      } catch (error) {
        console.error('Error fetching average timings:', error);
      }
    };

    fetchAttendance();
    fetchAvgTimings();
  }, [employeeId]);

  useEffect(() => {
    handleFilter();
  }, [year, month]);

  const handleFilter = () => {
    if (!year || !month) {
      setFilteredAttendance(attendance);
      return;
    }

    const filtered = attendance.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate.getFullYear() === year && recordDate.getMonth() + 1 === month;
    });

    setFilteredAttendance(filtered);
  };

  const handleApprove = async () => {
    try {
      const response = await axios.post(`${config.apiUrl}/qubinest/approveAttendance`, {
        employeeId: employeeId.split(':')[1],
        adminEmail,
        year,
        month
      });

      if (response.status === 200) {
        console.log('Attendance approved successfully');

        // Update the state to reflect the change immediately
        const updatedAttendance = filteredAttendance.map(record => ({
          ...record,
          status: 'approved'
        }));

        setFilteredAttendance(updatedAttendance);
        setAttendance(prevAttendance =>
          prevAttendance.map(record => ({
            ...record,
            status:
              new Date(record.date).getFullYear() === year &&
              new Date(record.date).getMonth() + 1 === month
                ? 'approved'
                : record.status
          }))
        );
      }
    } catch (error) {
      console.error('Error approving attendance:', error);
    }
  };

  const handleDecline = async () => {
    try {
      const response = await axios.post(`${config.apiUrl}/qubinest/declineAttendance`, {
        employeeId: employeeId.split(':')[1],
        adminEmail,
        year,
        month
      });

      if (response.status === 200) {
        console.log('Attendance declined successfully');

        // Update the state to reflect the change immediately
        const updatedAttendance = filteredAttendance.map(record => ({
          ...record,
          status: 'declined'
        }));

        setFilteredAttendance(updatedAttendance);
        setAttendance(prevAttendance =>
          prevAttendance.map(record => ({
            ...record,
            status:
              new Date(record.date).getFullYear() === year &&
              new Date(record.date).getMonth() + 1 === month
                ? 'declined'
                : record.status
          }))
        );
      }
    } catch (error) {
      console.error('Error declining attendance:', error);
    }
  };
  return (
    <>
      <Header />
      <Sidemenu />
      <div className="content-wrapper">
        <section className="container px-4 mx-auto">
          {attendance.length > 0 && (
            <h2 className="text-xl font-medium text-gray-800 text-center">Employee Attendance of {attendance[0].employeeName}</h2>
          )}
          <section className="text-gray-600 body-font">
            <div className="container px-5 py-24 mx-auto">
             <div className="flow-root rounded-lg border border-gray-100 py-3 shadow-sm">
  <dl className="-my-3 divide-y divide-gray-100 text-sm">
    <div className="grid grid-cols-1 gap-1 p-3 sm:grid-cols-3 sm:gap-4">
      <dt className="font-medium text-gray-900">Title</dt>
      <dd className="text-gray-700 sm:col-span-2">Mr</dd>
    </div>

    <div className="grid grid-cols-1 gap-1 p-3 sm:grid-cols-3 sm:gap-4">
      <dt className="font-medium text-gray-900">Name</dt>
      <dd className="text-gray-700 sm:col-span-2">John Frusciante</dd>
    </div>

    <div className="grid grid-cols-1 gap-1 p-3 sm:grid-cols-3 sm:gap-4">
      <dt className="font-medium text-gray-900">Occupation</dt>
      <dd className="text-gray-700 sm:col-span-2">Guitarist</dd>
    </div>

    <div className="grid grid-cols-1 gap-1 p-3 sm:grid-cols-3 sm:gap-4">
      <dt className="font-medium text-gray-900">Salary</dt>
      <dd className="text-gray-700 sm:col-span-2">$1,000,000+</dd>
    </div>

    <div className="grid grid-cols-1 gap-1 p-3 sm:grid-cols-3 sm:gap-4">
      <dt className="font-medium text-gray-900">Bio</dt>
      <dd className="text-gray-700 sm:col-span-2">
        Lorem ipsum dolor, sit amet consectetur adipisicing elit. Et facilis debitis explicabo
        doloremque impedit nesciunt dolorem facere, dolor quasi veritatis quia fugit aperiam
        aspernatur neque molestiae labore aliquam soluta architecto?
      </dd>
    </div>
  </dl>
</div>
            </div>
          </section>
          <div className="flex flex-col mt-6">
            <div className="topbar-table flex justify-between p-3">
              <div className="dropdowns flex gap-3">
                <select value={year} className='p-2 rounded-md font-semibold bg-gray-200' onChange={(e) => setYear(parseInt(e.target.value, 10))}>
                  {[...Array(5)].map((_, index) => (
                    <option key={index} value={new Date().getFullYear() - index}>
                      {new Date().getFullYear() - index}
                    </option>
                  ))}
                </select>
                <select className='p-2 bg-gray-200 ml-1 font-semibold rounded-md' value={month} onChange={(e) => setMonth(parseInt(e.target.value, 10))}>
                  {[...Array(12)].map((_, index) => (
                    <option key={index} value={index + 1}>
                      {index + 1}
                    </option>
                  ))}
                </select>
              </div>
              <div className="btns flex gap-3">
                <button className='font-semibold text-green-500' onClick={handleApprove}>Approve</button>
                <button className='font-semibold text-red-500' onClick={handleDecline}>Decline</button>
              </div>
            </div>
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                <div className="overflow-hidden border border-gray-200 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Check-in Time
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Check-out Time
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Reports
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredAttendance.length > 0 ? (
                        filteredAttendance.map((record) => (
                          <tr key={record.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(record.date).toLocaleDateString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(record.checkin_Time).toLocaleTimeString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.checkout_Time ? new Date(record.checkout_Time).toLocaleTimeString() : '---'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.status}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.reports}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                            No data available for the selected period.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default SingleEmployeeAttendance;
