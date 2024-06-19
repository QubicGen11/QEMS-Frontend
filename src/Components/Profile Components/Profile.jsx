import React, { useEffect, useState } from "react";
import './Profile.css';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import Sidemenu from "../Homepage Components/Sidemenu";
import Header from "../Homepage Components/Header";
import Footer from "../Homepage Components/Footer";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import config from "../config";
import Cookies from "js-cookie";
import axios from "axios";
import Bankpersonal from "./Bankpersonal";
import Bankdetails from "./Bankdetails";
import Editbankdetails from "./Editbankdetails";

const Profile = () => {
  const email = Cookies.get("email");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [employeeInfo, setEmployeeInfo] = useState(null);
  const [canEdit, setCanEdit] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const fetchEmployeeInfo = async () => {
      try {
        const response = await axios.get(
          `${config.apiUrl}/qubinest/getemployees/${email}`
        );
        const employeeData = response.data;

        if (!employeeData || Object.keys(employeeData).length === 0) {
          toast.error("Please fill up the details");
        } else {
          setEmployeeInfo({
            ...employeeData,
            mainPosition: employeeData.users[0]?.mainPosition,
          });

          // Add employee ID as cookie if it exists
          if (employeeData.employee_id) {
            Cookies.set("employee_id", employeeData.employee_id);
          }
        }
        console.log(employeeData);
      } catch (error) {
        console.error("Error fetching employee data:", error);
      }
    };

    fetchEmployeeInfo();
  }, [email]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const lastEditTimestamp = localStorage.getItem('lastEditTimestamp');
    if (lastEditTimestamp) {
      const lastEditDate = new Date(lastEditTimestamp);
      const currentDate = new Date();
      const diffTime = Math.abs(currentDate - lastEditDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 30) {
        setCanEdit(false);
        toast.info(`You can edit your bank details after ${30 - diffDays} days`);
      } else {
        setCanEdit(true);
      }
    }
  }, []);

  const handleReset = () => {
    localStorage.removeItem('lastEditTimestamp');
    setCanEdit(true);
    toast.success('Edit restriction reset for testing purposes');
  };

  const handleEditClick = (e) => {
    if (!canEdit) {
      e.preventDefault();
      toast.error('You can only edit your bank details once every 30 days.');
    }
  };

  return (
    <>
      <Sidemenu />
      <Header />

      <div className="content-wrapper">
        <div className="col-lg-12 col-12 col-sm-12">
          <div className="card card-widget widget-user-2">
            <div className="card card-widget widget-user shadow-lg">
              <div
                className="widget-user-header text-white profile-header"
                style={{
                  background:
                    'url("https://res.cloudinary.com/defsu5bfc/image/upload/v1718793467/Black_Gradient_Minimalistic_Future_Technology_YouTube_Banner_1_tjfi1q.png")',
                  backgroundSize: "cover",
                  backgroundPositionY: '55%',
                  height: "35vh",
                }}
              >
                {employeeInfo && (
                  <>
                    <div className="flex gap-7">
                      <div className="leftprofile">
                        <div className="col-12 text-center pt-3">
                          <img
                            src={`${config.apiUrl}/${employeeInfo.employeeImg}`}
                            alt="user-avatar"
                            className="img-circle img-fluid w-32 h-32"
                          />
                        </div>
                      </div>
                      <div className="rightprofile mt-3">
                        <h3
                          className="widget-user-username text-left ml-auto text-base shadow-xl-black"
                          style={{
                            fontWeight: "bolder",
                            textShadow: "5px 5px black",
                          }}
                        >{` ${employeeInfo.firstname} ${employeeInfo.lastname}`}</h3>
                        <h6
                          className="widget-user-username text-left ml-auto text-sm shadow-xl-black"
                          style={{
                            fontWeight: "bolder",
                            textShadow: "5px 5px black",
                          }}
                        >{` ${employeeInfo.employee_id}`}</h6>

                        <h5 className="widget-user-desc text-left ml-auto">
                          {employeeInfo.mainPosition}
                        </h5>
                        <h5 className="widget-user-desc text-left ml-auto">
                          Local time :
                          {currentTime.toLocaleDateString('en-US', { weekday: 'long' })}, {currentTime.toLocaleTimeString('en-US')}
                        </h5>
                        <h5 className="widget-user-desc text-left ml-auto">
                          {employeeInfo.companyEmail}
                        </h5>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <section className="content">
          <div className="container-fluid">
            <div className="row">
              <div className="col-12 col-md-9 col-lg-8 col-xl-9">
                <div className="card widget-card border-light shadow-sm">
                  <div className="card-body p-4">
                    <ul className="nav nav-tabs" id="profileTab" role="tablist">
                      <li className="nav-item" role="presentation">
                        <Link to="/profile/personal-details" className={`nav-link ${location.pathname === '/profile/personal-details' ? 'active' : ''}`}>
                          Personal Details
                        </Link>
                      </li>
                      <li className="nav-item" role="presentation">
                        <Link to="/profile/bank-details" className={`nav-link ${location.pathname === '/profile/bank-details' ? 'active' : ''}`}>
                          Bank Details
                        </Link>
                      </li>
                      <li className="nav-item" role="presentation">
                        <Link to="/profile/edit-bank-details" className={`nav-link ${location.pathname === '/profile/edit-bank-details' ? 'active' : ''}`} onClick={handleEditClick}>
                          Edit Bank Details
                        </Link>
                      </li>
                    </ul>
                    <div className="tab-content pt-4" id="profileTabContent">
                      <Routes>
                        <Route path="personal-details" element={<Bankpersonal />} />
                        <Route path="bank-details" element={<Bankdetails />} />
                        <Route path="edit-bank-details" element={<Editbankdetails canEdit={canEdit} />} />
                      </Routes>
                    </div>
                    <button className="btn btn-secondary mt-3" onClick={handleReset}>Reset Edit Restriction (Testing Only)</button>
                  </div>
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

export default Profile;