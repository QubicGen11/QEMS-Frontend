import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Cookies from 'js-cookie';
import axios from 'axios';
import {
  faBars,
  faSearch,
  faTachometerAlt,
  faCopy,
  faAngleLeft,
  faChartPie,
  faUser,
  faEdit,
  faTable,
  faFileAlt,
  faBalanceScale,
  faCheckSquare,
  faListAlt,
  faCircle,
  faPlusCircle,
  faTree,
  faTrophy,
  faCalendarAlt,
  faUserAlt,
  faPersonThroughWindow,
  faClock,
  faClipboardList,
  faPiggyBank,
  faAngleRight
} from '@fortawesome/free-solid-svg-icons';
import config from '../config';
import { CiBank } from 'react-icons/ci';

const Sidemenu = () => {
  const [isTimeSheetsOpen, setIsTimeSheetsOpen] = useState(false);
  const [isEarningsOpen, setIsEarningsOpen] = useState(false);
  const [isPerformanceMetricsOpen, setIsPerformanceMetricsOpen] = useState(false);
  const [isFormsOpen, setIsFormsOpen] = useState(false);
  const [isTablesOpen, setIsTablesOpen] = useState(false);
  const [isEmployeesOpen, setIsEmployeesOpen] = useState(false);
  const [isLeaveOpen, setIsLeaveOpen] = useState(false);
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);
  const [isTeamsOpen, setIsTeamsOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);

  const companyEmail = Cookies.get('email'); // Assuming the email of the current user is stored in cookies
  const token = Cookies.get('token');
  const decodedToken = token ? JSON.parse(atob(token.split('.')[1])) : null;
  const mainPosition = decodedToken?.mainPosition;


  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await axios.post(`${config.apiUrl}/qubinest/authUser`, {
          userEmail: companyEmail
        });
        setUserRole(response.data.role);
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
    };

    fetchUserRole();
  }, [companyEmail]);

  const toggleDropdown = (setter, currentState) => {
    setter(!currentState);
  };

  return (
    <>
      <aside className="main-sidebar sidebar-dark-primary elevation-4 fixed top-0 left-0 h-full" 
        style={{ 
          backgroundColor: "rgba(0,0,0,0.9)", 
          backdropFilter: "blur(30px)",
          zIndex: 1040  // This ensures sidebar appears above content but below header
        }}>
        <div className="sidebar">
          <div className="w-40 mt-3 pb-3 mb-3 d-flex">
            <div className="flex gap-9">
              <img
                src="https://res.cloudinary.com/defsu5bfc/image/upload/v1715348582/og_6_jqnrvf.png"
                className="w-96"
                alt="User Image"
              />
              <li className="nav-item lg:hidden w-3">
                <a className="nav-link" data-widget="pushmenu" href="#" role="button">
                  <FontAwesomeIcon icon={faBars} />
                </a>
              </li>
            </div>
          </div>
          <div className="form-inline">
            <div className="input-group" data-widget="sidebar-search">
              <input
                className="form-control form-control-sidebar bg-white"
                type="search"
                placeholder="Search"
                aria-label="Search"
              />
              <div className="input-group-append">
                <button className="btn btn-sidebar">
                  <FontAwesomeIcon icon={faSearch} />
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
              <li className="nav-item">
                <Link to="/dashboard" className="nav-link">
                  <FontAwesomeIcon icon={faTachometerAlt} className="nav-icon" />
                  <p>Console</p>
                </Link>
              </li>

              {(userRole === 'Admin' || userRole === 'Manager') && (
                <li className="nav-item">
                  <a
                    href="#"
                    className="nav-link"
                    onClick={() => toggleDropdown(setIsAttendanceOpen, isAttendanceOpen)}
                  >
                    <FontAwesomeIcon icon={faClock} className="nav-icon" />
                    <p>
                      Attendance
                      <FontAwesomeIcon icon={faAngleLeft} className="right" />
                    </p>
                  </a>
                  <ul className={`nav nav-treeview ${isAttendanceOpen ? 'd-block' : 'd-none'}`}>
                    <li className="nav-item">
                      <Link to="/todaysattendance" className="nav-link">
                        <FontAwesomeIcon icon={faClipboardList} className="nav-icon" />
                        <p>Today's Attendance</p>
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link to="/employeeattendance" className="nav-link">
                        <FontAwesomeIcon icon={faUser} className="nav-icon" />
                        <p>Employee Attendance</p>
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link to="/attendancesheet" className="nav-link">
                        <FontAwesomeIcon icon={faFileAlt} className="nav-icon" />
                        <p>Attendance Sheet</p>
                      </Link>
                    </li>
                  </ul>
                </li>
              )}

              
                {(userRole === 'Admin' || mainPosition === 'Lead Generation' || mainPosition === 'Executive') && (
                  <li className="nav-item">
                    <a
                      href="/cms"
                      className="nav-link"
                      onClick={() => toggleDropdown(setIsAttendanceOpen, isAttendanceOpen)}
                    >
                      <FontAwesomeIcon icon={faClock} className="nav-icon" />
                      <p>
                        CMC
                        <FontAwesomeIcon icon={faAngleRight} className="right" />
                      </p>
                    </a>
                  </li>
                )}
         

              {/* {(userRole === 'Admin' || userRole === 'Manager') && (
                <li className="nav-item">
                  <a
                    href="#"
                    className="nav-link"
                    onClick={() => toggleDropdown(setIsTeamsOpen, isTeamsOpen)}
                  >
                    <FontAwesomeIcon icon={faClock} className="nav-icon" />
                    <p>
                      Teams
                      <FontAwesomeIcon icon={faAngleLeft} className="right" />
                    </p>
                  </a>
                  <ul className={`nav nav-treeview ${isTeamsOpen ? 'd-block' : 'd-none'}`}>
                    <li className="nav-item">
                      <Link to="/createTeam" className="nav-link">
                        <FontAwesomeIcon icon={faClipboardList} className="nav-icon" />
                        <p>Create Team</p>
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link to="/editTeam" className="nav-link">
                        <FontAwesomeIcon icon={faUser} className="nav-icon" />
                        <p>Edit Team</p>
                      </Link>
                    </li>
                  </ul>
                </li>
              )} */}

              <li className="nav-item">
                <a
                  href="#"
                  className="nav-link"
                  onClick={() => toggleDropdown(setIsTimeSheetsOpen, isTimeSheetsOpen)}
                >
                  <FontAwesomeIcon icon={faCopy} className="nav-icon" />
                  <p>
                    Time Sheets
                    <FontAwesomeIcon icon={faAngleRight} className="right" />
                  </p>
                </a>
                <ul className={`nav nav-treeview ${isTimeSheetsOpen ? 'd-block' : 'd-none'}`}>
                  <li className="nav-item">
                    <Link to="/viewtimesheets" className="nav-link">
                      <FontAwesomeIcon icon={faUser} className="nav-icon" />
                      <p>View Timesheets</p>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/booktimeoff" className="nav-link">
                      <FontAwesomeIcon icon={faCalendarAlt} className="nav-icon" />
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
                  <FontAwesomeIcon icon={faChartPie} className="nav-icon" />
                  <p>
                    Earnings
                    <FontAwesomeIcon icon={faAngleRight} className="right" />
                  </p>
                </a>
                <ul className={`nav nav-treeview ${isEarningsOpen ? 'd-block' : 'd-none'}`}>
                  <li className="nav-item">
                    <Link to="/profile" className="nav-link">
                      <FontAwesomeIcon icon={faUser} className="nav-icon" />
                      <p>Profile</p>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/payslips" className="nav-link">
                      <FontAwesomeIcon icon={faFileAlt} className="nav-icon" />
                      <p>Payslips</p>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/documents" className="nav-link">
                      <FontAwesomeIcon icon={faListAlt} className="nav-icon" />
                      <p>Documents</p>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <a href="#" className="nav-link">
                      <FontAwesomeIcon icon={faBalanceScale} className="nav-icon" />
                      <p>PF</p>
                    </a>
                  </li>
                  <li className="nav-item">
                    <a href="#" className="nav-link">
                      <FontAwesomeIcon icon={faCheckSquare} className="nav-icon" />
                      <p>Form16</p>
                    </a>
                  </li>
                </ul>
              </li>

              {(userRole === 'Manager' || userRole === 'Admin') && (
                <>
                  <li className="nav-item">
                    <a
                      href="#"
                      className="nav-link"
                      onClick={() => toggleDropdown(setIsEmployeesOpen, isEmployeesOpen)}
                    >
                      <FontAwesomeIcon icon={faUserAlt} className="nav-icon" />
                      <p>
                        Employees
                        <FontAwesomeIcon icon={faAngleLeft} className="right" />
                      </p>
                    </a>
                    <ul className={`nav nav-treeview ${isEmployeesOpen ? 'd-block' : 'd-none'}`}>
                      <li className="nav-item">
                        <Link to="/allemployees" className="nav-link">
                          <FontAwesomeIcon icon={faCircle} className="nav-icon" />
                          <p>All Employees</p>
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link to="/qubicgenregistrationpageabcdefghijklmnopqrstuvwxyz" className="nav-link">
                          <FontAwesomeIcon icon={faPlusCircle} className="nav-icon" />
                          <p>Add Employees</p>
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link to="/profile/edit-bank-details" className="nav-link">
                          <FontAwesomeIcon icon={faPiggyBank} className="nav-icon" />
                          <p>Add Bank Details</p>
                        </Link>
                      </li>
                    </ul>
                  </li>

                  <li className="nav-item">
                    <a
                      href="#"
                      className="nav-link"
                      onClick={() => toggleDropdown(setIsLeaveOpen, isLeaveOpen)}
                    >
                      <FontAwesomeIcon icon={faPersonThroughWindow} className="nav-icon" />
                      <p>
                        Leave Management
                        <FontAwesomeIcon icon={faAngleLeft} className="right" />
                      </p>
                    </a>
                    <ul className={`nav nav-treeview ${isLeaveOpen ? 'd-block' : 'd-none'}`}>
                      <li className="nav-item">
                        <Link to="/allemployeleaverequests" className="nav-link">
                          <FontAwesomeIcon icon={faCircle} className="nav-icon" />
                          <p>All Leave Requests</p>
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link to="/allemployeleaves" className="nav-link">
                          <FontAwesomeIcon icon={faCircle} className="nav-icon" />
                          <p>Employee Leaves</p>
                        </Link>
                      </li>


                    </ul>
                  </li>
                </>
              )}

              {/* <li className="nav-item">
                <a
                  href="#"
                  className="nav-link"
                  onClick={() => toggleDropdown(setIsPerformanceMetricsOpen, isPerformanceMetricsOpen)}
                >
                  <FontAwesomeIcon icon={faTree} className="nav-icon" />
                  <p>
                    Performance Metrics
                    <FontAwesomeIcon icon={faAngleLeft} className="right" />
                  </p>
                </a>
                <ul className={`nav nav-treeview ${isPerformanceMetricsOpen ? 'd-block' : 'd-none'}`}>
                  <li className="nav-item">
                    <a href="#" className="nav-link">
                      <FontAwesomeIcon icon={faCheckSquare} className="nav-icon" />
                      <p>Apply Goals</p>
                    </a>
                  </li>
                  <li className="nav-item">
                    <a href="#" className="nav-link">
                      <FontAwesomeIcon icon={faTrophy} className="nav-icon" />
                      <p>Achievements</p>
                    </a>
                  </li>
                </ul>
              </li> */}

              <li className="nav-item"><a href="/anonymous-suggestion" className="nav-link" onClick={() => toggleDropdown(setIsFormsOpen, isFormsOpen)}><FontAwesomeIcon icon={faEdit} className="nav-icon" /><p className='w-48'>Suggestions</p></a></li>

              <li className="nav-item">
                <a
                  href="#"
                  className="nav-link"
                  onClick={() => toggleDropdown(setIsTablesOpen, isTablesOpen)}
                >
                  <FontAwesomeIcon icon={faTable} className="nav-icon" />
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
