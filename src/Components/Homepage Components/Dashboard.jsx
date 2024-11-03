import React, { useState, useEffect, useRef, useCallback, memo, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import config from "../config";
import { Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import { useUser } from '../context/UserContext';
import UserDetailModal from './UserDetailModal';
import { fetchAttendanceData } from './api';
import Loading from '../Loading Components/Loading';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import useEmployeeStore from '../../store/employeeStore';

const CACHE_EXPIRY_TIME = 60 * 60 * 1000;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache
const TIMESHEET_CACHE_KEY = 'dashboard_timesheet';

const apiCache = {
  clockStatus: new Map(),
  reports: new Map()
};

const Dashboard = () => {
  const { employeeData, isLoading: storeLoading, updateEmployeeData } = useEmployeeStore();
  
  const [attendance, setAttendance] = useState([]);
  const [userAttendance, setUserAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clockInTime, setClockInTime] = useState('');
  const [clockOutTime, setClockOutTime] = useState('');
  const email = Cookies.get('email');
  const { useremail } = useUser();
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [time, setTime] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [reportText, setReportText] = useState('');
  const [isReportSubmitted, setIsReportSubmitted] = useState(false);
  const intervalRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greetingMessage, setGreetingMessage] = useState('');
  const MIN_CHAR_LIMIT = 10;
  const MAX_CHAR_LIMIT = 500;
  const EXPIRATION_HOURS = 12;
  const games = [
    "https://shaiksajidhussain.github.io/menja_game/",
    "https://shaiksajidhussain.github.io/snake_game/",
    "https://shaiksajidhussain.github.io/blast_game/",
    "https://shaiksajidhussain.github.io/jump_game/",
    "https://shaiksajidhussain.github.io/flip_game/",
    "https://shaiksajidhussain.github.io/arrow_game/"
  ];
  const [currentGameIndex, setCurrentGameIndex] = useState(0);
  const [gameSrc, setGameSrc] = useState('');
  const [timer, setTimer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [message, setMessage] = useState('');
  const [employeeInfo, setEmployeeInfo] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reportContent, setReportContent] = useState('');
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [employeeInfoLoading, setEmployeeInfoLoading] = useState(true);
  const headerBackgrounds = useMemo(() => [
    "https://images.pexels.com/photos/1089438/pexels-photo-1089438.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/270404/pexels-photo-270404.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1181673/pexels-photo-1181673.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/577585/pexels-photo-577585.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "https://images.pexels.com/photos/1933900/pexels-photo-1933900.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "https://images.pexels.com/photos/360591/pexels-photo-360591.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/89724/pexels-photo-89724.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/270637/pexels-photo-270637.jpeg?auto=compress&cs=tinysrgb&w=800"
  ], []);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image', 'video'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'blockquote', 'code-block',
    'list', 'bullet',
    'link', 'image', 'video'
  ];

  useEffect(() => {
    if (email && !employeeData) {
      updateEmployeeData(email);
    }
  }, [email]);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      if (!email) return;

      const cacheKey = `employeeInfo_${email}`;
      const cachedData = localStorage.getItem(cacheKey);
      
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        if (Date.now() - timestamp < CACHE_DURATION) {
          setEmployeeInfo(data);
          setEmployeeInfoLoading(false);
          return;
        }
      }

      try {
        const response = await axios.get(`${config.apiUrl}/qubinest/getemployees/${email}`);
        setEmployeeInfo(response.data);
        
        // Cache the response
        localStorage.setItem(cacheKey, JSON.stringify({
          data: response.data,
          timestamp: Date.now()
        }));
        
      } catch (error) {
        console.error('Error fetching employee data:', error);
      } finally {
        setEmployeeInfoLoading(false);
      }
    };

    fetchEmployeeData();
  }, [email]);

  const emp = employeeInfo; // Adjusted for single object response

  const handleCompleteDetails = () => {
    // Logic to handle completing details (e.g., redirecting to a profile completion page)
    setIsModalOpen(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchAttendance = useCallback(async (forceRefresh = false) => {
    // Don't fetch if already loading
    if (isRefreshing && !forceRefresh) return;

    try {
      // Check cache first (unless forcing refresh)
      if (!forceRefresh) {
        const cachedData = localStorage.getItem(TIMESHEET_CACHE_KEY);
        if (cachedData) {
          const { data, timestamp } = JSON.parse(cachedData);
          if (Date.now() - timestamp < CACHE_DURATION) {
            setUserAttendance(data);
            setLoading(false);
            setIsInitialLoad(false);
            return;
          }
        }
      }

      setIsRefreshing(true);
      
      // Fetch only last 7 days of data for dashboard
      const response = await axios.get(
        `${config.apiUrl}/qubinest/attendance/${email}?limit=7`, 
        {
          withCredentials: true,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );

      const data = response.data;
      
      // Cache the response
      localStorage.setItem(TIMESHEET_CACHE_KEY, JSON.stringify({
        data,
        timestamp: Date.now()
      }));

      setUserAttendance(data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      // Show error only on initial load
      if (isInitialLoad) {
        toast.error('Failed to load timesheet data');
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
      setIsInitialLoad(false);
    }
  }, [email, isRefreshing, isInitialLoad]);

  useEffect(() => {
    let mounted = true;

    if (email && mounted) {
      fetchAttendance();
    }

    return () => {
      mounted = false;
    };
  }, [email]);

  useEffect(() => {
    const checkClockStatus = async () => {
      try {
        console.log('Making request to:', `${config.apiUrl}/qubinest/clockstatus/${email}`);
        
        const response = await axios.get(`${config.apiUrl}/qubinest/clockstatus/${email}`, {
          withCredentials: true, // Include credentials
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Response:', response.data);
        const { isClockedIn: clockedIn, clockInTime, clockOutTime } = response.data;
        
        setIsClockedIn(clockedIn);
        if (clockInTime) setClockInTime(new Date(clockInTime).toLocaleTimeString());
        if (clockOutTime) setClockOutTime(new Date(clockOutTime).toLocaleTimeString());
      } catch (error) {
        console.error('Error checking clock status:', error);
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error('Error response:', {
            data: error.response.data,
            status: error.response.status,
            headers: error.response.headers
          });
        } else if (error.request) {
          // The request was made but no response was received
          console.error('No response received:', error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error('Error setting up request:', error.message);
        }
      }
    };

    if (email) {
      checkClockStatus();
    }
  }, [email]);

  useEffect(() => {
    if (isClockedIn) {
      intervalRef.current = setInterval(() => {
        setTime(prevTime => {
          const { hours, minutes, seconds } = prevTime;
          if (seconds < 59) {
            return { hours, minutes, seconds: seconds + 1 };
          } else if (minutes < 59) {
            return { hours, minutes: minutes + 1, seconds: 0 };
          } else {
            return { hours: hours + 1, minutes: 0, seconds: 0 };
          }
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isClockedIn]);

  // Function to handle image upload
  const handleImageUpload = async (file) => {
    try {
      setUploadingMedia(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'your_cloudinary_upload_preset');
      
      const response = await axios.post(
        'https://api.cloudinary.com/v1_1/your_cloud_name/upload',
        formData
      );

      return response.data.secure_url;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
      return null;
    } finally {
      setUploadingMedia(false);
    }
  };

  // Replace the existing textarea with ReactQuill
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!reportContent.trim()) {
      toast.error('Report cannot be empty');
      return;
    }

    try {
      setLoading(true);
      
      // Optimistic update
      const tempId = Date.now();
      const optimisticReport = {
        id: tempId,
        content: reportContent,
        timestamp: new Date()
      };
      
      // Update UI immediately
      setIsReportSubmitted(true);
      setReportContent('');
      
      // Make API call
      const response = await axios.post(`${config.apiUrl}/qubinest/report`, {
        email,
        reportText: reportContent,
      });
      
      toast.success('Daily report submitted successfully!');
      
      // Update cache
      const cacheKey = `reports_${email}`;
      apiCache.reports.set(cacheKey, {
        data: response.data,
        timestamp: Date.now()
      });
      
    } catch (error) {
      // Rollback optimistic update if needed
      setIsReportSubmitted(false);
      setReportContent(reportContent);
      toast.error('Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clockIn = async () => {
    try {
      // Check cache first
      const cacheKey = `clockIn_${email}`;
      if (apiCache.clockStatus.has(cacheKey)) {
        const { data, timestamp } = apiCache.clockStatus.get(cacheKey);
        if (Date.now() - timestamp < CACHE_DURATION) {
          return data;
        }
      }

      setLoading(true);
      const response = await axios.post(`${config.apiUrl}/qubinest/clockin`, { email });
      const { isClockedIn: clockedIn, clockInTime } = response.data;
      
      // Update cache
      apiCache.clockStatus.set(cacheKey, {
        data: response.data,
        timestamp: Date.now()
      });
      
      // Update UI immediately
      setIsClockedIn(clockedIn);
      setClockInTime(new Date(clockInTime).toLocaleTimeString());
      toast.success('Clock-in successful!');
      
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error clocking in');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const clockOut = async () => {
    if (!isClockedIn) {
      toast.error('You need to clock in first.');
      return;
    }

    try {
      // Update URL to use /qubinest
      const response = await axios.post(`${config.apiUrl}/qubinest/clockout`, { email });
      const { isClockedIn: clockedIn, clockOutTime } = response.data;
      
      setIsClockedIn(clockedIn);
      setClockOutTime(new Date(clockOutTime).toLocaleTimeString());
      toast.success('Clock-out successful!');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error clocking out';
      toast.error(errorMessage);
    }
  };

  const resetClockInStatus = () => {
    const userClockInKey = `lastClockIn_${email}`;
    const userClockOutKey = `lastClockOut_${email}`;
    localStorage.removeItem(userClockInKey);
    localStorage.removeItem(userClockOutKey);
    setIsClockedIn(false);
    setIsReportSubmitted(false);
    setClockInTime('');
    setClockOutTime('');
    toast.success('Clock-in status has been reset!');
  };

  const startGame = () => {
    const lastPlayed = localStorage.getItem('lastPlayed');
    const today = new Date().toISOString().slice(0, 10);
    const currentTime = new Date().getTime();

    if (lastPlayed === today && currentTime - parseInt(localStorage.getItem('lastPlayedTime')) < 24 * 60 * 60 * 1000) {
      toast.success('You have already played the game today! Please come back tomorrow.');
      return;
    }

    setGameSrc(games[currentGameIndex]);
    const countdown = 600;
    setTimeLeft(countdown);
    const interval = setInterval(() => {
      setTimeLeft(prevTime => prevTime - 1);
    }, 1000);
    setTimer(interval);

    setTimeout(() => {
      clearInterval(interval);
      setMessage('Time is up!');
      toast.success("Time is Up! Get Back Tomorrow");
      localStorage.setItem('lastPlayed', today);
      localStorage.setItem('lastPlayedTime', currentTime.toString());

      if (window.opener) {
        window.close();
      }
      window.location.reload();
    }, countdown * 1000);
  };

  const resetGame = () => {
    localStorage.removeItem('lastPlayed');
    localStorage.removeItem('lastPlayedTime');
    setGameSrc('');
    clearInterval(timer);
    setTimeLeft(0);
    setMessage('');
  };

  const stopGame = () => {
    clearInterval(timer);
    setMessage('Game stopped! Get back tomorrow.');
    toast.success('Game stopped! Get back tomorrow.');
    window.location.reload();
  };

  const handleResetGame = () => {
    resetGame();
    toast.success('Game data has been reset!');
  };

  const handleStartGame = () => {
    const lastGameStartedDate = localStorage.getItem('lastGameStartedDate');
    const today = new Date().toISOString().slice(0, 10);

    if (lastGameStartedDate === today) {
      toast.error('You have already started the game today!');
      return;
    }

    startGame();
    setMessage('Game started!');
    localStorage.setItem('lastGameStartedDate', today);
  };

  const handleResetStartGame = () => {
    localStorage.removeItem('lastGameStartedDate');
    toast.success('Game reset successfully!');
  };

  const handleNextGame = () => {
    setCurrentGameIndex(prevIndex => prevIndex === games.length - 1 ? 0 : prevIndex + 1);
    setGameSrc('');
    clearInterval(timer);
    setTimeLeft(0);
    setMessage('');
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const currentDate = new Date();
    const currentHour = currentDate.getHours();

    if (currentHour < 12) {
      setGreetingMessage('Good Morning');
    } else if (currentHour < 18) {
      setGreetingMessage('Good Afternoon');
    } else {
      setGreetingMessage('Good Evening');
    }
  }, []);

  const refreshAttendance = async () => {
    if (isRefreshing) return;
    
    const refreshToast = toast.loading('Refreshing...');
    try {
      await fetchAttendance(true);
      toast.update(refreshToast, {
        render: 'Updated successfully',
        type: 'success',
        isLoading: false,
        autoClose: 2000
      });
    } catch (error) {
      toast.update(refreshToast, {
        render: 'Failed to refresh',
        type: 'error',
        isLoading: false,
        autoClose: 2000
      });
    }
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const AssociateDetails = () => {
    if (employeeInfoLoading) {
      return (
        <div className="card-body d-flex justify-center align-items-center">
          <Loading />
        </div>
      );
    }

    const displayData = employeeData || employeeInfo;
    
    if (!displayData) {
      return (
        <div className="card-body d-flex justify-center align-items-center">
          <p>No employee details found.</p>
        </div>
      );
    }

    return (
      <>
        <div className="card-body pt-0" bis_skin_checked={1}>
          <div className="row" bis_skin_checked={1}>
            <div className="col-7" bis_skin_checked={1}>
              <h2 className="lead"><b>{displayData.firstname} {displayData.lastname}</b></h2>
              <p className="text-muted text-sm"><b>Role: </b> {displayData.mainPosition} </p>
              <ul className="ml-4 mb-0 fa-ul text-muted">
                <li className="small pt-2">
                  <span className="fa-li"><i className="fas fa-lg fa-id-card" /></span>
                  <span className='font-bold'> Emp Id :</span>{displayData.employee_id}
                </li>
                <li className="small pt-2">
                  <span className="fa-li"><i className="fas fa-lg fa-envelope" /></span>
                  <span className='font-bold'> Email :</span>{displayData.companyEmail}
                </li>
                <li className="small pt-2">
                  <span className="fa-li"><i className="fas fa-lg fa-briefcase" /></span>
                  <span className='font-bold'> Business Unit:</span> {displayData.mainPosition}
                </li>
              </ul>
            </div>
            <div className="col-5 text-center pt-3" bis_skin_checked={1}>
              <img
                className="profile-user-img img-fluid img-circle h-24"
                src={displayData.employeeImg || 'https://res.cloudinary.com/defsu5bfc/image/upload/v1717093278/facebook_images_f7am6j.webp'}
                alt={`${displayData.firstname} avatar`}
              />
            </div>
          </div>
        </div>
        <div className="card-footer bg-white" bis_skin_checked={1}>
          <div className="text-right bg-white" bis_skin_checked={1}>
            {/* Add any action buttons here */}
          </div>
        </div>
      </>
    );
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prevIndex) => 
        prevIndex === headerBackgrounds.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Change background every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const TimesheetTable = memo(({ data, isLoading }) => {
    if (isLoading && isInitialLoad) {
      return (
        <tr>
          <td colSpan="4" className="text-center py-4">
            <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span className="ml-2">Loading...</span>
            </div>
          </td>
        </tr>
      );
    }

    if (!data?.length) {
      return (
        <tr>
          <td colSpan="4" className="text-center py-4">No records found</td>
        </tr>
      );
    }

    return data.map((attendance) => (
      <tr key={attendance.id} className="hover:bg-gray-50">
        <td className="py-2">{new Date(attendance.date).toLocaleDateString()}</td>
        <td className="py-2">{formatTime(attendance.checkin_Time)}</td>
        <td className="py-2">{formatTime(attendance.checkout_Time)}</td>
        <td className="py-2">
          <StatusBadge status={attendance.status} />
        </td>
      </tr>
    ));
  });

  const StatusBadge = memo(({ status }) => {
    const statusStyles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      declined: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusStyles[status] || ''}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  });

  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <>
      <div className="content-wrapper">
      <UserDetailModal
        isOpen={isModalOpen}
        onRequestClose={handleCloseModal}
        onCompleteDetails={handleCompleteDetails}
      />
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              {/* <h1 className="m-0">Console</h1> */}
            </div>
            <div className="col-sm-6">
              {/* <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item"><a href="#">Home</a></li>
                <li className="breadcrumb-item active">Console</li>
              </ol> */}
            </div>
          </div>
        </div>
      </div>

      <section className="content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-lg-12 col-12 col-sm-12">
              <div className="card card-widget widget-user-2" bis_skin_checked={1}>
                <div className="card card-widget widget-user shadow-lg">
                  <div 
                    className="widget-user-header text-white" 
                    style={{ 
                      background: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("${headerBackgrounds[currentBgIndex]}")`,
                      backgroundSize: 'cover',
                      backgroundRepeat: 'no-repeat',
                      height: "25vh",
                      backgroundPositionY: '50%',
                      transition: 'background-image 1s ease-in-out'
                    }}
                  >
                    {employeeData && (
                      <>
                        <h3 
                          className="widget-user-username text-left ml-auto text-base shadow-xl-black" 
                          style={{ fontWeight: 'bolder', textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)' }}
                        >
                          {`${getGreeting()}, ${employeeData.firstname} ${employeeData.lastname}`}
                        </h3>
                        <h5 
                          className="widget-user-desc text-left ml-auto"
                          style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)' }}
                        >
                          {employeeData.mainPosition}
                        </h5>
                      </>
                    )}
                  </div>
                  <div className="widget-user-image">
                    <img className="" src="https://res.cloudinary.com/defsu5bfc/image/upload/v1714828410/logo_3_jizb6b.png" alt="User Avatar" style={{ border: "none" }} />
                  </div>
                </div>
                <div className="row h-20">
                  <div className="col-sm-6 col-6 border-right">
                    <div className="description-block">
                      <button
                        onClick={clockIn}
                        className="w-20 bg-green-600 text-xs text-white font-semibold py-2 px-1 rounded-full shadow-lg transform hover:scale-105 transition duration-300 ease-in-out hover:bg-yellow-500"
                      >
                        Clock In
                      </button>
                    </div>
                  </div>
                  <div className="col-sm-6 col-6 border-right">
                    <div className="description-block">
                      <button
                        onClick={clockOut}
                        className={`w-20 bg-red-400 text-xs text-white font-semibold py-2 px-1 rounded-full shadow-lg transform hover:scale-105 transition duration-300 ease-in-out ml-4 ${isClockedIn ? 'hover:bg-yellow-500' : 'hover:cursor-not-allowed'}`}
                      >
                        Clock Out
                      </button>
                      <button
                        className={`w-20 bg-red-400 text-xs text-white font-semibold py-2 px-1 rounded-full shadow-lg transform hover:scale-105 transition duration-300 ease-in-out ml-4`}
                        onClick={resetClockInStatus}
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-12 col-md-12 col-lg-6 d-flex align-items-stretch flex-column " bis_skin_checked={1} style={{ height: 'auto' }}>
  <div className="card bg-light d-flex flex-fill bg-white" bis_skin_checked={1}>
    <div className='flex justify-between bg-white'>
      <div className="card-header text-muted border-bottom-0 bg-white" bis_skin_checked={1}>
        Associate Details
      </div>
      <div className="card-header text-muted border-bottom-0 bg-white" bis_skin_checked={1}>
        <Link to="/viewprofile" className="btn btn-sm btn-primary text-white" cursorshover="true">
          <i className="fas fa-user text-white" /> View Profile
        </Link>
      </div>
    </div>
    <AssociateDetails />
  </div>
</div>

              <div className="col-12 col-lg-6">
                <div className="small-box bg-white">
                  <div className="inner h-6/6">
                    <p className='text-left' style={{ fontSize: '15px', height: '65px' }}>
                      {currentTime.toLocaleDateString('en-US', { weekday: 'long' })}, {currentTime.toLocaleTimeString('en-US')}
                      <p className='text-center text-lg my-2'>Work Time</p>
                    </p>
                    <p className='text-center' style={{ fontSize: '20px', height: '30px' }}>{`${time.hours} Hrs : ${time.minutes} Min : ${time.seconds} Sec`}</p>

                    <div className="card-footer p-0">
                      <ul className="nav flex-column bg-white">
                        <li className="nav-item flex justify-center align-middle items-center">
                          <div className="bg-white h-4/6">
                            <div className='flex justify-between'>
                              <p className='text-left text-sm'>Task Reports</p>
                              <p className="text-xs text-right mb-2">{reportText.length}/{MAX_CHAR_LIMIT}</p>
                            </div>
                            <div className="card-footer bg-w p-0">
                              <div className="reports bg-white">
                                <div className="card-footer bg-w p-0">
                                  <div className="reports bg-white">
                                    <form onSubmit={handleSubmit}>
                                      <div className="quill-container mb-4">
                                        <ReactQuill
                                          value={reportContent}
                                          onChange={setReportContent}
                                          modules={modules}
                                          formats={formats}
                                          placeholder="Submit Your Daily Update...!"
                                          className="bg-white"
                                          style={{ height: '200px', marginBottom: '50px' }}
                                        />
                                      </div>
                                      <div className="flex justify-center mt-16">
                                        <button
                                          type="submit"
                                          disabled={uploadingMedia}
                                          className={`inline-flex cursor-pointer items-center gap-1 rounded bg-yellow-300 border px-4 py-2 text-sm font-bold transform hover:scale-110 transition duration-400 ease-in-out hover:bg-yellow-500 ${
                                            uploadingMedia ? 'opacity-50 cursor-not-allowed' : ''
                                          }`}
                                        >
                                          {uploadingMedia ? 'Uploading...' : 'Submit Report'}
                                        </button>
                                      </div>
                                    </form>
                                  </div>
                                </div>

                              </div>
                            </div>

                          </div>
                        </li>
                      </ul>
                    </div>





                    
                  </div>
                </div>
              </div>

              <div className="row mt-3" bis_skin_checked={1}  >

                <div className="col-12 col-lg-6" bis_skin_checked={1} >

                  <div className="card" bis_skin_checked={1} >

                    <div className="card-header" bis_skin_checked={1} >

                      <h3 className="card-title">Time Sheets</h3>

                      <div className="card-tools flex" bis_skin_checked={1} >

                        <Link to="/viewtimesheets">

                          <button
                            className="cursor-pointer flex justify-between bg-gray-800 px-3 py-2 rounded-full text-xs text-white tracking-wider shadow-xl hover:bg-gray-900 hover:scale-105 duration-500 hover:ring-1 font-mono w-[120px]"
                          >

                            View More
                          
                          </button>
                        </Link>

                        <button
                          className="cursor-pointer flex justify-between bg-blue-800 px-3 py-2 ml-4 rounded-full text-xs text-white tracking-wider shadow-xl hover:bg-blue-900 hover:scale-105 duration-500 hover:ring-1 font-mono w-[120px]"
                          onClick={refreshAttendance}
                        >
                          Refresh
                          
                        </button>
                      </div>
                    </div>

                    <div className="card-body table-responsive p-0" style={{ height: '30vh' }}>
                      <div className="relative">
                        {isRefreshing && !isInitialLoad && (
                          <div className="absolute top-0 left-0 right-0 z-10 bg-blue-50 text-blue-600 text-center py-1 text-sm">
                            Refreshing...
                          </div>
                        )}
                        <table className="table table-hover text-nowrap">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="py-3">Date</th>
                              <th className="py-3">Check In</th>
                              <th className="py-3">Check Out</th>
                              <th className="py-3">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            <TimesheetTable 
                              data={userAttendance} 
                              isLoading={loading} 
                            />
                          </tbody>
                        </table>
                      </div>
                    </div>





                  </div>

                </div>



                <div className="col-12 col-lg-6 mt-1">

                  <div class="card" style={{ background: "url('https://res.cloudinary.com/defsu5bfc/image/upload/v1716373294/waves_hxaazs.png')", backgroundRepeat: 'no-repeat', backgroundSize: "cover", backgroundColor: '#009efb', borderRadius: '10px' }}>

                    <div className="card-body">

                      <h5 className="text-white font-semibold relative bottom-2" style={{ fontFamily: 'sans-serif' }}>Upcoming Holidays</h5>

                      <div className="flex justify-between items-center">

                        <div className="flex items-center">

                          <img

                            src="https://smarthr.dreamstechnologies.com/react/template/static/media/holiday-calendar.d66643357778e940f4b7d889afd5f589.svg"

                            style={{ width: '30px' }}

                            alt=""

                          />

                          <div className="ml-2">

                            <p className="font-sans text-white text-base lg:text-xl">Independence Day</p>

                            <p className="font-sans text-white text-sm lg:text-base">Mon 20 May 2024</p>

                          </div>

                        </div>

                        <div>

                          <Link to="/booktimeoff" className="btn btn-primary text-black bg-white font-sans mt-3 rounded-xl">View all</Link>

                        </div>

                      </div>

                    </div>

                  </div>

                  <iframe src="https://qubic-gen.blogspot.com/" frameborder="0" className="relative bottom-3 h-48 rounded-lg w-full"></iframe>

                </div>







              </div>

              <div className="col-12 col-lg-12 mt-2 bg-white">
                <h1 className='text-2xl'>Games</h1>
                {gameSrc && <iframe src={gameSrc} frameBorder="0" style={{ width: '80vw', height: '70vh' }}></iframe>}

                <button onClick={handleStartGame} className="bg-red-950 text-red-400 border border-red-400 border-b-4 font-medium overflow-hidden relative px-4 py-2 rounded-md hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group">
                  <span className="bg-red-400 shadow-red-400 absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(0,0,0,0.3)]"></span>
                  Start Game
                </button>
                <button onClick={handleNextGame} className="bg-red-950 text-red-400 border border-red-400 border-b-4 font-medium overflow-hidden relative px-4 py-2 rounded-md hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group">
                  <span className="bg-red-400 shadow-red-400 absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(0,0,0,0.3)]"></span>
                  Next Game
                </button>
                <button onClick={handleResetGame} className="bg-red-950 text-red-400 border border-red-400 border-b-4 font-medium overflow-hidden relative px-4 py-2 rounded-md hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group">
                  <span className="bg-red-400 shadow-red-400 absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(0,0,0,0.3)]"></span>
                  Reset Game
                </button>
                <button onClick={handleResetStartGame} className="bg-red-950 text-red-400 border border-red-400 border-b-4 font-medium overflow-hidden relative px-4 py-2 rounded-md hover:brightness-150 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group">
                  <span className="bg-red-400 shadow-red-400 absolute -top-[150%] left-0 inline-flex w-80 h-[5px] rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(0,0,0,0.3)]"></span>
                  Restart Game
                </button>

                <div>{timeLeft > 0 ? `Time left: ${Math.floor(timeLeft / 60)}:${timeLeft % 60}` : ''}</div>
                <div>{message}</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};
export default Dashboard;
