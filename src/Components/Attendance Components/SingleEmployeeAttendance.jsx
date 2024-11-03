import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Header from '../Homepage Components/Header';
import Sidemenu from '../Homepage Components/Sidemenu';
import Footer from '../Homepage Components/Footer';
import Cookies from 'js-cookie';
import config from '../config';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DOMPurify from 'dompurify';
import './Singleattendace.css'

const SingleEmployeeAttendance = () => {
  const [employee, setEmployee] = useState(null);
  const [employeeTitle, setEmployeeTitle] = useState('');
  const [attendance, setAttendance] = useState([]);
  const [filteredAttendance, setFilteredAttendance] = useState([]);
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [avgTimings, setAvgTimings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { employeeId } = useParams();
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const adminEmail = Cookies.get('email');

  useEffect(() => {
    const email = Cookies.get('email');

    const fetchEmployeeData = async () => {
      if (!email) {
        toast.error('No email found in cookies');
        return;
      }

      try {
        const response = await axios.get(`${config.apiUrl}/qubinest/getemployees/${email}`);
        console.log('API response:', response.data); // Log the response data
        if (response.data) {
          const employeeData = response.data;
          const title = employeeData.gender === 'male' ? 'Mr.' : employeeData.gender === 'female' ? 'Ms.' : '';
          setEmployeeTitle(title);
        } else {
          toast.error('Unexpected response format');
        }
      } catch (error) {
        console.error('Error fetching employee data:', error);
      }
    };

    fetchEmployeeData();
  }, []);

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${config.apiUrl}/qubinest/allusers`);
        const employeeData = response.data.find(emp => emp.employeeId === employeeId.split(':')[1]);
        if (employeeData) {
          setEmployee(employeeData);
        }
      } catch (error) {
        setError('Error fetching employee details');
      }
    };

    const fetchAttendance = async () => {
      try {
        const response = await axios.get(`${config.apiUrl}/qubinest/singleUserAttendance/${employeeId.split(':')[1]}`);
        setAttendance(response.data);
        setFilteredAttendance(response.data);
        setLoading(false);
      } catch (error) {
        setError('Error fetching attendance');
        setLoading(false);
      }
    };

    const fetchAvgTimings = async () => {
      try {
        const response = await axios.get(`${config.apiUrl}/qubinest/allAttendance/${employeeId.split(':')[1]}`);
        setAvgTimings(response.data);
      } catch (error) {
        setError('Error fetching average timings');
      }
    };

    fetchEmployeeDetails();
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
      const selectedIds = selectedRecords.map(record => record.id);
      const response = await axios.post(`${config.apiUrl}/qubinest/approveAttendance`, {
        employeeId: employeeId.split(':')[1],
        adminEmail,
        year,
        month,
        selectedIds
      });

      if (response.status === 200) {
        console.log('Attendance approved successfully');
        toast.success("Approved Successfully")

        const updatedAttendance = filteredAttendance.map(record => ({
          ...record,
          status: selectedIds.includes(record.id) ? 'approved' : record.status
        }));

        setFilteredAttendance(updatedAttendance);
        setAttendance(prevAttendance =>
          prevAttendance.map(record => ({
            ...record,
            status: selectedIds.includes(record.id)
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
      const selectedIds = selectedRecords.map(record => record.id);
      const response = await axios.post(`${config.apiUrl}/qubinest/declineAttendance`, {
        employeeId: employeeId.split(':')[1],
        adminEmail,
        year,
        month,
        selectedIds
      });

      if (response.status === 200) {
        console.log('Attendance declined successfully');
        toast.success("Declined Successfully")

        const updatedAttendance = filteredAttendance.map(record => ({
          ...record,
          status: selectedIds.includes(record.id) ? 'declined' : record.status
        }));

        setFilteredAttendance(updatedAttendance);
        setAttendance(prevAttendance =>
          prevAttendance.map(record => ({
            ...record,
            status: selectedIds.includes(record.id)
              ? 'declined'
              : record.status
          }))
        );
      }
    } catch (error) {
      console.error('Error declining attendance:', error);
    }
  };

  const handleSelectRecord = (record) => {
    setSelectedRecords(prevSelected => {
      if (prevSelected.includes(record)) {
        return prevSelected.filter(r => r !== record);
      } else {
        return [...prevSelected, record];
      }
    });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRecords(filteredAttendance);
    } else {
      setSelectedRecords([]);
    }
  };

  const renderReport = (reportContent) => {
    if (!reportContent) return '---';
    
    // Sanitize the HTML content
    const sanitizedContent = DOMPurify.sanitize(reportContent);
    
    return (
      <div 
        className="report-content max-w-md overflow-auto"
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />
    );
  };

  return (
    <>
      <Header />
      <Sidemenu />
      <div className="content-wrapper">
        <section className="container px-4 mx-auto">
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p>{error}</p>
          ) : (
            <>
              {employee && (
                <h2 className="text-xl font-medium text-gray-800 text-center">
                  Employee Attendance of {employeeTitle} {employee.username}
                </h2>
              )}
              {/* <section className="text-gray-600 body-font">
                <div className="container px-5 py-24 mx-auto">
                  <div className="flow-root rounded-lg border border-gray-100 py-3 shadow-sm">
                    <dl className="-my-3 divide-y divide-gray-100 text-sm">
                      <div className="grid grid-cols-1 gap-1 p-3 sm:grid-cols-3 sm:gap-4">
                        <dt className="font-medium text-gray-900">Title</dt>
                        <dd className="text-gray-700 sm:col-span-2">{employeeTitle || 'N/A'}</dd>
                      </div>
                      <div className="grid grid-cols-1 gap-1 p-3 sm:grid-cols-3 sm:gap-4">
                        <dt className="font-medium text-gray-900">Name</dt>
                        <dd className="text-gray-700 sm:col-span-2">{employee?.username || 'N/A'}</dd>
                      </div>
                      <div className="grid grid-cols-1 gap-1 p-3 sm:grid-cols-3 sm:gap-4">
                        <dt className="font-medium text-gray-900">Occupation</dt>
                        <dd className="text-gray-700 sm:col-span-2">{employee?.mainPosition || 'N/A'}</dd>
                      </div>
                      <div className="grid grid-cols-1 gap-1 p-3 sm:grid-cols-3 sm:gap-4">
                        <dt className="font-medium text-gray-900">Salary</dt>
                        <dd className="text-gray-700 sm:col-span-2">{employee?.salary || 'N/A'}</dd>
                      </div>
                      <div className="grid grid-cols-1 gap-1 p-3 sm:grid-cols-3 sm:gap-4">
                        <dt className="font-medium text-gray-900">Bio</dt>
                        <dd className="text-gray-700 sm:col-span-2">{employee?.bio || 'N/A'}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </section> */}
              <div className="flex flex-col mt-6">
                <div className="topbar-table flex justify-between p-3">
                  <div className="dropdowns flex gap-3">
                    <select
                      value={year}
                      className="p-2 rounded-md font-semibold bg-gray-200"
                      onChange={(e) => setYear(parseInt(e.target.value, 10))}
                    >
                      {[...Array(5)].map((_, index) => (
                        <option key={index} value={new Date().getFullYear() - index}>
                          {new Date().getFullYear() - index}
                        </option>
                      ))}
                    </select>
                    <select
                      className="p-2 bg-gray-200 ml-1 font-semibold rounded-md"
                      value={month}
                      onChange={(e) => setMonth(parseInt(e.target.value, 10))}
                    >
                      {[...Array(12)].map((_, index) => (
                        <option key={index} value={index + 1}>
                          {index + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="btns flex gap-3">
                    <button className="font-semibold text-green-500" onClick={handleApprove}>
                      Approve
                    </button>
                    <button className="font-semibold text-red-500" onClick={handleDecline}>
                      Decline
                    </button>
                  </div>
                </div>
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                    <div className="overflow-hidden border border-gray-200 md:rounded-lg">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              <input
                                type="checkbox"
                                className="form-checkbox"
                                onChange={handleSelectAll}
                                checked={selectedRecords.length === filteredAttendance.length}
                              />
                            </th>
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
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  <input
                                    type="checkbox"
                                    className="form-checkbox"
                                    checked={selectedRecords.includes(record)}
                                    onChange={() => handleSelectRecord(record)}
                                  />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {new Date(record.date).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {new Date(record.checkin_Time).toLocaleTimeString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {record.checkout_Time ? new Date(record.checkout_Time).toLocaleTimeString() : '---'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.status}</td>
                                <td className="px-6 py-4 whitespace-normal text-sm text-gray-500">
                                  {renderReport(record.reports)}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="6" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
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
            </>
          )}
        </section>
      </div>
      <Footer />
    </>
  );
};

export default SingleEmployeeAttendance;
