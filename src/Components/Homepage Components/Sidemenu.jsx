import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Sidemenu = () => {
  const [isTimeSheetsOpen, setIsTimeSheetsOpen] = useState(false);
  const [isEarningsOpen, setIsEarningsOpen] = useState(false);
  const [isPerformanceMetricsOpen, setIsPerformanceMetricsOpen] = useState(false);
  const [isFormsOpen, setIsFormsOpen] = useState(false);
  const [isTablesOpen, setIsTablesOpen] = useState(false);

  const toggleDropdown = (setter, currentState) => {
    setter(!currentState);
  };

  return (
    <>
      <aside className="main-sidebar sidebar-dark-primary elevation-4">
        <div className="sidebar">
          <div className="w-40 mt-3 pb-3 mb-3 d-flex">
            <div className="flex gap-9">
              <img
                src="https://res.cloudinary.com/defsu5bfc/image/upload/v1715348582/og_6_jqnrvf.png"
                className="w-96"
                alt="User Image"
              />
               <li className="nav-item lg:hidden w-3">
                        <a className="nav-link" data-widget="pushmenu" href="#" role="button"><i className="fas fa-bars" /></a>
                    </li>
            </div>
          </div>
          <div className="form-inline">
            <div className="input-group" data-widget="sidebar-search">
              <input
                className="form-control form-control-sidebar"
                type="search"
                placeholder="Search"
                aria-label="Search"
              />
              <div className="input-group-append">
                <button className="btn btn-sidebar">
                  <i className="fas fa-search fa-fw" />
                </button>
              </div>
            </div>
          </div>
          <nav className="mt-2">
            <ul
              className="nav nav-pills nav-sidebar flex-column"
              data-widget="treeview"
              role="menu"
              data-accordion="false"
            >
              <li className="nav-item ">
                <Link to="/dashboard" className="nav-link">
                  <i className="nav-icon fas fa-tachometer-alt" />
                  <p>Console</p>
                </Link>
              </li>

              <li className="nav-item">
                <a
                  href="#"
                  className="nav-link"
                  onClick={() => toggleDropdown(setIsTimeSheetsOpen, isTimeSheetsOpen)}
                >
                  <i className="nav-icon fas fa-copy" />
                  <p>
                    Time Sheets
                    <i className="fas fa-angle-left right" />
                  </p>
                </a>
                <ul className={`nav nav-treeview ${isTimeSheetsOpen ? 'd-block' : 'd-none'}`}>
                  <li className="nav-item">
                    <Link to="/viewtimesheets" className="nav-link">
                      <i className="far fa-circle nav-icon" />
                      <p>View Timesheets</p>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/booktimeoff" className="nav-link">
                      <i className="far fa-circle nav-icon" />
                      <p>Book Timeoff</p>
                    </Link>
                  </li>
                </ul>
              </li>

              <li className="nav-item">
                <a
                  href="#"
                  className="nav-link"
                  onClick={() => toggleDropdown(setIsEarningsOpen, isEarningsOpen)}
                >
                  <i className="nav-icon fas fa-chart-pie" />
                  <p>
                    Earnings
                    <i className="right fas fa-angle-left" />
                  </p>
                </a>
                <ul className={`nav nav-treeview ${isEarningsOpen ? 'd-block' : 'd-none'}`}>
                  <li className="nav-item">
                    <a href="pages/charts/chartjs.html" className="nav-link">
                      <i className="far fa-circle nav-icon" />
                      <p>Profile</p>
                    </a>
                  </li>
                  <li className="nav-item">
                    <Link to="/payslips" className="nav-link">
                      <i className="far fa-circle nav-icon" />
                      <p>Payslips</p>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/documents" className="nav-link">
                      <i className="far fa-circle nav-icon" />
                      <p>Documents</p>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <a href="pages/charts/uplot.html" className="nav-link">
                      <i className="far fa-circle nav-icon" />
                      <p>PF</p>
                    </a>
                  </li>
                  <li className="nav-item">
                    <a href="pages/charts/uplot.html" className="nav-link">
                      <i className="far fa-circle nav-icon" />
                      <p>Form16</p>
                    </a>
                  </li>
                </ul>
              </li>

              <li className="nav-item">
                <a
                  href="#"
                  className="nav-link"
                  onClick={() => toggleDropdown(setIsPerformanceMetricsOpen, isPerformanceMetricsOpen)}
                >
                  <i className="nav-icon fas fa-tree" />
                  <p>
                    Performance Metrics
                    <i className="fas fa-angle-left right" />
                  </p>
                </a>
                <ul className={`nav nav-treeview ${isPerformanceMetricsOpen ? 'd-block' : 'd-none'}`}>
                  <li className="nav-item">
                    <a href="pages/UI/general.html" className="nav-link">
                      <i className="far fa-circle nav-icon" />
                      <p>Apply Goals</p>
                    </a>
                  </li>
                  <li className="nav-item">
                    <a href="pages/UI/icons.html" className="nav-link">
                      <i className="far fa-circle nav-icon" />
                      <p>Achievements</p>
                    </a>
                  </li>
                 
             
                  
                 
                </ul>
              </li>

              <li className="nav-item">
                <a
                  href="#"
                  className="nav-link"
                  onClick={() => toggleDropdown(setIsFormsOpen, isFormsOpen)}
                >
                  <i className="nav-icon fas fa-edit" />
                  <p>
                    Trainings 
                  </p>
                </a>
             
              </li>

              <li className="nav-item">
                <a
                  href="#"
                  className="nav-link"
                  onClick={() => toggleDropdown(setIsTablesOpen, isTablesOpen)}
                >
                  <i className="nav-icon fas fa-table" />
                  <p>
                    Help
                  </p>
                </a>
            
              </li>
            </ul>
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidemenu;