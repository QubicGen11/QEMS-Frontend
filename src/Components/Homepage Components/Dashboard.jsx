import React, { useState, useEffect, useRef, useCallback, memo, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import config from "../config";
import { Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import { useUser } from '../context/UserContext';
import UserDetailModal from './UserDetailModal';
// import { fetchAttendanceData } from './api';
import Loading from '../Loading Components/Loading';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import useEmployeeStore from '../../store/employeeStore';
import {
  FaBriefcase as FiBriefcase,
  FaHashtag as FiHash,
  FaLightbulb as FiLightbulb,
  FaClock as FiClock,
  FaSignInAlt as FiLogIn,
  FaSignOutAlt as FiLogOut,
  FaPalette
} from 'react-icons/fa';
import { ToastContainer } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import ProductivityTools from './ProductivityTools';
import DailyTips from './DailyTips';
import InterestWidget from './InterestWidget';
import ThemeSelector from './ThemeSelector';
import FAQChatbot from './FAQChatbot';
import QuickNotes from './QuickNotes';
import VirtualPet from './VirtualPet';
// import { FiLightbulb, FiClock } from 'react-icons/fi'

// const CACHE_EXPIRY_TIME = 60 * 60 * 1000;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache
const TIMESHEET_CACHE_KEY = 'dashboard_timesheet';



const Header = ({ employeeData, isClockedIn, clockInTime, clockOutTime, hasSubmittedReport, clockIn, clockOut }) => {
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [greetingMessage, setGreetingMessage] = useState('');
  const [showReportTooltip, setShowReportTooltip] = useState(false);

  const backgroundImages = [
    "https://images.pexels.com/photos/189349/pexels-photo-189349.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"

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
          filter: 'brightness(0.7)',
          backgroundVideo: 'https://videos.pexels.com/video-files/3099522/3099522-hd_1920_1080_25fps.mp4'
        }}
      />

      {/* Content */}
      <div className="relative z-10 p-6 flex flex-col">
        <div className="flex justify-between items-start">
          <div>
            <motion.h1
              className="text-3xl font-bold text-white mb-2"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.7,
                ease: "easeOut"
              }}
            >
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7 }}
                className="inline-block"
              >
                {greetingMessage.split('').map((char, index) => (
                  <motion.span
                    key={index}
                    className="inline-block"
                    animate={{
                      y: [0, -15, 0],
                      color: [
                        'hsl(0, 100%, 75%)',
                        'hsl(60, 100%, 75%)',
                        'hsl(120, 100%, 75%)',
                        'hsl(180, 100%, 75%)',
                        'hsl(240, 100%, 75%)',
                        'hsl(300, 100%, 75%)',
                        'hsl(360, 100%, 75%)',
                      ],
                      textShadow: [
                        '0 0 5px rgba(255,255,255,0.5)',
                        '0 0 15px rgba(255,255,255,0.5)',
                        '0 0 5px rgba(255,255,255,0.5)',
                      ]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 1,
                      delay: index * 0.1,
                      ease: [0.6, 0.01, -0.05, 0.95]
                    }}
                  >
                    {char}
                  </motion.span>
                ))}, {' '}
              </motion.span>

              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="inline-block"
              >
                <motion.span className="inline-block">
                  {(employeeData?.firstname || '').split('').map((char, index) => (
                    <motion.span
                      key={index}
                      className="inline-block"
                      animate={{
                        y: [0, -10, 0],
                        scale: [1, 1.05, 1],


                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 1,
                        delay: index * 0.1,
                        ease: [0.4, 0, 0.2, 1]
                      }}
                    >
                      {char}
                    </motion.span>
                  ))}
                </motion.span>
                {' '}
                <motion.span className="inline-block">
                  {(employeeData?.lastname || '').split('').map((char, index) => (
                    <motion.span
                      key={index}
                      className="inline-block"
                      animate={{
                        y: [0, -10, 0],
                        scale: [1, 1.05, 1],


                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 1,
                        delay: index * 0.1,
                        ease: "easeInOut"
                      }}
                    >
                      {char}
                    </motion.span>
                  ))}
                </motion.span>
              </motion.span>
            </motion.h1>
            <div className="flex items-center gap-4 text-white/80">
              <motion.span
                className="flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  animate={{
                    y: [0, -2, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <FiBriefcase className="w-4 h-4" />
                </motion.div>
                {employeeData?.users?.[0]?.mainPosition || 'Web Developer'}
              </motion.span>
              <motion.span
                className="flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  animate={{
                    y: [0, -2, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5
                  }}
                >
                  <FiHash className="w-4 h-4" />
                </motion.div>
                {employeeData?.employee_id}
              </motion.span>
            </div>
          </div>

          {/* Logo */}
          <div className="flex-shrink-0">
            <motion.img
              src="https://res.cloudinary.com/defsu5bfc/image/upload/v1714828410/logo_3_jizb6b.png"
              alt="Company Logo"
              className="w-16 h-16 object-contain"
              style={{
                perspective: "1000px",
                transformStyle: "preserve-3d"
              }}
              animate={{
                rotateY: [0, 360],
              }}
              transition={{
                duration: 3,
                ease: "linear",
                repeat: Infinity,
                repeatDelay: 1
              }}
              whileHover={{
                scale: 1.1,
                rotateX: [0, 45, -45, 0],
                rotateY: [0, 45, -45, 0],
                rotateZ: [0, 45, -45, 0],
              }}
              drag
              dragConstraints={{
                top: -10,
                left: -10,
                right: 10,
                bottom: 10,
              }}
              dragElastic={0.1}
              dragTransition={{ bounceStiffness: 300, bounceDamping: 10 }}
            />
          </div>
        </div>

        {/* New Tip of the Day section */}
        <DailyTips />
      </div>

      {/* Clock In/Out Section with smoother animations */}
      <motion.div
        className="relative z-10 grid grid-cols-2 border-t border-white/10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.7,
          delay: 1,
          ease: "easeOut"
        }}
      >
        <motion.button
          onClick={clockIn}
          disabled={isClockedIn}
          whileHover={!isClockedIn ? {
            scale: 1.01,
            backgroundColor: "rgba(34, 197, 94, 0.1)",
            transition: { duration: 0.3 }
          } : {}}
          whileTap={!isClockedIn ? { scale: 0.98 } : {}}
          className={`flex items-center justify-center gap-2 py-4 px-6 transition-colors font-bold text-lg ${isClockedIn
              ? 'bg-gray-800/50 text-gray-400 cursor-not-allowed'
              : 'bg-black/50 text-white'
            }`}
        >
          <motion.div
            animate={!isClockedIn ? {
              y: [0, -2, 0],
            } : {}}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <FiLogIn className="w-5 h-5" />
          </motion.div>
          Clock In
          {clockInTime && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.75 }}
              transition={{ duration: 0.3 }}
              className="text-md"
            >
              ({clockInTime})
            </motion.span>
          )}
        </motion.button>

        <motion.button
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
          whileHover={isClockedIn ? {
            scale: 1.01,
            backgroundColor: hasSubmittedReport ? "rgba(239, 68, 68, 0.1)" : "rgba(234, 179, 8, 0.1)",
            transition: { duration: 0.3 }
          } : {}}
          whileTap={isClockedIn ? { scale: 0.98 } : {}}
          className={`flex items-center justify-center gap-2 py-4 px-6 transition-colors relative font-bold text-lg ${!isClockedIn
              ? 'bg-gray-800/50 text-gray-400 cursor-not-allowed'
              : 'bg-black/50 text-white'
            } border-l border-white/10`}
        >
          <motion.div
            animate={isClockedIn ? {
              y: [0, -2, 0],
            } : {}}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <FiLogOut className="w-5 h-5" />
          </motion.div>
          Clock Out
          {clockOutTime && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.75 }}
              transition={{ duration: 0.3 }}
              className="text-md"
            >
              ({clockOutTime})
            </motion.span>
          )}

          <AnimatePresence>
            {showReportTooltip && isClockedIn && !hasSubmittedReport && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max"
              >
                <motion.div
                  className="bg-black text-white text-sm py-2 px-4 rounded-lg shadow-lg"
                  animate={{
                    y: [0, -2, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <div className="flex items-center gap-2">
                    <motion.svg
                      className="w-4 h-4 text-yellow-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      animate={{
                        rotate: [0, 5, -5, 5, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </motion.svg>
                    <span>Please submit your daily report first</span>
                  </div>
                </motion.div>
                <motion.div
                  className="absolute left-1/2 transform -translate-x-1/2 -bottom-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="border-8 border-transparent border-t-black"></div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {isClockedIn && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                duration: 0.3,
                ease: "easeOut"
              }}
              className={`absolute -top-2 -right-2 w-4 h-4 rounded-full ${hasSubmittedReport ? 'bg-green-500' : 'bg-yellow-500'
                }`}
            />
          )}
        </motion.button>
      </motion.div>
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
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['image'],

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



  const AssociateDetails = memo(() => {
    const displayData = useMemo(() => {
      const data = employeeData || employeeInfo || employeeDataRef.current;
      if (!data) return null;

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
      <div className="card-body h-auto p-4 rounded-lg shadow-xl bg-white/90">
        <div className="grid grid-cols-3 h-full gap-4">
          {/* Left Column - Details (using 2 columns) */}
          <div className="col-span-2 h-full ">
            {/* Static Content */}
            <div className="mb-3">
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                {displayData.firstname} {displayData.lastname}
              </h2>
              <p className="text-emerald-600 text-sm">
                <span className="font-semibold">Role:</span> {displayData.users?.[0]?.role || 'Not Specified'}
              </p>
            </div>

            {/* Scrollable Content - Fixed Height */}
            <div
              className="h-[calc(100%-4rem)] overflow-y-auto"
              style={{ scrollBehavior: 'smooth' }}
            >
              <ul className="space-y-2">
                {[
                  { icon: "fa-id-card", label: "Emp Id", value: displayData.employee_id },
                  { icon: "fa-envelope", label: "Company Email", value: displayData.companyEmail },
                  { icon: "fa-briefcase", label: "Position", value: displayData.mainPosition },
                  { icon: "fa-calendar", label: "Joining Date", value: new Date(displayData.joiningDate).toLocaleDateString() },
                  { icon: "fa-graduation-cap", label: "Education", value: displayData.education },
                  { icon: "fa-code", label: "Skills", value: displayData.skills },
                  { icon: "fa-user-check", label: "Status", value: displayData.users?.[0]?.status },
                  { icon: "fa-building", label: "Company", value: "QubicGen Software Solutions Pvt Ltd" }
                ].map((item, index) => (
                  <li
                    key={item.label}
                    className="flex items-center text-sm hover:bg-gray-50 rounded-md p-1.5"
                  >
                    <span className="w-7 h-7 flex-shrink-0 flex items-center justify-center bg-emerald-100 rounded-full mr-2">
                      <i className={`fas ${item.icon} text-emerald-600 text-xs`} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-gray-600 mr-2">{item.label}:</span>
                      <span className="text-gray-700">{item.value || 'Not Specified'}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column - Image */}
          <div className="flex items-center justify-center">
            <img
              className="w-24 h-24 rounded-full object-cover border-2 border-emerald-500 shadow-md"
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
    // Use ref to track initial render




    if (isLoading && isInitialLoad) {
      return (
        <tr>
          <td colSpan="4" className="text-center py-8">
            <div className="flex justify-center items-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-emerald-200 border-t-emerald-500"></div>
              <span className="text-gray-600 text-sm font-medium animate-pulse">Loading timesheet data...</span>
            </div>
          </td>
        </tr>
      );
    }

    if (!data?.length) {
      return (
        <tr>
          <td colSpan="4" className="text-center py-8">
            <div className="flex flex-col items-center justify-center text-gray-500">
              <i className="fas fa-calendar-times text-2xl mb-2 text-gray-400"></i>
              <span className="text-sm">No timesheet records found</span>
            </div>
          </td>
        </tr>
      );
    }

    return data.map((attendance, index) => (
      <tr
        key={attendance.id}


      >
        <td className="py-3 px-4">
          <div className="flex items-center space-x-2">
            <i className="fas fa-calendar-day text-emerald-500 text-xs"></i>
            <span className="text-gray-700">{new Date(attendance.date).toLocaleDateString()}</span>
          </div>
        </td>
        <td className="py-3 px-4">
          <div className="flex items-center space-x-2">
            <i className="fas fa-sign-in-alt text-blue-500 text-xs"></i>
            <span className="text-gray-700">{formatTime(attendance.checkin_Time)}</span>
          </div>
        </td>
        <td className="py-3 px-4">
          <div className="flex items-center space-x-2">
            <i className="fas fa-sign-out-alt text-red-500 text-xs"></i>
            <span className="text-gray-700">{formatTime(attendance.checkout_Time)}</span>
          </div>
        </td>
        <td className="py-3 px-4">
          <StatusBadge status={attendance.status} />
        </td>
      </tr>
    ));
  }, (prevProps, nextProps) => {
    // Implement deep comparison for data
    return JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data) &&
      prevProps.isLoading === nextProps.isLoading;
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
  // const [showReportTooltip, setShowReportTooltip] = useState(false);

  // Add this CSS animation


  const [isThemeSelectorOpen, setIsThemeSelectorOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(() => {
    // Initialize from localStorage with a default theme
    const savedTheme = localStorage.getItem('dashboardTheme');
    return savedTheme ? JSON.parse(savedTheme) : {
      type: 'image',
      value: ''
    };
  });

  // Save theme to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('dashboardTheme', JSON.stringify(currentTheme));
    } catch (error) {
      console.error('Error saving theme to localStorage:', error);
    }
  }, [currentTheme]);

  const handleThemeSelect = (theme) => {
    try {
      setCurrentTheme(theme);
      localStorage.setItem('dashboardTheme', JSON.stringify(theme));
      setIsThemeSelectorOpen(false);
    } catch (error) {
      console.error('Error handling theme selection:', error);
    }
  };

  return (
    <>
      <div
        className="content-wrapper"
        style={{
          background: currentTheme.type === 'image'
            ? `url('${currentTheme.value}')`
            : currentTheme.value,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          transition: "background 0.3s ease"
        }}
      >
        {/* Add theme selector button somewhere in your header or navbar */}
        <button
          onClick={() => setIsThemeSelectorOpen(true)}
          className="fixed bottom-4 right-4 p-3 
                     bg-gray-900/80 dark:bg-white/80 
                     backdrop-blur-md rounded-full 
                     shadow-lg hover:scale-110 
                     transform duration-200 
                     border border-white/20
                     group
                     z-[9999]"
        >
          <FaPalette
            className="w-5 h-5 
                       text-black dark:text-gray-800 
                       group-hover:rotate-12 transition-transform"
          />
          <div className="absolute -top-8 right-0 
                          bg-black/75 text-white text-xs 
                          px-2 py-1 rounded-md opacity-0 
                          group-hover:opacity-100 transition-opacity
                          whitespace-nowrap">
            Change Theme
          </div>
        </button>

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
                <div className="small-box bg-white rounded-lg shadow-md transition-all duration-300 hover:shadow-lg">
                  <div className="inner p-6">
                    {/* Time Display Section */}
                    <div className="mb-6 animate-fadeIn">
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center space-x-2">
                          <i className="fas fa-clock text-emerald-500"></i>
                          <span className="text-gray-700 font-medium">
                            {currentTime.toLocaleDateString('en-US', { weekday: 'long' })}
                          </span>
                        </div>
                        <span className="text-emerald-600 font-semibold animate-pulse">
                          {currentTime.toLocaleTimeString('en-US')}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-center text-gray-800 mb-4">
                        Work Time
                      </h3>
                    </div>

                    {/* Task Report Section */}
                    <div className="card-footer p-0 animate-slideUp">
                      <div className="bg-white rounded-lg">
                        <div className="p-4">
                          {/* Header */}
                          <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center space-x-2">
                              <i className="fas fa-tasks text-emerald-500"></i>
                              <h4 className="text-gray-700 font-medium">Task Reports</h4>
                            </div>
                            <span className={`text-xs font-medium ${reportText.length >= MAX_CHAR_LIMIT ? 'text-red-500' : 'text-gray-500'
                              }`}>
                              {reportText.length}/{MAX_CHAR_LIMIT}
                            </span>
                          </div>

                          {/* Report Form */}
                          <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="transition-all duration-300 hover:shadow-md rounded-lg">
                              <ReactQuill
                                value={reportContent}
                                onChange={setReportContent}
                                modules={modules}
                                formats={formats}
                                placeholder="Submit Your Daily Update...! (Required)"
                                className="bg-white rounded-lg"
                                style={{
                                  height: '200px',
                                  marginBottom: '50px',
                                  border: '1px solid #e2e8f0',
                                  borderRadius: '0.5rem'
                                }}
                                required
                              />
                              {!reportContent && (
                                <p className="text-red-500 text-sm mt-2 flex items-center">
                                  <i className="fas fa-exclamation-circle mr-2"></i>
                                  Daily report is required
                                </p>
                              )}
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-center mt-16">
                              <button
                                type="submit"
                                disabled={uploadingMedia || !reportContent.trim()}
                                className={`
                                  inline-flex items-center gap-2 px-6 py-2.5 
                                  rounded-full font-semibold text-sm
                                  transform transition-all duration-300
                                  ${uploadingMedia || !reportContent.trim()
                                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                    : 'bg-emerald-500 text-white hover:bg-emerald-600 hover:scale-105 active:scale-95'
                                  }
                                  shadow-md hover:shadow-lg
                                `}
                              >
                                {uploadingMedia ? (
                                  <>
                                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                    <span>Uploading...</span>
                                  </>
                                ) : (
                                  <>
                                    <i className="fas fa-paper-plane"></i>
                                    <span>Submit Report</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Add these animations to your global CSS */}
                <style jsx>{`
                  @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                  }

                  @keyframes slideUp {
                    from {
                      opacity: 0;
                      transform: translateY(20px);
                    }
                    to {
                      opacity: 1;
                      transform: translateY(0);
                    }
                  }

                  .animate-fadeIn {
                    animation: fadeIn 0.5s ease-out forwards;
                  }

                  .animate-slideUp {
                    animation: slideUp 0.5s ease-out forwards;
                  }
                `}</style>
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






                <div className='z-[1200]'>
                  <FAQChatbot />
                </div>
              </div>






            </div>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-6 p-4">
          {/* Productivity Tools */}
          <div className="w-full">
            <ProductivityTools />
          </div>

          {/* Quick Notes & Todo */}
          <div className="w-full">
            <QuickNotes />
          </div>
        </div>
   


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

      <ThemeSelector
        isOpen={isThemeSelectorOpen}
        onClose={() => setIsThemeSelectorOpen(false)}
        onSelectTheme={handleThemeSelect}
        currentTheme={currentTheme} // Pass current theme to show active selection
      />

    </>
  );
};
export default Dashboard;
