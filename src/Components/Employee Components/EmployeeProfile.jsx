import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Header from "../Homepage Components/Header";
import Sidemenu from "../Homepage Components/Sidemenu";
import { FiMail, FiPhone, FiMapPin, FiCalendar, FiBriefcase, FiLinkedin, FiUser, FiHash, FiInfo, FiArrowLeft } from 'react-icons/fi';
import { BsGenderAmbiguous, BsBook } from 'react-icons/bs';
import config from '../config';

const backgroundImages = [
  'https://images.pexels.com/photos/577585/pexels-photo-577585.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/270366/pexels-photo-270366.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
  'https://images.unsplash.com/photo-1607706189992-eae578626c86?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
  'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
];

const EmployeeProfile = () => {
  const [employee, setEmployee] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const { email } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployeeDetails();
    const intervalId = setInterval(() => {
      setCurrentBgIndex(prev => (prev + 1) % backgroundImages.length);
    }, 5000);
    return () => clearInterval(intervalId);
  }, [email]);

  const fetchEmployeeDetails = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${config.apiUrl}/qubinest/getemployees/${email}`);
      setEmployee(response.data);
    } catch (error) {
      console.error('Error fetching employee details:', error);
      toast.error('Failed to load employee details');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />
      <Sidemenu />
      <div className="content-wrapper min-h-screen relative">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="fixed top-24 left-6 z-50 flex items-center gap-2 px-4 py-2 text-white bg-black/30 hover:bg-black/40 rounded-lg transition-colors duration-200"
        >
          <FiArrowLeft className="w-5 h-5" />
          Back
        </button>

        {isLoading ? (
          // Loading State
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          // Content when loaded
          <>
            {/* Header Section with Background Image */}
            <div 
              className="relative h-72 transition-all duration-1000 ease-in-out"
              style={{
                background: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${backgroundImages[currentBgIndex]})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="container mx-auto px-4 h-full">
                <div className="relative h-full flex items-end pb-8">
                  {/* Profile Image */}
                  <div className="absolute  flex items-end">
                    <div className="relative">
                      {employee?.employeeImg ? (
                        <img
                          src={employee.employeeImg}
                          alt={`${employee.firstname} ${employee.lastname}`}
                          className="w-32 h-32 rounded-2xl border-4 border-white shadow-xl object-cover"
                        />
                      ) : (
                        <div className="w-32 h-32 rounded-2xl border-4 border-white shadow-xl bg-gray-200 flex items-center justify-center text-3xl font-bold text-gray-500">
                          {employee?.firstname?.[0]}{employee?.lastname?.[0]}
                        </div>
                      )}
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white" />
                    </div>

                    {/* Name and Title */}
                    <div className="ml-6 mb-4">
                      <h1 className="text-3xl font-bold text-white mb-1">
                        {employee?.firstname} {employee?.lastname}
                      </h1>
                      <div className="flex items-center gap-4">
                        <span className="text-white/90 flex items-center gap-2">
                          <FiBriefcase className="w-4 h-4" />
                          {employee?.users?.[0]?.mainPosition || 'Position Not Set'}
                        </span>
                        <span className="text-white/90 flex items-center gap-2">
                          <FiHash className="w-4 h-4" />
                         Employee ID: {employee?.employee_id}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 pt-24 pb-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Personal Information Card */}
                <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <FiUser className="w-5 h-5 text-blue-600" />
                    Personal Information
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <FiMail className="w-5 h-5 text-gray-500 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="text-gray-800">{employee?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <FiPhone className="w-5 h-5 text-gray-500 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="text-gray-800">{employee?.phone || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <BsGenderAmbiguous className="w-5 h-5 text-gray-500 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Gender</p>
                        <p className="text-gray-800">{employee?.gender || 'Not specified'}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <FiMapPin className="w-5 h-5 text-gray-500 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="text-gray-800">{employee?.address || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Work Information Card */}
                <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <FiBriefcase className="w-5 h-5 text-blue-600" />
                    Work Information
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <FiBriefcase className="w-5 h-5 text-gray-500 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Employee ID</p>
                        <p className="text-gray-800">{employee?.employee_id}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <FiCalendar className="w-5 h-5 text-gray-500 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Join Date</p>
                        <p className="text-gray-800">
                          {employee?.users?.[0]?.joiningDate 
                            ? new Date(employee.users[0].joiningDate).toLocaleDateString() 
                            : 'Not available'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <FiBriefcase className="w-5 h-5 text-gray-500 mr-3" />
                      <div>
                      <h1 className="text-md ">Position</h1>
                      <p className="text-gray-600">{employee?.users[0]?.mainPosition || "Not Assigned"}</p>

                      </div>
                    </div>
                    <div className="flex items-center">
                      <FiBriefcase className="w-5 h-5 text-gray-500 mr-3" />
                      <div>
                      <p className="text-gray-600 text-sm">Department</p>
                      <p className="font-medium text-gray-500">{employee?.users?.[0]?.department || "Not specified"}</p>
                 
                      </div>
                    </div>
                    <div className="flex items-center">
                      <FiBriefcase className="w-5 h-5 text-gray-500 mr-3" />
                      <div>
                      <p className="text-gray-600 text-sm">Sub Department</p>
                      <p className="font-medium text-gray-500">{employee?.users?.[0]?.subDepartment || "Not specified"}</p>
                   
                      </div>
                    </div>



                    <div className="flex flex-col gap-2">
                    
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                    
                    </div>
                    <div>
                  
                    </div>
                  
                  </div>
           
                    {/* <div className="flex items-center">
                      <FiLinkedin className="w-5 h-5 text-gray-500 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">LinkedIn</p>
                        <a 
                          href={employee?.linkedin} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {employee?.linkedin || 'Not provided'}
                        </a>
                      </div>
                    </div> */}
                  </div>
                </div>

                {/* Contact Information Card */}
                <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <FiPhone className="w-5 h-5 text-blue-600" />
                    Contact Information
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <FiMail className="w-5 h-5 text-gray-500 mr-3" />
                      <div className=''>
                        <p className="text-sm text-gray-500">Work Email</p>
                        <p className="text-gray-800">{employee?.companyEmail}</p>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <FiPhone className="w-5 h-5 text-gray-500 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="text-gray-800">{employee?.phone}</p>
                      </div>
                    </div>
                    {employee?.linkedin && (
                      <a 
                        href={employee.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <FiLinkedin className="w-5 h-5 text-blue-600 mr-3" />
                        <span className="text-blue-600">LinkedIn Profile</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Skills & Education Section */}
                <div className="md:col-span-3 bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <BsBook className="w-5 h-5 text-blue-600" />
                    Skills & Education
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-medium mb-3 flex items-center">
                        <BsBook className="w-5 h-5 mr-2" />
                        Education
                      </h3>
                      <div className="space-y-2">
                        {employee?.education ? (
                          <p className="text-gray-700">{employee.education}</p>
                        ) : (
                          <p className="text-gray-500 italic">No education details provided</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-3">Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {employee?.skills ? (
                          employee.skills.split(',').map((skill, index) => (
                            <span 
                              key={index}
                              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                            >
                              {skill.trim()}
                            </span>
                          ))
                        ) : (
                          <p className="text-gray-500 italic">No skills listed</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* About Section */}
                {employee?.about && (
                  <div className="md:col-span-3 bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                      <FiInfo className="w-5 h-5 text-blue-600" />
                      About
                    </h2>
                    <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                      {employee.about}
                    </p>
                  </div>
                )}

                {/* Work Information Card */}
               
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default EmployeeProfile;
