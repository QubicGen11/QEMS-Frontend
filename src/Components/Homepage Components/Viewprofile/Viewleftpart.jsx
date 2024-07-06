import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import config from '../../config';
import Cookies from 'js-cookie';
import imgConfig from '../../imgConfig';
import Loading from '../../Loading Components/Loading';

const Viewleftpart = () => {
  const email = Cookies.get('email');
  const [employeeData, setEmployeeData] = useState(null);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const response = await axios.get(`${config.apiUrl}/qubinest/getemployees/${email}`);
        const data = response.data;
        localStorage.setItem('employeeData', JSON.stringify(data)); // Store data in local storage
        setEmployeeData(data);
      } catch (error) {
        console.error('Error fetching employee data:', error);
      }
    };

    if (!email) {
      toast.error('No email found in cookies');
      return;
    }

    // Check if employee data is already in local storage
    const storedEmployeeData = localStorage.getItem('employeeData');
    if (storedEmployeeData) {
      setEmployeeData(JSON.parse(storedEmployeeData));
    } else {
      fetchEmployeeData();
    }
  }, [email]);

  if (!employeeData) {
    return <div>Loading...</div>;
  }

  const emp = employeeData; // Adjusted for single object response

  // Get mainPosition from the users array if it exists
  const mainPosition = emp.users && emp.users.length > 0 ? emp.users[0].mainPosition : '';

  // Check if employeeImg is available and construct the image URL
  const employeeImgUrl = emp.employeeImg ? `${imgConfig.apiUrl}/${emp.employeeImg}` : 'https://res.cloudinary.com/defsu5bfc/image/upload/v1717093278/facebook_images_f7am6j.webp';

  return (
    <>
      <div className="col-md-3">
        <div className="card card-primary card-outline">
          <div className="card-body box-profile">
            <div className="text-center">
            <img
  className="profile-user-img img-fluid img-circle h-24"
  src={emp.employeeImg ? emp.employeeImg : 'https://res.cloudinary.com/defsu5bfc/image/upload/v1717093278/facebook_images_f7am6j.webp'}
  alt={`${emp.firstname} avatar`}
/>
            </div>
            <h3 className="profile-username text-center">{emp.firstname} {emp.lastname}</h3>
            <p className="text-muted text-center">{mainPosition}</p>
          </div>
        </div>
        <div className="card card-primary">
          <div className="card-header">
            <h3 className="card-title">About Me</h3>
          </div>
          <div className="card-body">
            <strong>
              <i className="fas fa-book mr-1" /> Education
            </strong>
            <p className="text-muted">
              {emp.education}
            </p>
            <hr />
            <strong>
              <i className="fas fa-map-marker-alt mr-1" /> Location
            </strong>
            <p className="text-muted p-2">Anantapur</p>
            <hr />
            <strong>
              <i className="fas fa-pencil-alt mr-1" /> Skills
            </strong>
            <p className="text-muted p-2">
              {emp.skills}
            </p>
            <hr />
            <strong>
              <i className="far fa-file-alt mr-1" /> About
            </strong>
            <p className="text-muted">
              {emp.about}
            </p>
            <hr />
          </div>
        </div>
      </div>
    </>
  );
}

export default Viewleftpart;
