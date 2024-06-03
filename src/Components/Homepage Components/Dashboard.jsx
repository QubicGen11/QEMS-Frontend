import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import config from "../config";
import { Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import { useUser } from '../context/UserContext';

const Dashboard = () => {
  const [attendance, setAttendance] = useState([]);
  const [userAttendance,setUserAttendance]=useState([])
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clockInTime, setClockInTime] = useState('');
  const [clockOutTime, setClockOutTime] = useState('');
  const email = Cookies.get('email');
  const { useremail } = useUser();
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [employeeData, setEmployeeData] = useState(null);
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [time, setTime] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [reportText, setReportText] = useState('');
  const [isReportSubmitted, setIsReportSubmitted] = useState(false);
  const intervalRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greetingMessage, setGreetingMessage] = useState('');
  const MIN_CHAR_LIMIT = 10;
  const MAX_CHAR_LIMIT = 500;
  const EXPIRATION_HOURS = 24;
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
  const [employeeinfo, setEmployeeInfo] = useState(null);

  useEffect(() => {
    const fetchEmployeeInfo = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/qubinest/getemployees/${email}`);
        setEmployeeInfo(response.data);
        console.log(response.data);
      } catch (error) {
        console.error('Error fetching employee data:', error);
      }
    };

    fetchEmployeeInfo();
  }, [email]);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/qubinest/attendance/${email}`);
        setUserAttendance(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching attendance data:', error);
        setLoading(false);
      }
    };

    fetchAttendance();

    const intervalId = setInterval(fetchAttendance, 100); // Polling every 5 seconds

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, [email]);
  

 

  useEffect(() => {
    const userClockInKey = `lastClockIn_${email}`;
    const userClockOutKey = `lastClockOut_${email}`;
    const now = new Date().getTime();

    const lastClockIn = JSON.parse(localStorage.getItem(userClockInKey));
    const lastClockOut = JSON.parse(localStorage.getItem(userClockOutKey));

    if (lastClockIn && now - new Date(lastClockIn.timestamp).getTime() > EXPIRATION_HOURS * 3600 * 1000) {
      localStorage.removeItem(userClockInKey);
    } else if (lastClockIn && new Date(lastClockIn.date).toLocaleDateString() === new Date().toLocaleDateString()) {
      setIsClockedIn(true);
      setClockInTime(lastClockIn.time);
    }

    if (lastClockOut && now - new Date(lastClockOut.timestamp).getTime() > EXPIRATION_HOURS * 3600 * 1000) {
      localStorage.removeItem(userClockOutKey);
    } else if (lastClockOut && new Date(lastClockOut.date).toLocaleDateString() === new Date().toLocaleDateString()) {
      setIsClockedIn(false);
      setClockOutTime(lastClockOut.time);
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

  const onChangesubmit = (event) => {
    if (event.target.value.length <= MAX_CHAR_LIMIT) {
      setReportText(event.target.value);
    }
  };

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const response = await axios.post('http://localhost:3000/qubinest/getemployees', { email });
        setEmployeeData(response.data);
      } catch (error) {
        console.error('Error fetching employee data:', error);
      }
    };

    fetchEmployeeData();
  }, [email]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (reportText.length < MIN_CHAR_LIMIT || reportText.length > MAX_CHAR_LIMIT) {
      toast.error(`Report must be between ${MIN_CHAR_LIMIT} and ${MAX_CHAR_LIMIT} characters.`);
      return;
    }
  
    try {
      const response = await axios.post('http://localhost:3000/qubinest/report', {
        email,
        reportText
      });
      setIsReportSubmitted(true);
      toast.success('Daily report submitted successfully!');
      setReportText("");
      console.log(response.data);
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error('Failed to submit report. Please try again.');
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
        toast.error('Please register as an employee before clocking in');
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
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          localStorage.removeItem(key);
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

  return (
    <>
      <div className="content-wrapper">
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
                    <div className="widget-user-header text-white" style={{ background: 'url("https://res.cloudinary.com/defsu5bfc/image/upload/v1717239193/Black_and_Brown_Futuristic_LinkedIn_Banner_1_okjs2i.png")', backgroundSize: 'cover', backgroundRepeat: 'no-repeat', height:"25vh", backgroundPositionY:'50%'  }}>
                      
                      {employeeinfo && employeeinfo.map((emp) => (
                        <>
                          <h3 className="widget-user-username text-left ml-auto text-base shadow-xl-black" style={{ fontWeight: 'bolder', textShadow: '5px 5px black' }}>{`${greetingMessage} , ${emp.firstname} ${emp.lastname}`}</h3>
                          <h5 className="widget-user-desc text-left ml-auto">{emp.position}</h5>
                        </>
                      ))}
                    </div>

                    
                    <div className="widget-user-image">
                      <img className="" src="https://res.cloudinary.com/defsu5bfc/image/upload/v1714828410/logo_3_jizb6b.png" alt="User Avatar" style={{border:"none"}} />
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

              <div className="col-12 col-sm-12 col-md-12 col-lg-6 d-flex align-items-stretch flex-column bg-white" bis_skin_checked={1} style={{ height: 'auto' }}>
                <div className="card bg-light d-flex flex-fill bg-white" bis_skin_checked={1}>
                  <div className=' flex justify-between bg-white'>
                    <div className="card-header text-muted border-bottom-0" bis_skin_checked={1}>
                      Associate Details
                    </div>
                    <div className="card-header text-muted border-bottom-0" bis_skin_checked={1}>
                      <Link to="/viewprofile" className="btn btn-sm btn-primary" cursorshover="true">
                        <i className="fas fa-user" /> View Profile
                      </Link>
                    </div>
                  </div>

                  {employeeinfo && employeeinfo.map((employee) => (
                    <>
                      <div className="card-body pt-0" bis_skin_checked={1}>
                        <div className="row" bis_skin_checked={1}>
                          <div className="col-7" bis_skin_checked={1}>
                            <h2 className="lead"><b>{employee.firstname} {employee.lastname}</b></h2>
                            <p className="text-muted text-sm"><b>Role: </b> {employee.position} </p>
                            <ul className="ml-4 mb-0 fa-ul text-muted ">
                              <li className="small pt-2"><span className="fa-li"><i className="fas fa-lg fa-id-card" /></span> <span className='font-bold'> Emp Id :</span>{employee.employee_id}</li>
                              <li className="small pt-2"><span className="fa-li"><i className="fas fa-lg fa-envelope" /></span> <span className='font-bold'> Email :</span>{employee.email}</li>
                              <li className="small pt-2"><span className="fa-li"><i className="fas fa-lg fa-briefcase" /></span> <span className='font-bold'> Business Unit:</span> Front End Developer</li>
                            </ul>
                          </div>
                          <div className="col-5 text-center pt-3" bis_skin_checked={1}>
                            <img src="https://res.cloudinary.com/defsu5bfc/image/upload/v1717093278/facebook_images_f7am6j.webp" alt="user-avatar" className="img-circle img-fluid w-28 h-28" />
                          </div>
                        </div>
                      </div>
                      <div className="card-footer bg-white" bis_skin_checked={1}>
                        <div className="text-right bg-white" bis_skin_checked={1}>
                          {/* Add any action buttons here */}
                        </div>
                      </div>
                    </>
                  ))}
                </div>
              </div>

              <div className="col-lg-6 col-12">
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
      <textarea
        value={reportText}
        onChange={(e) => setReportText(e.target.value)}
        style={{ border: 'solid 1px black' }}
        placeholder='Submit Your Daily Update...!'
        className='text-[12px] px-1 flex mb-2 w-52 h-14 md:w-96 lg:w-96 xl:w-96'
      />
      <div className="flex justify-center">
        <button
          type="submit"
          className="inline-flex cursor-pointer h-5 w-16 items-center gap-1 rounded bg-yellow-300 border text-sm px-2 font-bold ml-1 lg:ml-24 transform hover:scale-110 transition duration-400 ease-in-out hover:bg-yellow-500"
        >
          Submit
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

              <div className="row mt-3" bis_skin_checked={1}>

              <div className="col-12 col-lg-6" bis_skin_checked={1}>

                <div className="card" bis_skin_checked={1}>

                  <div className="card-header" bis_skin_checked={1}>

                    <h3 className="card-title">Time Sheets</h3>

                    <div className="card-tools" bis_skin_checked={1}>

                      <Link to="/viewtimesheets">

                        <button
                          class="cursor-pointer flex justify-between bg-gray-800 px-3 py-2 rounded-full text-xs text-white tracking-wider shadow-xl hover:bg-gray-900 hover:scale-105 duration-500 hover:ring-1 font-mono w-[120px]"
                        >

                          View More
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke-width="2"
                            stroke="currentColor"
                            class="w-5 h-5 animate-bounce"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3"
                            ></path>
                          </svg>
                        </button>
                      </Link>



                    </div>

                  </div>

                  <div className="card-body table-responsive p-0" bis_skin_checked={1}>

                  <table className="table table-hover text-nowrap">
      <thead>
        <tr>
          <th>Date</th>
          <th>Check In</th>
          <th>Check Out</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {loading ? (
          <tr>
            <td colSpan="4">Loading...</td>
          </tr>
        ) : userAttendance.length === 0 ? (
          <tr>
            <td colSpan="4">No attendance records found</td>
          </tr>
        ) : (
          userAttendance.map((a, index) => (
            <tr key={index}>
              <td>{new Date(a.date).toLocaleDateString()}</td>
              <td>{a.checkin_Time ? new Date(a.checkin_Time).toLocaleTimeString() : 'N/A'}</td>
              <td>{a.checkout_Time ? new Date(a.checkout_Time).toLocaleTimeString() : 'N/A'}</td>
              <td>{a.status}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>


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

                        <a href="#" className="btn btn-primary text-black bg-white font-sans mt-3 rounded-xl">View all</a>

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
