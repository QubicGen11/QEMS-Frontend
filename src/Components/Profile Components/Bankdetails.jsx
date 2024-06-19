import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import config from '../config';

const Bankdetails = () => {
  const employee_id = Cookies.get('employee_id');
  const [bankDetails, setBankDetails] = useState({
    associateId: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    panNumber: '',
    aadharNumber: '',
    pfNumber: ''
  });

  useEffect(() => {
    const fetchBankDetails = async () => {
      try {
        const response = await axios.get(`${config.apiUrl}/api/bankdetails/${employee_id}`);
        if (response.data) {
          setBankDetails(response.data);
        }
      } catch (error) {
        console.error('Error fetching bank details:', error);
      }
    };

    fetchBankDetails();
  }, [employee_id]);

  return (
    <div>
      <div
        className="tab-pane fade show active"
        id="email-tab-pane"
        role="tabpanel"
        aria-labelledby="email-tab"
        tabIndex={0}
      >
        <h5 className="mb-3 text-2xl">Bank Details</h5>
        <div className="row g-0">
          <div className="col-5 col-md-3 bg-light border-bottom border-white border-3">
            <div className="p-2">Associate ID</div>
          </div>
          <div className="col-7 col-md-9 bg-light border-start border-bottom border-white border-3">
            <div className="p-2">{bankDetails.employee_id}</div>
          </div>

          <div className="col-5 col-md-3 bg-light border-bottom border-white border-3">
            <div className="p-2">Bank Name</div>
          </div>
          <div className="col-7 col-md-9 bg-light border-start border-bottom border-white border-3">
            <div className="p-2">{bankDetails.bankName}</div>
          </div>

          <div className="col-5 col-md-3 bg-light border-bottom border-white border-3">
            <div className="p-2">Account Number</div>
          </div>
          <div className="col-7 col-md-9 bg-light border-start border-bottom border-white border-3">
            <div className="p-2">{bankDetails.accountNumber}</div>
          </div>

          <div className="col-5 col-md-3 bg-light border-bottom border-white border-3">
            <div className="p-2">IFSC Code</div>
          </div>
          <div className="col-7 col-md-9 bg-light border-start border-bottom border-white border-3">
            <div className="p-2">{bankDetails.ifscCode}</div>
          </div>

          <div className="col-5 col-md-3 bg-light border-bottom border-white border-3">
            <div className="p-2">Pan Number</div>
          </div>
          <div className="col-7 col-md-9 bg-light border-start border-bottom border-white border-3">
            <div className="p-2">{bankDetails.panNumber}</div>
          </div>

          <div className="col-5 col-md-3 bg-light border-bottom border-white border-3">
            <div className="p-2">Aadhar Number</div>
          </div>
          <div className="col-7 col-md-9 bg-light border-start border-bottom border-white border-3">
            <div className="p-2">{bankDetails.aadharNumber}</div>
          </div>

          <div className="col-5 col-md-3 bg-light border-bottom border-white border-3">
            <div className="p-2">PF Number</div>
          </div>
          <div className="col-7 col-md-9 bg-light border-start border-bottom border-white border-3">
            <div className="p-2">{bankDetails.pfNumber}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bankdetails;