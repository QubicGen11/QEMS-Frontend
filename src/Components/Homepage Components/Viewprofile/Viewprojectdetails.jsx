import React from 'react';

const Viewprojectdetails = ({ data }) => {
    if (!data || data.length === 0) {
        return <div>No project details available.</div>;
    }

    return (
        <div className="tab-pane fade show active" id="email-tab-pane" role="tabpanel" aria-labelledby="email-tab" tabIndex={0}>
            <h5 className="mb-3 text-2xl">Project Information</h5>
            <div className="row g-0">
                <div className="col-5 col-md-3 bg-light border-bottom border-white border-3">
                    <div className="p-2">Associate ID</div>
                </div>
                <div className="col-7 col-md-9 bg-light border-start border-bottom border-white border-3">
                    <div className="p-2">{data.employee_id}</div>
                </div>

                {/* <div className="col-5 col-md-3 bg-light border-bottom border-white border-3">
                    <div className="p-2">Designation</div>
                </div>
                <div className="col-7 col-md-9 bg-light border-start border-bottom border-white border-3">
                    <div className="p-2">{data.mainPosition}</div>
                </div> */}

                <div className="col-5 col-md-3 bg-light border-bottom border-white border-3">
                    <div className="p-2">Company Mail</div>
                </div>
                <div className="col-7 col-md-9 bg-light border-start border-bottom border-white border-3">
                    <div className="p-2">{data.companyEmail}</div>
                </div>

            

                <div className="col-5 col-md-3 bg-light border-bottom border-white border-3">
                    <div className="p-2">Job</div>
                </div>
                <div className="col-7 col-md-9 bg-light border-start border-bottom border-white border-3">
                    <div className="p-2">Web Developer</div>
                </div>

                <div className="col-5 col-md-3 bg-light border-bottom border-white border-3">
                    <div className="p-2">Project Location</div>
                </div>
                <div className="col-7 col-md-9 bg-light border-start border-bottom border-white border-3">
                    <div className="p-2">Anantapur</div>
                </div>

                <div className="col-5 col-md-3 bg-light border-bottom border-white border-3">
                    <div className="p-2">Company</div>
                </div>
                <div className="col-7 col-md-9 bg-light border-start border-bottom border-white border-3">
                    <div className="p-2">QubicGen</div>
                </div>
            </div>
        </div>
    );
};

export default Viewprojectdetails;