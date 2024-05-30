import React from 'react';
import Header from '../Homepage Components/Header';
import Sidemenu from '../Homepage Components/Sidemenu';
import Footer from '../Homepage Components/Footer';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
const ViewTimesheets = () => {

  // This is for exporting into xl
  const exportToExcel = () => {
    const table = document.getElementById('example1');
    const ws = XLSX.utils.table_to_sheet(table);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, "table_data.xlsx");
  };

// This is for pdf
  
const exportToPDF = () => {
  const input = document.getElementById('example1');
  html2canvas(input)
    .then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: "landscape",
      });
      const imgProps= pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save("table_data.pdf");
    });
};
  return (
    <>
      <Header />

      <Sidemenu />

      <div className="content-wrapper">
        <div className="card-body" bis_skin_checked={1}>
          <h1 className="text-3xl px-10">Time Sheets</h1>




          <div
            id="example1_wrapper"
            className="dataTables_wrapper dt-bootstrap4 mt-2"
            bis_skin_checked={1}
            style={{ width: '80vw' }}
          >
            <div className="row px-10" bis_skin_checked={1}>
              <div className="col-sm-12 col-md-6 " bis_skin_checked={1}>

                {/* This is for export btn  */}
                <div className="btn-group">
                  <button type="button" className="btn btn-success dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    Export as
                  </button>
                  <div className="dropdown-menu">
                  <button className="dropdown-item" onClick={exportToExcel}>Excel</button>
        <button className="dropdown-item" onClick={exportToPDF}>PDF</button>
                    </div>
                </div>

                
                {/* This is for filter btn */}
                <div className="btn-group ml-4">
                  <button type="button" className="btn btn-success dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                   Filter by
                  </button>
                  <div className="dropdown-menu">
                  <button className="dropdown-item" onClick={exportToExcel}>Month</button>
        <button className="dropdown-item" onClick={exportToPDF}>Year</button>
                    </div>
                </div>


                {/* This is for Approve btn */}
                <div className="btn-group ml-4">
                  <button type="button" className="btn btn-success" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                   Approve
                  </button>
                 
                </div>



              </div>
              <div className="col-sm-12 col-md-6" bis_skin_checked={1}>
                <div
                  id="example1_filter"
                  className="dataTables_filter"
                  bis_skin_checked={1}
                >
                  <label>
                    Search:
                    <input
                      type="search"
                      className="form-control form-control-sm"
                      placeholder
                      aria-controls="example1"
                    />
                  </label>
                </div>
              </div>
            </div>


            <div className="row px-10" bis_skin_checked={1} >
              <div className="col-sm-12" bis_skin_checked={1}>
                <table
                  id="example1"
                  className="table table-bordered table-striped dataTable dtr-inline"
                  aria-describedby="example1_info"
                >
                  <thead style={{ overflow: 'scroll' }}>
                    <tr>
                      <th
                        className="sorting"
                        tabIndex={0}
                        aria-controls="example1"
                        rowSpan={1}
                        colSpan={1}
                        aria-label="Rendering engine: activate to sort column ascending"
                      >
                        Date
                      </th>
                      <th
                        className="sorting"
                        tabIndex={0}
                        aria-controls="example1"
                        rowSpan={1}
                        colSpan={1}
                        aria-label="Browser: activate to sort column ascending"
                      >
                        Check in time
                      </th>
                      <th
                        className="sorting sorting_asc"
                        tabIndex={0}
                        aria-controls="example1"
                        rowSpan={1}
                        colSpan={1}
                        aria-label="Platform(s): activate to sort column descending"
                        cursorshover="true"
                        aria-sort="ascending"
                      >
                        Check out
                      </th>
                      <th
                        className="sorting"
                        tabIndex={0}
                        aria-controls="example1"
                        rowSpan={1}
                        colSpan={1}
                        aria-label="Engine version: activate to sort column ascending"
                      >
                        Reports
                      </th>
                      <th
                        className="sorting"
                        tabIndex={0}
                        aria-controls="example1"
                        rowSpan={1}
                        colSpan={1}
                        aria-label="CSS grade: activate to sort column ascending"
                      >
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="odd">
                      <td className="dtr-control">Other browsers</td>
                      <td>All others</td>
                      <td className="sorting_1">-</td>
                      <td>-</td>
                      <td>U</td>
                    </tr>
                    <tr className="even">
                      <td className="dtr-control">Misc</td>
                      <td>NetFront 3.1</td>
                      <td className="sorting_1">Embedded devices</td>
                      <td>-</td>
                      <td>C</td>
                    </tr>
                    <tr className="odd">
                      <td className="dtr-control">Misc</td>
                      <td>NetFront 3.4</td>
                      <td className="sorting_1">Embedded devices</td>
                      <td>-</td>
                      <td>A</td>
                    </tr>
                    <tr className="even">
                      <td className="dtr-control">Misc</td>
                      <td>Dillo 0.8</td>
                      <td className="sorting_1">Embedded devices</td>
                      <td>-</td>
                      <td>X</td>
                    </tr>
                    <tr className="odd">
                      <td className="dtr-control">Gecko</td>
                      <td>Epiphany 2.20</td>
                      <td className="sorting_1">Gnome</td>
                      <td>1.8</td>
                      <td>A</td>
                    </tr>
                    <tr className="even">
                      <td className="dtr-control">Webkit</td>
                      <td>iPod Touch / iPhone</td>
                      <td className="sorting_1">iPod</td>
                      <td>420.1</td>
                      <td>A</td>
                    </tr>
                    <tr className="odd">
                      <td className="dtr-control">KHTML</td>
                      <td>Konqureror 3.1</td>
                      <td className="sorting_1">KDE 3.1</td>
                      <td>3.1</td>
                      <td>C</td>
                    </tr>
                    <tr className="even">
                      <td className="dtr-control">KHTML</td>
                      <td>Konqureror 3.3</td>
                      <td className="sorting_1">KDE 3.3</td>
                      <td>3.3</td>
                      <td>A</td>
                    </tr>
                    <tr className="odd">
                      <td className="dtr-control">KHTML</td>
                      <td>Konqureror 3.5</td>
                      <td className="sorting_1">KDE 3.5</td>
                      <td>3.5</td>
                      <td>A</td>
                    </tr>
                    <tr className="even">
                      <td className="dtr-control">Tasman</td>
                      <td>Internet Explorer 5.1</td>
                      <td className="sorting_1">Mac OS 7.6-9</td>
                      <td>1</td>
                      <td>C</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr>
                      <th rowSpan={1} colSpan={1}>
                        Rendering engine
                      </th>
                      <th rowSpan={1} colSpan={1}>
                        Browser
                      </th>
                      <th rowSpan={1} colSpan={1}>
                        Platform(s)
                      </th>
                      <th rowSpan={1} colSpan={1}>
                        Engine version
                      </th>
                      <th rowSpan={1} colSpan={1}>
                        CSS grade
                      </th>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            <div className="row px-10" bis_skin_checked={1}>
              <div className="col-sm-12 col-md-5" bis_skin_checked={1}>
                <div
                  className="dataTables_info"
                  id="example1_info"
                  role="status"
                  aria-live="polite"
                  bis_skin_checked={1}
                >
                  Showing 1 to 10 of 57 entries
                </div>
              </div>
              <div className="col-sm-12 col-md-7" bis_skin_checked={1}>
                <div
                  className="dataTables_paginate paging_simple_numbers"
                  id="example1_paginate"
                  bis_skin_checked={1}
                >
                  <ul className="pagination">
                    <li
                      className="paginate_button page-item previous disabled"
                      id="example1_previous"
                    >
                      <a
                        href="#"
                        aria-controls="example1"
                        data-dt-idx={0}
                        tabIndex={0}
                        className="page-link"
                      >
                        Previous
                      </a>
                    </li>
                    <li className="paginate_button page-item active">
                      <a
                        href="#"
                        aria-controls="example1"
                        data-dt-idx={1}
                        tabIndex={0}
                        className="page-link"
                      >
                        1
                      </a>
                    </li>
                    <li className="paginate_button page-item ">
                      <a
                        href="#"
                        aria-controls="example1"
                        data-dt-idx={2}
                        tabIndex={0}
                        className="page-link"
                      >
                        2
                      </a>
                    </li>
                    <li className="paginate_button page-item ">
                      <a
                        href="#"
                        aria-controls="example1"
                        data-dt-idx={3}
                        tabIndex={0}
                        className="page-link"
                      >
                        3
                      </a>
                    </li>
                    <li className="paginate_button page-item ">
                      <a
                        href="#"
                        aria-controls="example1"
                        data-dt-idx={4}
                        tabIndex={0}
                        className="page-link"
                      >
                        4
                      </a>
                    </li>
                    <li className="paginate_button page-item ">
                      <a
                        href="#"
                        aria-controls="example1"
                        data-dt-idx={5}
                        tabIndex={0}
                        className="page-link"
                      >
                        5
                      </a>
                    </li>
                    <li className="paginate_button page-item ">
                      <a
                        href="#"
                        aria-controls="example1"
                        data-dt-idx={6}
                        tabIndex={0}
                        className="page-link"
                      >
                        6
                      </a>
                    </li>
                    <li
                      className="paginate_button page-item next"
                      id="example1_next"
                    >
                      <a
                        href="#"
                        aria-controls="example1"
                        data-dt-idx={7}
                        tabIndex={0}
                        className="page-link"
                      >
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
