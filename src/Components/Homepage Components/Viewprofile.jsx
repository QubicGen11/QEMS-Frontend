import React from 'react'
import Sidemenu from './Sidemenu'
import Header from './Header'
import ViewBreadcrums from './Viewprofile/ViewBreadcrums'
import Viewleftpart from './Viewprofile/Viewleftpart'
import Viewpersonaldetails from './Viewprofile/Viewpersonaldetails'
import Viewprojectdetails from './Viewprofile/Viewprojectdetails'
import Viewpassword from './Viewprofile/Viewpassword'
 import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Cookies from 'js-cookie';
import config from '../config'
import axios from 'axios';
import  { useEffect, useState } from 'react';
import "./Viewprofile/Vieweditprofile"
import VieweditProfile from './Viewprofile/Vieweditprofile';

const Viewprofile = () => {
      const email = Cookies.get('email');
  const [employeeData, setEmployeeData] = useState([]);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      if (!email) {
        toast.error('No email found in cookies');
        return;
      }
      try {
        const response = await axios.get(`${config.apiUrl}/qubinest/getemployees/${email}`);
        console.log('API response:', response.data); // Log the response data
        if (Array.isArray(response.data)) {
          setEmployeeData(response.data);
        } else {
          toast.error('Unexpected response format');
          console.error('Unexpected response format:', response.data);
        }
      } catch (error) {
        console.error('Error fetching employee data:', error);
        // toast.error('Submit Your details to get your data');
      }
    };

    fetchEmployeeData();
  }, [email]);



  if (!Array.isArray(employeeData)) {
    return <div>Error: Employee data is not an array.</div>;
  }
    return (
        <>
            <Sidemenu />
            <Header />




            <div
                className="content-wrapper"
                bis_skin_checked={1}
                style={{ minHeight: "1604.8px" }}
            >
                {/* This is breadcrums */}
                <ViewBreadcrums/>

                {/* Breadcrusm ends */}

                <section className="content">
                    <div className="container-fluid" bis_skin_checked={1}>
                        <div className="row" bis_skin_checked={1}>
                           <Viewleftpart/>

                            <div className="col-12 col-md-9 col-lg-8 col-xl-9" bis_skin_checked={1}>
                                <div className="card widget-card border-light shadow-sm" bis_skin_checked={1}>
                                    <div className="card-body p-4" bis_skin_checked={1}>
                                        <ul className="nav nav-tabs" id="profileTab" role="tablist">
                                            
                                            <li className="nav-item" role="presentation">
                                                <button
                                                    className="nav-link active"
                                                    id="overview-tab"
                                                    data-bs-toggle="tab"
                                                    data-bs-target="#overview-tab-pane"
                                                    type="button"
                                                    role="tab"
                                                    aria-controls="overview-tab-pane"
                                                    aria-selected="true"
                                                    cursorshover="true"
                                                >
                                                    Personal Details
                                                </button>
                                            </li>
                                           
                                            <li className="nav-item" role="presentation">
                                                <button
                                                    className="nav-link"
                                                    id="email-tab"
                                                    data-bs-toggle="tab"
                                                    data-bs-target="#email-tab-pane"
                                                    type="button"
                                                    role="tab"
                                                    aria-controls="email-tab-pane"
                                                    aria-selected="false"
                                                    cursorshover="true"
                                                    tabIndex={-1}
                                                >
                                                    Project Details
                                                </button>
                                            </li>
                                            <li className="nav-item" role="presentation">
                                                <button
                                                    className="nav-link"
                                                    id="password-tab"
                                                    data-bs-toggle="tab"
                                                    data-bs-target="#password-tab-pane"
                                                    type="button"
                                                    role="tab"
                                                    aria-controls="password-tab-pane"
                                                    aria-selected="false"
                                                    cursorshover="true"
                                                    tabIndex={-1}
                                                >
                                                    Password
                                                </button>
                                            </li>
                                            <li className="nav-item" role="presentation">
                                                <button
                                                    className="nav-link"
                                                    id="profile-tab"
                                                    data-bs-toggle="tab"
                                                    data-bs-target="#profile-tab-pane"
                                                    type="button"
                                                    role="tab"
                                                    aria-controls="profile-tab-pane"
                                                    aria-selected="false"
                                                    cursorshover="true"
                                                    tabIndex={-1}
                                                >
                                                    Edit Profile
                                                </button>
                                            </li>
                                        </ul>
                                        <div
                                            className="tab-content pt-4"
                                            id="profileTabContent"
                                            bis_skin_checked={1}
                                        >
                                            <div
                                                className="tab-pane fade active show"
                                                id="overview-tab-pane"
                                                role="tabpanel"
                                                aria-labelledby="overview-tab"
                                                tabIndex={0}
                                                bis_skin_checked={1}

                                            >

                                               

                                            {employeeData.map((emp)=>{
                                                return(
                                                    <>
                                                        
                                                <p className="lead mb-3 font-sans text-md">
                                                    {emp.about}
                                                </p>

                                                    </>
                                                )
                                            })}

                                                {/* This is for profile  */}
                                              <Viewpersonaldetails/>
                                            </div>


                                            {/* This is for edit Profile */}

<VieweditProfile/>
                                            {/* This is for Project Details */}
                                            <Viewprojectdetails/>


                                            {/* This is for password */}
                                            <Viewpassword/>


                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>





        </>
    )
}

export default Viewprofile