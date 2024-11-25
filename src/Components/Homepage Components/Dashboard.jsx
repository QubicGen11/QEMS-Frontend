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
import { FiBriefcase, FiHash, FiLogIn, FiLogOut } from 'react-icons/fi';
import { ToastContainer } from 'react-toastify';

const CACHE_EXPIRY_TIME = 60 * 60 * 1000;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache
const TIMESHEET_CACHE_KEY = 'dashboard_timesheet';

const apiCache = {
  clockStatus: new Map(),
  reports: new Map()
};

const Header = ({ employeeData, isClockedIn, clockInTime, clockOutTime, hasSubmittedReport, clockIn, clockOut }) => {
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [greetingMessage, setGreetingMessage] = useState('');
  const [showReportTooltip, setShowReportTooltip] = useState(false);

  const backgroundImages = [
    'https://images.pexels.com/photos/577585/pexels-photo-577585.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/270366/pexels-photo-270366.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    'https://images.unsplash.com/photo-1607706189992-eae578626c86?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    'https://images.pexels.com/photos/1933900/pexels-photo-1933900.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pexels.com/photos/3861958/pexels-photo-3861958.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pexels.com/photos/4974912/pexels-photo-4974912.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pexels.com/photos/4974920/pexels-photo-4974920.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'

  ];

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreetingMessage('Good Morning');
    else if (hour < 18) setGreetingMessage('Good Afternoon');
    else setGreetingMessage('Good Evening');
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex(prev => (prev + 1) % backgroundImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full bg-black text-white rounded-lg overflow-hidden mb-6">
      {/* Background with overlay */}
      <div 
        className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40"
        style={{
          backgroundImage: `url(${backgroundImages[currentBgIndex]})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.7)'
        }}
      />

      {/* Content */}
      <div className="relative z-10 p-6 flex justify-between items-center">
        {/* Greeting and Name */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {greetingMessage}, {employeeData?.firstname} {employeeData?.lastname}
          </h1>
          <div className="flex items-center gap-4 text-white/80">
            <span className="flex items-center gap-2">
              <FiBriefcase className="w-4 h-4" />
              {employeeData?.users?.[0]?.mainPosition || 'Web Developer'}
            </span>
            <span className="flex items-center gap-2">
              <FiHash className="w-4 h-4" />
              {employeeData?.employee_id}
            </span>
          </div>
        </div>

        {/* Logo */}
        <div className="flex-shrink-0">
          <img 
            src="https://res.cloudinary.com/defsu5bfc/image/upload/v1714828410/logo_3_jizb6b.png" 
            alt="Company Logo" 
            className="w-16 h-16 object-contain"
          />
        </div>
      </div>

      {/* Clock In/Out Buttons */}
      <div className="relative z-10 grid grid-cols-2 border-t border-white/10">
        <button
          onClick={clockIn}
          disabled={isClockedIn}
          className={`flex items-center justify-center gap-2 py-4 px-6 transition-colors ${
            isClockedIn 
              ? 'bg-gray-800/50 text-gray-400 cursor-not-allowed'
              : 'bg-black/50 text-white hover:bg-green-500/20'
          }`}
        >
          <FiLogIn className="w-5 h-5" />
          Clock In
          {clockInTime && <span className="text-sm opacity-75">({clockInTime})</span>}
        </button>

        <div className="relative">
          <button 
            onClick={() => {
              if (!hasSubmittedReport && isClockedIn) {
                setShowReportTooltip(true);
                setTimeout(() => setShowReportTooltip(false), 3000);
                toast.warning('Please submit your daily report before clocking out');
              } else {
                clockOut();
              }
            }}
            onMouseEnter={() => !hasSubmittedReport && isClockedIn && setShowReportTooltip(true)}
            onMouseLeave={() => setShowReportTooltip(false)}
            disabled={!isClockedIn}
            className={`flex items-center justify-center gap-2 py-4 px-6 transition-colors relative ${
              !isClockedIn
                ? 'bg-gray-800/50 text-gray-400 cursor-not-allowed'
                : !hasSubmittedReport
                ? 'bg-black/50 text-white hover:bg-yellow-500/20'
                : 'bg-black/50 text-white hover:bg-red-500/20'
            } border-l border-white/10`}
          >
            <FiLogOut className="w-5 h-5" />
            Clock Out
            {clockOutTime && <span className="text-sm opacity-75">({clockOutTime})</span>}
          </button>

          {/* Tooltip/Message for Report Submission */}
          {showReportTooltip && isClockedIn && !hasSubmittedReport && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max">
              <div className="bg-black text-white text-sm py-2 px-4 rounded-lg shadow-lg">
                <div className="flex items-center gap-2">
                  <svg 
                    className="w-4 h-4 text-yellow-400" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                    />
                  </svg>
                  <span>Please submit your daily report first</span>
                </div>
              </div>
              {/* Arrow */}
              <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-1">
                <div className="border-8 border-transparent border-t-black"></div>
              </div>
            </div>
          )}

          {/* Visual Indicator for Report Status */}
          {isClockedIn && (
            <div className={`absolute -top-2 -right-2 w-4 h-4 rounded-full ${
              hasSubmittedReport ? 'bg-green-500' : 'bg-yellow-500'
            }`}>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { employeeData, isLoading, updateEmployeeData } = useEmployeeStore();
  
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

  const employeeDataRef = useRef(null);
  const fetchAttempted = useRef(false);

  useEffect(() => {
    if (email && !employeeData) {
      updateEmployeeData(email);
    }
  }, [email, employeeData, updateEmployeeData]);

  // Consolidate employee data fetching
  useEffect(() => {
    const fetchData = async () => {
      if (!email || fetchAttempted.current) return;
      
      try {
        setEmployeeInfoLoading(true);
        
        // Clear any cached data for other users
        const storedEmail = localStorage.getItem('currentUserEmail');
        if (storedEmail !== email) {
          localStorage.clear();
          localStorage.setItem('currentUserEmail', email);
        }

        // Fetch fresh data
        const data = await updateEmployeeData(email);
        
        if (!data || Object.keys(data).length === 0) {
          toast.error("Please fill up the details");
          setIsModalOpen(true);
          return;
        }

        setEmployeeInfo(data);
        employeeDataRef.current = data;

      } catch (error) {
        console.error('Error fetching employee data:', error);
        toast.error(" Please complete your profile.");
        setIsModalOpen(true);
      } finally {
        setEmployeeInfoLoading(false);
      }
    };

    fetchData();
    fetchAttempted.current = true;

    return () => {
      fetchAttempted.current = false;
    };
  }, [email]);

  const emp = employeeInfo; // Adjusted for single object response

  const handleCompleteDetails = () => {
    setIsModalOpen(false);
    // Redirect to profile completion page
    window.location.href = '/complete-profile'; // Adjust this path as needed
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
      
      const response = await axios.post(`${config.apiUrl}/qubinest/report`, {
        email,
        reportText: reportContent,
      });
      
      setIsReportSubmitted(true);
      setHasSubmittedReport(true); // Update the submission status
      setReportContent('');
      toast.success('Daily report submitted successfully!');
      
    } catch (error) {
      setIsReportSubmitted(false);
      setReportContent(reportContent);
      console.error('Error submitting report:', error);
      toast.error(error.response?.data?.message || 'Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Add these functions to handle daily clock status 
  const checkDailyClockStatus = async (email) => {
    try {
      const response = await axios.get(`${config.apiUrl}/qubinest/daily-clock-status/${email}`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error checking daily clock status:', error);
      throw error;
    }
  };

  // Modify the clockIn function
  const clockIn = async () => {
    try {
      // Check if already clocked in today
      const dailyStatus = await checkDailyClockStatus(email);
      
      if (dailyStatus.hasClockedInToday) {
        toast.warning('You have already clocked in today. Only one clock-in per day is allowed.');
        return;
      }

      setLoading(true);
      const response = await axios.post(`${config.apiUrl}/qubinest/clockin`, { 
        email,
        date: new Date().toISOString()
      });
      
      const { isClockedIn: clockedIn, clockInTime } = response.data;
      
      setIsClockedIn(clockedIn);
      setClockInTime(new Date(clockInTime).toLocaleTimeString());
      setHasSubmittedReport(false);
      toast.success('Clock-in successful!');
      
      // Store clock-in status in localStorage
      localStorage.setItem(`lastClockIn_${email}`, new Date().toISOString());
      
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error clocking in');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Modify the clockOut function
  const clockOut = async () => {
    if (!isClockedIn) {
      toast.error('You need to clock in first.');
      return;
    }

    try {
      const dailyStatus = await checkDailyClockStatus(email);
      
      if (dailyStatus.hasClockedOutToday) {
        toast.warning('You have already clocked out today. Only one clock-out per day is allowed.');
        return;
      }

      // Check if report has been submitted
      if (!hasSubmittedReport) {
        toast.error('Please submit your daily report before clocking out.');
        return;
      }

      const response = await axios.post(`${config.apiUrl}/qubinest/clockout`, { 
        email,
        date: new Date().toISOString()
      });
      
      const { isClockedIn: clockedIn, clockOutTime } = response.data;
      
      setIsClockedIn(clockedIn);
      setClockOutTime(new Date(clockOutTime).toLocaleTimeString());
      toast.success('Clock-out successful!');
      
      // Store clock-out status in localStorage
      localStorage.setItem(`lastClockOut_${email}`, new Date().toISOString());
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

  const AssociateDetails = memo(() => {
    const displayData = useMemo(() => {
      const data = employeeData || employeeInfo || employeeDataRef.current;
      if (!data) return null;
      
      // Combine user data with employee data
      return {
        ...data,
        mainPosition: data.users?.[0]?.mainPosition || 'Not Specified',
        salary: data.users?.[0]?.salary || 'Not Specified',
        joiningDate: data.users?.[0]?.joiningDate || data.hireDate
      };
    }, [employeeData, employeeInfo]);
  
    if (employeeInfoLoading && !displayData) {
      return (
        <div className="card-body d-flex justify-center align-items-center h-64">
          <Loading />
        </div>
      );
    }
  
    if (!displayData) {
      return (
        <div className="card-body d-flex justify-center align-items-center h-64">
          <p>No employee details found.</p>
        </div>
      );
    }
  
    return (
      <div className="card-body pt-0" bis_skin_checked={1}>
        <div className="row" bis_skin_checked={1}>
          <div className="col-7" bis_skin_checked={1}>
            <h2 className="lead"><b>{displayData.firstname} {displayData.lastname}</b></h2>
            <p className="text-muted text-sm">
              <b>Role: </b> {displayData.users?.[0]?.role || 'Not Specified'}
            </p>
            <ul className="ml-4 mb-0 fa-ul text-muted">
              <li className="small pt-2">
                <span className="fa-li"><i className="fas fa-lg fa-id-card" /></span>
                <span className='font-bold'> Emp Id:</span> {displayData.employee_id}
              </li>
              <li className="small pt-2">
                <span className="fa-li"><i className="fas fa-lg fa-envelope" /></span>
                <span className='font-bold'> Company Email:</span> {displayData.companyEmail}
              </li>
              <li className="small pt-2">
                <span className="fa-li"><i className="fas fa-lg fa-briefcase" /></span>
                <span className='font-bold'> Position:</span> {displayData.mainPosition || 'Not Specified'}
              </li>
              <li className="small pt-2">
                <span className="fa-li"><i className="fas fa-lg fa-calendar" /></span>
                <span className='font-bold'> Joining Date:</span> {new Date(displayData.joiningDate).toLocaleDateString()}
              </li>
              <li className="small pt-2">
                <span className="fa-li"><i className="fas fa-lg fa-graduation-cap" /></span>
                <span className='font-bold'> Education:</span> {displayData.education || 'Not Specified'}
              </li>
              <li className="small pt-2">
                <span className="fa-li"><i className="fas fa-lg fa-code" /></span>
                <span className='font-bold'> Skills:</span> {displayData.skills || 'Not Specified'}
              </li>
              <li className="small pt-2">
                <span className="fa-li"><i className="fas fa-lg fa-user-check" /></span>
                <span className='font-bold'> Status:</span> {displayData.users?.[0]?.status || 'Active'}
              </li>
              <li className="small pt-2">
                <span className="fa-li"><i className="fas fa-lg fa-building" /></span>
                <span className='font-bold'> Company:</span> QubicGen Software Solutions Pvt Ltd
              </li>
            </ul>
          </div>
          <div className="col-5 text-center pt-3" bis_skin_checked={1}>
            <img
              className="profile-user-img img-fluid img-circle h-24"
              src={displayData.employeeImg}
              alt={`${displayData.firstname} avatar`}
              onError={(e) => {
                e.target.src = 'https://res.cloudinary.com/defsu5bfc/image/upload/v1717093278/facebook_images_f7am6j.webp';
              }}
            />
          </div>
        </div>
      </div>
    );
  });

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

  // Add debugging logs
  useEffect(() => {
    console.log('State updates:', {
      employeeData,
      employeeInfo,
      refData: employeeDataRef.current,
      loading: employeeInfoLoading
    });
  }, [employeeData, employeeInfo, employeeInfoLoading]);

  // Add this state to track if report is submitted for the day
  const [hasSubmittedReport, setHasSubmittedReport] = useState(false);

  // Add this effect to check report submission status on component mount
  useEffect(() => {
    const checkReportStatus = async () => {
      try {
        const response = await axios.get(`${config.apiUrl}/qubinest/report-status/${email}`);
        setHasSubmittedReport(response.data.hasSubmitted);
      } catch (error) {
        console.error('Error checking report status:', error);
      }
    };

    if (isClockedIn) {
      checkReportStatus();
    }
  }, [isClockedIn, email]);

  // Add this effect to check initial clock status
  useEffect(() => {
    const checkInitialClockStatus = async () => {
      if (!email) return;

      try {
        const dailyStatus = await checkDailyClockStatus(email);
        setIsClockedIn(dailyStatus.hasClockedInToday && !dailyStatus.hasClockedOutToday);
        
        if (dailyStatus.clockInTime) {
          setClockInTime(new Date(dailyStatus.clockInTime).toLocaleTimeString());
        }
        
        if (dailyStatus.clockOutTime) {
          setClockOutTime(new Date(dailyStatus.clockOutTime).toLocaleTimeString());
        }
        
        setHasSubmittedReport(dailyStatus.hasSubmittedReport || false);
      } catch (error) {
        console.error('Error checking initial clock status:', error);
      }
    };

    checkInitialClockStatus();
  }, [email]);

  // Add this state for tooltip
  const [showReportTooltip, setShowReportTooltip] = useState(false);

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
            <Header 
              employeeData={employeeData}
              isClockedIn={isClockedIn}
              clockInTime={clockInTime}
              clockOutTime={clockOutTime}
              hasSubmittedReport={hasSubmittedReport}
              clockIn={clockIn}
              clockOut={clockOut}
            />
          </div>
        </div>

        <section className="content">
          <div className="container-fluid">
            <div className="row">
      

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
                                          placeholder="Submit Your Daily Update...! (Required)"
                                          className="bg-white"
                                          style={{ height: '200px', marginBottom: '50px' }}
                                          required
                                        />
                                        {!reportContent && (
                                          <p className="text-red-500 text-sm mt-1">
                                            * Daily report is required
                                          </p>
                                        )}
                                      </div>
                                      <div className="flex justify-center mt-16">
                                        <button
                                          type="submit"
                                          disabled={uploadingMedia || !reportContent.trim()}
                                          className={`inline-flex cursor-pointer items-center gap-1 rounded bg-yellow-300 border px-4 py-2 text-sm font-bold transform hover:scale-110 transition duration-400 ease-in-out hover:bg-yellow-500 ${
                                            (uploadingMedia || !reportContent.trim()) ? 'opacity-50 cursor-not-allowed' : ''
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

                  <div className="card h-[40vh]" bis_skin_checked={1} >

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

                    <div className="card-body table-responsive p-0 h-full" >
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



                <div className="col-12 col-lg-6  " >

               

                  <iframe src="https://qubic-gen.blogspot.com/" frameborder="0" className="relative  h-[40vh] rounded-lg w-full"></iframe>

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
      <ToastContainer
        position="top-right"
        autoClose={3000}
        limit={3}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
};
export default Dashboard;
