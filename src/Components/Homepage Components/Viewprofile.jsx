import React, { useEffect, useState } from 'react';
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

const Viewprofile = () => {
  const email = Cookies.get('email');
  const [employeeData, setEmployeeData] = useState([]);
  const location = useLocation();

  useEffect(() => {
    const fetchEmployeeData = async () => {
      if (!email) {
        toast.error('No email found in cookies');
        return;
      }
      try {
        const response = await axios.get(`${config.apiUrl}/qubinest/getemployees/${email}`);
        if (response.data) {
          setEmployeeData(response.data);
        } else {
          toast.error('Unexpected response format');
        }
      } catch (error) {
        toast.error('Submit Your details to get your data');
      }
    };

    fetchEmployeeData();
  }, [email]);

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
                        <Route path="/" element={<Navigate to="/viewprofile/personal-details" />} />
                        <Route path="personal-details" element={<Viewpersonaldetails data={employeeData} />} />
                        <Route path="project-details" element={<Viewprojectdetails data={employeeData} />} />
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