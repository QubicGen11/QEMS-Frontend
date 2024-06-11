import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Cookies from 'js-cookie';
import config from '../../config';

const Viewpersonaldetails = () => {
  const email = Cookies.get('email');
  const [employeeData, setEmployeeData] = useState(null);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      if (!email) {
        toast.error('No email found in cookies');
        return;
      }

      try {
        const response = await axios.get(`${config.apiUrl}/qubinest/getemployees/${email}`);
        console.log('API response:', response.data); // Log the response data
        if (response.data) {
          setEmployeeData(response.data);
        } else {
//           toast.error('Unexpected response format');
          // console.error('Unexpected response format:', response.data);
        }
      } catch (error) {
        console.error('Error fetching employee data:', error);
      }
    };

    fetchEmployeeData();
  }, [email]);

  if (!employeeData) {
    return <div>Loading...</div>;
  }

  const user = employeeData.users && employeeData.users[0]; // Assuming a one-to-one relationship

  return (
    <>
      <h5 className="mb-3 text-2xl">Personal Details</h5>
      <div className="row g-0">
        <div className="col-5 col-md-3 bg-light border-bottom border-white border-3">
          <div className="p-2">First Name</div>
        </div>
        <div className="col-7 col-md-9 bg-light border-start border-bottom border-white border-3">
          <div className="p-2">{employeeData.firstname}</div>
        </div>
        <div className="col-5 col-md-3 bg-light border-bottom border-white border-3">
          <div className="p-2">Last Name</div>
        </div>
        <div className="col-7 col-md-9 bg-light border-start border-bottom border-white border-3">
          <div className="p-2">{employeeData.lastname}</div>
        </div>
        <div className="col-5 col-md-3 bg-light border-bottom border-white border-3">
          <div className="p-2">Phone</div>
        </div>
        <div className="col-7 col-md-9 bg-light border-start border-bottom border-white border-3">
          <div className="p-2">{employeeData.phone}</div>
        </div>
        <div className="col-5 col-md-3 bg-light border-bottom border-white border-3">
          <div className="p-2">Email</div>
        </div>
        <div className="col-7 col-md-9 bg-light border-start border-bottom border-white border-3">
          <div className="p-2">{employeeData.email}</div>
        </div>
        <div className="col-5 col-md-3 bg-light border-bottom border-white border-3">
          <div className="p-2">Gender</div>
        </div>
        <div className="col-7 col-md-9 bg-light border-start border-bottom border-white border-3">
          <div className="p-2">{employeeData.gender}</div>
        </div>
        <div className="col-5 col-md-3 bg-light border-bottom border-white border-3">
          <div className="p-2">Education</div>
        </div>
        <div className="col-7 col-md-9 bg-light border-start border-bottom border-white border-3">
          <div className="p-2">{employeeData.education}</div>
        </div>
        <div className="col-5 col-md-3 bg-light border-bottom border-white border-3">
          <div className="p-2">Address</div>
        </div>
        <div className="col-7 col-md-9 bg-light border-start border-bottom border-white border-3">
          <div className="p-2">{employeeData.address}</div>
        </div>
        <div className="col-5 col-md-3 bg-light border-bottom border-white border-3">
          <div className="p-2">Date Of Birth</div>
        </div>
        <div className="col-7 col-md-9 bg-light border-start border-bottom border-white border-3">
          <div className="p-2">{new Date(employeeData.dob).toLocaleDateString()}</div>
        </div>
        <div className="col-5 col-md-3 bg-light border-bottom border-white border-3">
          <div className="p-2">Joining Date</div>
        </div>
        <div className="col-7 col-md-9 bg-light border-start border-bottom border-white border-3">
          <div className="p-2">{user ? new Date(user.joiningDate).toLocaleDateString() : 'N/A'}</div>
        </div>
        <div className="col-5 col-md-3 bg-light border-bottom border-white border-3">
          <div className="p-2">Main Position</div>
        </div>
        <div className="col-7 col-md-9 bg-light border-start border-bottom border-white border-3">
          <div className="p-2">{user ? user.mainPosition : 'N/A'}</div>
        </div>
      </div>
    </>
  );
};

export default Viewpersonaldetails;
