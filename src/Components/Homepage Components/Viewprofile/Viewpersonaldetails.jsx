import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Cookies from 'js-cookie';
import config from '../../config';
import Loading from '../../Loading Components/Loading'
import useEmployeeStore from '../../../store/employeeStore';

const Viewpersonaldetails = () => {
  const email = Cookies.get('email');
  const { employeeData, updateEmployeeData } = useEmployeeStore();

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        if (!email) {
          toast.error('No email found in cookies');
          return;
        }
        await updateEmployeeData(email);
      } catch (error) {
        console.error('Error fetching employee data:', error);
        toast.error('Failed to fetch employee data');
      }
    };

    fetchEmployeeData();

    const handleDataUpdate = () => {
      fetchEmployeeData();
    };

    window.addEventListener('employeeDataUpdated', handleDataUpdate);

    return () => {
      window.removeEventListener('employeeDataUpdated', handleDataUpdate);
    };
  }, [email, updateEmployeeData]);

  if (!employeeData) {
    return <Loading />;
  }

  const user = employeeData.users?.[0];

  // Safely format date with fallback
  const formatDate = (dateString) => {
    try {
      return dateString ? new Date(dateString).toLocaleDateString() : 'N/A';
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'N/A';
    }
  };

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
          <div className="p-2">
            {user?.joiningDate ? formatDate(user.joiningDate) : 'N/A'}
          </div>
        </div>
        <div className="col-5 col-md-3 bg-light border-bottom border-white border-3">
          <div className="p-2">Main Position</div>
        </div>
        <div className="col-7 col-md-9 bg-light border-start border-bottom border-white border-3">
          <div className="p-2">{user?.mainPosition || 'N/A'}</div>
        </div>
        <div className="col-5 col-md-3 bg-light border-bottom border-white border-3">
          <div className="p-2">Department</div>
        </div>
        <div className="col-7 col-md-9 bg-light border-start border-bottom border-white border-3">
          <div className="p-2">{user?.department || 'N/A'}</div>
        </div>
        <div className="col-5 col-md-3 bg-light border-bottom border-white border-3">
          <div className="p-2">Sub Department</div>
        </div>
        <div className="col-7 col-md-9 bg-light border-start border-bottom border-white border-3">
          <div className="p-2">{user?.subDepartment || 'N/A'}</div>
        </div>
      </div>
    </>
  );
};

export default Viewpersonaldetails;
