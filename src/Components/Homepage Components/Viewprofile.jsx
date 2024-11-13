import React, { useEffect } from 'react';
import { Link, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import Sidemenu from './Sidemenu';
import Header from './Header';
import ViewBreadcrums from './Viewprofile/ViewBreadcrums';
import Viewleftpart from './Viewprofile/Viewleftpart';
import Viewpersonaldetails from './Viewprofile/Viewpersonaldetails';
import Viewprojectdetails from './Viewprofile/Viewprojectdetails';
import Viewpassword from './Viewprofile/Viewpassword';
import VieweditProfile from './Viewprofile/Vieweditprofile';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Cookies from 'js-cookie';
import config from '../config';
import axios from 'axios';
import useEmployeeStore from '../../store/employeeStore';

const Viewprofile = () => {
  const { employeeData, isLoading, updateEmployeeData } = useEmployeeStore();
  const email = Cookies.get('email');
  const location = useLocation();

  // For first-time users, show edit profile directly
  if (!employeeData && location.pathname === '/viewprofile/personal-details') {
    return <Navigate to="/viewprofile/edit-profile" replace />;
  }

  return (
    <>
      <Sidemenu />
      <Header />

      <div className="content-wrapper" style={{ minHeight: "1604.8px" }}>
        <ViewBreadcrums />

        <section className="content">
          <div className="container-fluid">
            <div className="row">
              <Viewleftpart />
              <div className="col-12 col-md-9 col-lg-8 col-xl-9">
                <div className="card widget-card border-light shadow-sm">
                  <div className="card-body p-4">
                    <ul className="nav nav-tabs" id="profileTab" role="tablist">
                      <li className="nav-item" role="presentation">
                        <Link to="/viewprofile/personal-details" className={`nav-link ${location.pathname === '/viewprofile/personal-details' ? 'active' : ''}`}>
                          Personal Details
                        </Link>
                      </li>
                      <li className="nav-item" role="presentation">
                        <Link to="/viewprofile/project-details" className={`nav-link ${location.pathname === '/viewprofile/project-details' ? 'active' : ''}`}>
                          Project Details
                        </Link>
                      </li>
                      <li className="nav-item" role="presentation">
                        <Link to="/viewprofile/password" className={`nav-link ${location.pathname === '/viewprofile/password' ? 'active' : ''}`}>
                          Password
                        </Link>
                      </li>
                      <li className="nav-item" role="presentation">
                        <Link to="/viewprofile/edit-profile" className={`nav-link ${location.pathname === '/viewprofile/edit-profile' ? 'active' : ''}`}>
                          Edit Profile
                        </Link>
                      </li>
                    </ul>
                    <div className="tab-content pt-4" id="profileTabContent">
                      <Routes>
                        <Route path="/" element={<Navigate to="/viewprofile/edit-profile" />} />
                        <Route path="personal-details" element={
                          employeeData ? 
                            <Viewpersonaldetails data={employeeData} /> : 
                            <Navigate to="/viewprofile/edit-profile" replace />
                        } />
                        <Route path="project-details" element={
                          employeeData ? 
                            <Viewprojectdetails data={employeeData} /> : 
                            <Navigate to="/viewprofile/edit-profile" replace />
                        } />
                        <Route path="password" element={<Viewpassword />} />
                        <Route path="edit-profile" element={<VieweditProfile data={employeeData} />} />
                      </Routes>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Viewprofile;