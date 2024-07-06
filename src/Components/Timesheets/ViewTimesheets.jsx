import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import Header from '../Homepage Components/Header';
import Sidemenu from '../Homepage Components/Sidemenu';
import Footer from '../Homepage Components/Footer';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { fetchAttendanceData } from '../Homepage Components/api';
import Loading from '../Loading Components/Loading';
import config from '../config';

// Function to deeply compare two arrays of objects
const deepEqual = (array1, array2) => {
  if (array1.length !== array2.length) return false;

  return array1.every((item, index) => {
    return JSON.stringify(item) === JSON.stringify(array2[index]);
  });
};

const ViewTimesheets = () => {
  const [userAttendance, setUserAttendance] = useState([]);
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const entriesPerPage = 5;
  const email = Cookies.get('email');

  const exportToExcel = () => {
    const table = document.getElementById('example1');
    const ws = XLSX.utils.table_to_sheet(table);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, "table_data.xlsx");
  };

  const exportToPDF = () => {
    const input = document.getElementById('example1');
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: "landscape",
      });
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save("table_data.pdf");
    });
  };

  const fetchAttendance = useCallback(async () => {
    try {
      const data = await fetchAttendanceData(email);
      if (!deepEqual(data, userAttendance)) {
        setUserAttendance(data);
      }
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    } finally {
      setLoading(false);
    }
  }, [email, userAttendance]);

  const authorizeUser = useCallback(async () => {
    try {
      const response = await axios.post(`${config.apiUrl}/qubinest/authUser`, { userEmail: email });
      setRole(response.data.role);
      console.log(response.data.role);
    } catch (error) {
      console.error('Error authorizing user:', error);
    }
  }, [email]);

  const handleApprove = async () => {
    try {
      const response = await axios.post(`${config.apiUrl}/qubinest/approveSingleAttendance`, {
        employeeId: email,
        adminEmail: email,
        selectedIds
      });

      if (response.status === 200) {
        console.log('Attendance approved successfully');
        fetchAttendance();
      }
    } catch (error) {
      console.error('Error approving attendance:', error);
    }
  };

  const handleDecline = async () => {
    try {
      const response = await axios.post(`${config.apiUrl}/qubinest/declineSingleAttendance`, {
        employeeId: email,
        adminEmail: email,
        selectedIds
      });

      if (response.status === 200) {
        console.log('Attendance declined successfully');
        fetchAttendance();
      }
    } catch (error) {
      console.error('Error declining attendance:', error);
    }
  };

  useEffect(() => {
    authorizeUser();
    fetchAttendance();
    const intervalId = setInterval(fetchAttendance, 30000);

    return () => clearInterval(intervalId);
  }, [authorizeUser, fetchAttendance]);

  useEffect(() => {
    console.log('Role:', role);
  }, [role]);

  const totalPages = Math.ceil(userAttendance.length / entriesPerPage);
  const currentEntries = userAttendance.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleCheckboxChange = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <>
      <Header />
      <Sidemenu />
      <div className="content-wrapper">
        <div className="card-body">
          <h1 className="text-3xl px-10">Time Sheets</h1>
          <div id="example1_wrapper" className="dataTables_wrapper dt-bootstrap4 mt-2" style={{ width: '80vw' }}>
            <div className="row px-10">
              <div className="col-sm-12 col-md-6">
                <div className="btn-group">
                  <button type="button" className="btn btn-success dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    Export as
                  </button>
                  <div className="dropdown-menu">
                    <button className="dropdown-item" onClick={exportToExcel}>Excel</button>
                    <button className="dropdown-item" onClick={exportToPDF}>PDF</button>
                  </div>
                </div>
                <div className="btn-group ml-4">
                  <button type="button" className="btn btn-success dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    Filter by
                  </button>
                  <div className="dropdown-menu">
                    <button className="dropdown-item">Month</button>
                    <button className="dropdown-item">Year</button>
                  </div>
                </div>
                
              </div>
              <div className="col-sm-12 col-md-6">
                <div id="example1_filter" className="dataTables_filter">
                  <label>
                    Search:
                    <input type="search" className="form-control form-control-sm" placeholder aria-controls="example1" />
                  </label>
                </div>
              </div>
            </div>
            <div className="row px-10">
              <div className="col-sm-12">
                <table id="example1" className="table table-bordered table-striped dataTable dtr-inline" aria-describedby="example1_info">
                  <thead style={{ overflow: 'scroll' }}>
                    <tr>
                      <th>Select</th>
                      <th>Date</th>
                      <th>Check in time</th>
                      <th>Check out</th>
                      <th>Status</th>
                      <th>Reports</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="6"><Loading /></td>
                      </tr>
                    ) : currentEntries.length === 0 ? (
                      <tr>
                        <td colSpan="6">No attendance records found</td>
                      </tr>
                    ) : (
                      currentEntries.map((attendance, index) => (
                        <tr key={attendance.id}>
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(attendance.id)}
                              onChange={() => handleCheckboxChange(attendance.id)}
                            />
                          </td>
                          <td>{new Date(attendance.date).toLocaleDateString()}</td>
                          <td>{attendance.checkin_Time ? new Date(attendance.checkin_Time).toLocaleTimeString() : 'N/A'}</td>
                          <td>{attendance.checkout_Time ? new Date(attendance.checkout_Time).toLocaleTimeString() : 'N/A'}</td>
                          <td>
                            {attendance.status === 'pending' ? (
                              <span className="text-warning font-bold text-yellow-600">Pending</span>
                            ) : attendance.status === 'approved' ? (
                              <span className="text-success font-bold text-green-600">Approved</span>
                            ) : (
                              <span className="text-danger font-bold text-red-600">Declined</span>
                            )}
                          </td>
                          <td>{attendance.reports}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="row px-10">
              <div className="col-sm-12 col-md-5">
                <div className="dataTables_info" id="example1_info" role="status" aria-live="polite">
                  Showing {(currentPage - 1) * entriesPerPage + 1} to {Math.min(currentPage * entriesPerPage, userAttendance.length)} of {userAttendance.length} entries
                </div>
              </div>
              <div className="col-sm-12 col-md-7">
                <div className="dataTables_paginate paging_simple_numbers" id="example1_paginate">
                  <ul className="pagination">
                    <li className={`paginate_button page-item previous ${currentPage === 1 ? 'disabled' : ''}`} id="example1_previous">
                      <a href="#" aria-controls="example1" data-dt-idx={0} tabIndex={0} className="page-link" onClick={() => handlePageChange(currentPage - 1)}>
                        Previous
                      </a>
                    </li>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <li key={i + 1} className={`paginate_button page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                        <a href="#" aria-controls="example1" data-dt-idx={i + 1} tabIndex={0} className="page-link" onClick={() => handlePageChange(i + 1)}>
                          {i + 1}
                        </a>
                      </li>
                    ))}
                    <li className={`paginate_button page-item next ${currentPage === totalPages ? 'disabled' : ''}`} id="example1_next">
                      <a href="#" aria-controls="example1" data-dt-idx={7} tabIndex={0} className="page-link" onClick={() => handlePageChange(currentPage + 1)}>
                        Next
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ViewTimesheets;
