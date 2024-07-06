import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import config from "../config"; // Import the config file
import { useUser } from '../context/UserContext';
import Cookies from 'js-cookie';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
  const { email } = useUser();
  const userEmail = email || Cookies.get('email');
  const navigate = useNavigate();
  const [employeeInfo, setEmployeeInfo] = useState(null); // Change to null initially
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [isReportSubmitted, setIsReportSubmitted] = useState(false);
  const [clockInTime, setClockInTime] = useState(null);
  const [clockOutTime, setClockOutTime] = useState(null);
  const [time, setTime] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const fetchEmployeeInfo = async () => {
      try {
        const response = await axios.get(`${config.apiUrl}/qubinest/getemployees/${userEmail}`);
        const data = response.data;
        localStorage.setItem('employeeInfo', JSON.stringify(data)); // Store data in local storage
        setEmployeeInfo(data);
      } catch (error) {
        console.error('Error fetching employee data:', error);
      }
    };

    // Check if employee data is already in local storage
    const storedEmployeeInfo = localStorage.getItem('employeeInfo');
    if (storedEmployeeInfo) {
      setEmployeeInfo(JSON.parse(storedEmployeeInfo));
    } else if (userEmail) {
      fetchEmployeeInfo();
    }
  }, [userEmail]);

  const handleLogout = async () => {
    try {
      await axios.post(`${config.apiUrl}/qubinest/logout`);
      Cookies.remove('employee_id');
      Cookies.remove('email');

      // Clear local storage except for "clock in" and "clock out"
      const clockInData = localStorage.getItem(`lastClockIn_${userEmail}`);
      const clockOutData = localStorage.getItem(`lastClockOut_${userEmail}`);
      localStorage.clear();
      if (clockInData) {
        localStorage.setItem(`lastClockIn_${userEmail}`, clockInData);
      }
      if (clockOutData) {
        localStorage.setItem(`lastClockOut_${userEmail}`, clockOutData);
      }

      toast.success('Logout successful');
      navigate('/');
    } catch (error) {
      console.error(error);
      toast.error('Logout not possible');
    }
  };

  const clockIn = async () => {
    const today = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();
    
    const timestamp = new Date().getTime();
    const userClockInKey = `lastClockIn_${email}`;
    const lastClockIn = JSON.parse(localStorage.getItem(userClockInKey));

    if (lastClockIn && lastClockIn.date === today) {
      toast.error('You have already clocked in today.');
      return;
    }

    try {
      console.log('Sending clock-in request...');
      const response = await axios.post(`${config.apiUrl}/qubinest/clockin`, { email });
      toast.success('Clock-in successful!');
      setIsClockedIn(true);
      setClockInTime(currentTime);
      localStorage.setItem(userClockInKey, JSON.stringify({ date: today, time: currentTime, timestamp }));
      return response.data;
    } catch (error) {
      if (error.response.status === 500) {
        setIsModalOpen(true);
      }
      const errorMessage = error.response ? error.response.data.message : error.message;
      toast.error(errorMessage);
      console.error('Error clocking in:', error);
      throw error;
    }
  };

  const clockOut = async () => {
    if (!isClockedIn) {
      toast.error('You need to clock in first.');
      return;
    }

    const today = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();
    const timestamp = new Date().getTime();
    const userClockOutKey = `lastClockOut_${email}`;
    const lastClockOut = JSON.parse(localStorage.getItem(userClockOutKey));

    if (lastClockOut && lastClockOut.date === today) {
      toast.error('You have already clocked out today.');
      return;
    }

    if (!isReportSubmitted) {
      toast.error('Please submit your daily report before clocking out.');
      return;
    }

    try {
      console.log('Sending clock-out request...');
      const response = await axios.post(`${config.apiUrl}/qubinest/clockout`, { email });
      toast.success('Clock-out successful!');
      setIsClockedIn(false);
      setClockOutTime(currentTime);
      localStorage.setItem(userClockOutKey, JSON.stringify({ date: today, time: currentTime, timestamp }));
      localStorage.setItem('You have worked for : ', JSON.stringify(time));
      setTime({ hours: 0, minutes: 0, seconds: 0 });

      setTimeout(() => {
        // Clear all local storage items except clock-in and clock-out data
        const itemsToKeep = ['lastClockIn_', 'lastClockOut_', 'You have worked for : '];
        const keys = Object.keys(localStorage);
        for (let key of keys) {
          if (!itemsToKeep.some(item => key.startsWith(item))) {
            localStorage.removeItem(key);
          }
        }
        toast.success('Data has been successfully reset.');
      }, 10000);

      return response.data;
    } catch (error) {
      const errorMessage = error.response ? error.response.data.message : error.message;
      toast.error(errorMessage);
      console.error('Error clocking out:', error);
      throw error;
    }
  };

  if (!employeeInfo) {
    return <div>Loading...</div>; // Show loading state
  }

  return (
    <>
      <nav className="main-header navbar navbar-expand navbar-dark navbar-dark">
        <ul className="navbar-nav w-auto">
          <li className="nav-item xl:hidden lg:hidden">
            <a className="nav-link" data-widget="pushmenu" href="#" role="button">
              <i className="fas fa-bars" />
            </a>
          </li>
        </ul>
        <ul className="navbar-nav ml-auto mr-4">
          <li className="nav-item dropdown">
            <a className="nav-link" data-toggle="dropdown" href="#">
              <li className="nav-item">
                <div className="inset-x-0 z-20 w-full px-6 transition-all duration-300 ease-in-out md:mt-0 md:p-0 md:top-0 md:relative md:bg-transparent md:w-auto md:opacity-100 md:translate-x-0 md:flex md:items-center">
                  <div className="flex flex-col md:flex-row md:mx-6 lg:relative lg:left-10 md:relative md:left-10 relative left-10">
                    <a href="#" className="flex items-center px-4 -mx-2">
                      <img
                        className="object-cover mx-2 rounded-full h-9 w-9"
                        src={employeeInfo.employeeImg ? employeeInfo.employeeImg : 'https://res.cloudinary.com/defsu5bfc/image/upload/v1717093278/facebook_images_f7am6j.webp'}
                        alt={`${employeeInfo.firstname} avatar`}
                      />
                      <button className="w-auto z-10 flex flex-wrap items-center p-2 text-sm ml-auto text-gray-600 bg-white border border-transparent rounded-md focus:border-blue-500 focus:ring-opacity-40 dark:focus:ring-opacity-40 focus:ring-blue-300 dark:focus:ring-blue-400 focus:ring dark:text-white dark:bg-gray-800 focus:outline-none">
                        <span className="mx-1 hover:text-yellow-500 dark:hover:text-yellow-400 text-xs">{`${employeeInfo.firstname} ${employeeInfo.lastname}`}</span>
                        <svg
                          className="w-5 h-5 mx-1"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M12 15.713L18.01 9.70299L16.597 8.28799L12 12.888L7.40399 8.28799L5.98999 9.70199L12 15.713Z"
                            fill="currentColor"
                          />
                        </svg>
                      </button>
                    </a>
                  </div>
                </div>
              </li>
            </a>
            <div className="dropdown-menu dropdown-menu-lg dropdown-menu-right mt-2 relative right-30 bg-gray-600 transition-all duration-300 ease-in-out w-[30vw]">
              <div className="bg-gray-800 rounded-md shadow-xl dark:bg-gray-800">
                <a
                  href="#"
                  className="flex items-center p-3 -mt-2 text-sm text-gray-600 transition-colors duration-300 transform dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  <img
                    className="flex-shrink-0 object-cover mx-1 rounded-full w-9 h-9"
                    src={employeeInfo.employeeImg ? employeeInfo.employeeImg : 'https://res.cloudinary.com/defsu5bfc/image/upload/v1717093278/facebook_images_f7am6j.webp'}
                    alt={`${employeeInfo.firstname} avatar`}
                  />
                  <div className="mx-1">
                    <h1 className="text-sm font-semibold text-gray-700 dark:text-gray-200">{`${employeeInfo.firstname} ${employeeInfo.lastname}`}</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{userEmail}</p>
                  </div>
                </a>
                <hr className="border-gray-200 dark:border-gray-700" />
                <Link
                  to={'/viewprofile'}
                  className="block px-4 py-3 text-sm text-gray-600 capitalize transition-colors duration-300 transform dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  View Profile
                </Link>
                <a
                  href="#"
                  className="block px-4 py-3 text-sm text-gray-600 capitalize transition-colors duration-300 transform dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  Settings
                </a>
                <hr className="border-gray-200 dark:border-gray-700" />
                <a
                  href="#"
                  className="block px-4 py-3 text-sm text-gray-600 capitalize transition-colors duration-300 transform dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-white"
                  onClick={handleLogout}
                >
                  Logout
                </a>
              </div>
            </div>
          </li>
        </ul>
      </nav>
    </>
  );
};

export default Header;
