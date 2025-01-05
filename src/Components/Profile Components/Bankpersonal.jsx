import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Cookies from 'js-cookie';
import config from '../config'

const Bankpersonal = () => {
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
        if (response.data) {
          setEmployeeData(response.data);
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

  const user = employeeData.users && employeeData.users[0];
  
  return (
    <>
      <h5 className="mb-3 text-2xl">Personal Details</h5>
      <div className="row g-0">
        <div className="col-5 col-md-3 bg-light border-bottom border-white border-3">
          <div className="p-2">Employee ID</div>
        </div>
        <div className="col-7 col-md-9 bg-light border-start border-bottom border-white border-3">
          <div className="p-2">{employeeData.employee_id}</div>
        </div>

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
          <div className="p-2">Date of Birth</div>
        </div>
        <div className="col-7 col-md-9 bg-light border-start border-bottom border-white border-3">
          <div className="p-2">{new Date(employeeData.dob).toLocaleDateString()}</div>
        </div>

        <div className="col-5 col-md-3 bg-light border-bottom border-white border-3">
          <div className="p-2">Gender</div>
        </div>
        <div className="col-7 col-md-9 bg-light border-start border-bottom border-white border-3">
          <div className="p-2">{employeeData.gender}</div>
        </div>

        <div className="col-5 col-md-3 bg-light border-bottom border-white border-3">
          <div className="p-2">Address</div>
        </div>
        <div className="col-7 col-md-9 bg-light border-start border-bottom border-white border-3">
          <div className="p-2">{employeeData.address}</div>
        </div>

        <div className="col-5 col-md-3 bg-light border-bottom border-white border-3">
          <div className="p-2">Phone</div>
        </div>
        <div className="col-7 col-md-9 bg-light border-start border-bottom border-white border-3">
          <div className="p-2">{employeeData.phone}</div>
        </div>

        <div className="col-5 col-md-3 bg-light border-bottom border-white border-3">
          <div className="p-2">Personal Email</div>
        </div>
        <div className="col-7 col-md-9 bg-light border-start border-bottom border-white border-3">
          <div className="p-2">{employeeData.email}</div>
        </div>

        <div className="col-5 col-md-3 bg-light border-bottom border-white border-3">
          <div className="p-2">Company Email</div>
        </div>
        <div className="col-7 col-md-9 bg-light border-start border-bottom border-white border-3">
          <div className="p-2">{employeeData.companyEmail}</div>
        </div>

        <div className="col-5 col-md-3 bg-light border-bottom border-white border-3">
          <div className="p-2">Department</div>
        </div>
        <div className="col-7 col-md-9 bg-light border-start border-bottom border-white border-3">
          <div className="p-2">{user?.department || 'N/A'}</div>
        </div>

        <div className="col-5 col-md-3 bg-light border-bottom border-white border-3">
          <div className="p-2">Position</div>
        </div>
        <div className="col-7 col-md-9 bg-light border-start border-bottom border-white border-3">
          <div className="p-2">{user?.mainPosition || 'N/A'}</div>
        </div>

        <div className="col-5 col-md-3 bg-light border-bottom border-white border-3">
          <div className="p-2">Skills</div>
        </div>
        <div className="col-7 col-md-9 bg-light border-start border-bottom border-white border-3">
          <div className="p-2">{employeeData.skills}</div>
        </div>

        <div className="col-5 col-md-3 bg-light border-bottom border-white border-3">
          <div className="p-2">Education</div>
        </div>
        <div className="col-7 col-md-9 bg-light border-start border-bottom border-white border-3">
          <div className="p-2">{employeeData.education}</div>
        </div>

        <div className="col-5 col-md-3 bg-light border-bottom border-white border-3">
          <div className="p-2">LinkedIn</div>
        </div>
        <div className="col-7 col-md-9 bg-light border-start border-bottom border-white border-3">
          <div className="p-2">
            <a href={employeeData.linkedin} target="_blank" rel="noopener noreferrer">
              {employeeData.linkedin}
            </a>
          </div>
        </div>

        <div className="col-5 col-md-3 bg-light border-bottom border-white border-3">
          <div className="p-2">Joining Date</div>
        </div>
        <div className="col-7 col-md-9 bg-light border-start border-bottom border-white border-3">
          <div className="p-2">{user ? new Date(user.joiningDate).toLocaleDateString() : 'N/A'}</div>
        </div>
      </div>
    </>
  );
};

export default Bankpersonal;
