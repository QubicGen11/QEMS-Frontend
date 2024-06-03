import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import Header from '../Homepage Components/Header';
import Sidemenu from '../Homepage Components/Sidemenu';
import Footer from '../Homepage Components/Footer';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const ViewTimesheets = () => {
  const [userAttendance, setUserAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/qubinest/attendance/${email}`);
        setUserAttendance(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching attendance data:', error);
        setLoading(false);
      }
    };

    fetchAttendance();

    const intervalId = setInterval(fetchAttendance, 100); // Polling every 5 seconds

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, [email]);

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
                <div className="btn-group ml-4">
                  <button type="button" className="btn btn-success">
                    Approve
                  </button>
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
                        <td colSpan="5">Loading...</td>
                      </tr>
                    ) : userAttendance.length === 0 ? (
                      <tr>
                        <td colSpan="5">No attendance records found</td>
                      </tr>
                    ) : (
                      userAttendance.map((attendance, index) => (
                        <tr key={index}>
                          <td>{new Date(attendance.date).toLocaleDateString()}</td>
                          <td>{attendance.checkin_Time ? new Date(attendance.checkin_Time).toLocaleTimeString() : 'N/A'}</td>
                          <td>{attendance.checkout_Time ? new Date(attendance.checkout_Time).toLocaleTimeString() : 'N/A'}</td>
                          <td>{attendance.status}</td>
                          <td>{attendance.reports}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  {/* <tfoot>
                    <tr>
                      <th>Date</th>
                      <th>Check in time</th>
                      <th>Check out</th>
                      <th>Reports</th>
                      <th>Status</th>
                    </tr>
                  </tfoot> */}
                </table>
              </div>
            </div>
            <div className="row px-10">
              <div className="col-sm-12 col-md-5">
                <div className="dataTables_info" id="example1_info" role="status" aria-live="polite">
                  Showing 1 to 10 of {userAttendance.length} entries
                </div>
              </div>
              <div className="col-sm-12 col-md-7">
                <div className="dataTables_paginate paging_simple_numbers" id="example1_paginate">
                  <ul className="pagination">
                    <li className="paginate_button page-item previous disabled" id="example1_previous">
                      <a href="#" aria-controls="example1" data-dt-idx={0} tabIndex={0} className="page-link">
                        Previous
                      </a>
                    </li>
                    <li className="paginate_button page-item active">
                      <a href="#" aria-controls="example1" data-dt-idx={1} tabIndex={0} className="page-link">
                        1
                      </a>
                    </li>
                    <li className="paginate_button page-item">
                      <a href="#" aria-controls="example1" data-dt-idx={2} tabIndex={0} className="page-link">
                        2
                      </a>
                    </li>
                    <li className="paginate_button page-item">
                      <a href="#" aria-controls="example1" data-dt-idx={3} tabIndex={0} className="page-link">
                        3
                      </a>
                    </li>
                    <li className="paginate_button page-item">
                      <a href="#" aria-controls="example1" data-dt-idx={4} tabIndex={0} className="page-link">
                        4
                      </a>
                    </li>
                    <li className="paginate_button page-item">
                      <a href="#" aria-controls="example1" data-dt-idx={5} tabIndex={0} className="page-link">
                        5
                      </a>
                    </li>
                    <li className="paginate_button page-item">
                      <a href="#" aria-controls="example1" data-dt-idx={6} tabIndex={0} className="page-link">
                        6
                      </a>
                    </li>
                    <li className="paginate_button page-item next" id="example1_next">
                      <a href="#" aria-controls="example1" data-dt-idx={7} tabIndex={0} className="page-link">
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
