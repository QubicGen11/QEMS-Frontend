import React from 'react'
import axios from 'axios';
import  { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import config from '../../config';
import Cookies from 'js-cookie';
import imgConfig from '../../imgConfig';
const Viewleftpart = () => {
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
        }
      };
      fetchEmployeeData();
    }, [email]);
  
    if (!Array.isArray(employeeData)) {
      return <div>Error: Employee data is not an array.</div>;
    }
  return (
    <>
     {employeeData.map((emp)=>{
        return(
            <>
                <div className="col-md-3" bis_skin_checked={1}>
                                <div className="card card-primary card-outline" bis_skin_checked={1}>
                                    <div className="card-body box-profile" bis_skin_checked={1}>
                                        <div className="text-center" bis_skin_checked={1}>
                                            <img
                                                className="profile-user-img img-fluid img-circle h-24"
                                                src={`${imgConfig.apiUrl}/${emp.employeeImg}`}
                                                alt={`${emp.firstname} avatar`}
                                            />
                                        </div>
                                        <h3 className="profile-username text-center">{emp.firstname}{emp.lastname}</h3>
                                        <p className="text-muted text-center">{emp.position}</p>
                                        {/* <ul className="list-group list-group-unbordered mb-3">
                                            <li className="list-group-item">
                                                <b>Followers</b> <a className="float-right">1,322</a>
                                            </li>
                                            <li className="list-group-item">
                                                <b>Following</b> <a className="float-right">543</a>
                                            </li>
                                            <li className="list-group-item">
                                                <b>Friends</b> <a className="float-right">13,287</a>
                                            </li>
                                        </ul>
                                        <a
                                            href="#"
                                            className="btn btn-primary btn-block"
                                            cursorshover="true"
                                        >
                                            <b>Follow</b>
                                        </a> */}
                                    </div>
                                </div>
                                <div className="card card-primary" bis_skin_checked={1}>
                                    <div className="card-header" bis_skin_checked={1}>
                                        <h3 className="card-title">About Me</h3>
                                    </div>
                                    <div className="card-body" bis_skin_checked={1}>
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
                                        <p className="text-muted p-2">{emp.location}</p>
                                        <hr />
                                        <strong>
                                            <i className="fas fa-pencil-alt mr-1" /> Skills
                                        </strong>
                                        <p className="text-muted p-2">
                                            {emp.skills}
                                        </p>
                                        <hr />
                                        {/* <strong>
                                            <i className="far fa-file-alt mr-1" /> Notes
                                        </strong>
                                        <p className="text-muted">
                                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam
                                            fermentum enim neque.
                                        </p> */}
                                    </div>
                                </div>
                            </div>
            </>
        )
     })}
    
    </>
  )
}

export default Viewleftpart