import React from 'react'
import Sidemenu from './Sidemenu'
import Header from './Header'
import ViewBreadcrums from './Viewprofile/ViewBreadcrums'
import Viewleftpart from './Viewprofile/Viewleftpart'
import Viewpersonaldetails from './Viewprofile/Viewpersonaldetails'
import Viewprojectdetails from './Viewprofile/Viewprojectdetails'
import Viewpassword from './Viewprofile/Viewpassword'
import Vieweditprofile from './Viewprofile/Vieweditprofile'

const Viewprofile = () => {
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

                                               


                                                <p className="lead mb-3 font-sans text-md">
                                                    Sajid Hussain is a seasoned and results-driven Project Manager who
                                                    brings experience and expertise to project management. With a proven
                                                    track record of successfully delivering complex projects on time and
                                                    within budget, Ethan Leo is the go-to professional for organizations
                                                    seeking efficient and effective project leadership.
                                                </p>


                                                {/* This is for profile  */}


                                              <Viewpersonaldetails/>
                                            </div>


                                            {/* This is for edit Profile */}

                                          <Vieweditprofile/>


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