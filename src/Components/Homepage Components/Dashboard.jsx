import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const Dashboard = () => {




  const [isClockedIn, setIsClockedIn] = useState(false);
  const [time, setTime] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [reportText, setReportText] = useState('');
  const [isReportSubmitted, setIsReportSubmitted] = useState(false);
  const intervalRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greetingMessage, setGreetingMessage] = useState('');
  const MIN_CHAR_LIMIT = 10; // Minimum character limit for the report
  const MAX_CHAR_LIMIT = 500; // Maximum character limit for the report




  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer); // Cleanup interval on component unmount
  }, []);



  const clockIn = () => {
    const lastClockInDate = localStorage.getItem('lastClockInDate');
    const currentDate = new Date().toLocaleDateString();
    if (lastClockInDate === currentDate) {
      toast.error('You have already clocked in today!');
      return;
    }


    setIsClockedIn(true);
    const now = new Date();
    const formattedTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    // alert(`Employee Successfully Clocked In at ${formattedTime}`);
    toast.success(`Employee Successfully Clocked In at ${formattedTime}`);
    localStorage.setItem('lastClockInDate', currentDate);

    intervalRef.current = setInterval(() => {
      setTime(prevTime => {
        const newSeconds = prevTime.seconds + 1;
        const newMinutes = prevTime.minutes + Math.floor(newSeconds / 60);
        const newHours = prevTime.hours + Math.floor(newMinutes / 60);
        return {
          hours: newHours % 24,
          minutes: newMinutes % 60,
          seconds: newSeconds % 60,
        };
      });
    }, 1000);
  };



  const clockOut = () => {
    if (isClockedIn) {
      if (isReportSubmitted) {
        setIsClockedIn(false);
        const now = new Date();
        const formattedTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        toast.success(`Employee Successfully Clocked Out at ${formattedTime}`)

        clearInterval(intervalRef.current);
        setTime({ hours: 0, minutes: 0, seconds: 0 }); // Reset the timer
        setIsReportSubmitted(false); // Reset report submission status
      } else {
        toast.error('You need to submit your daily update before clocking out!');
      }
    } else {
      toast.error('You need to clock in first!');
    }
  };


  const resetClockInStatus = () => {
    localStorage.removeItem('lastClockInDate');
    setIsClockedIn(false);
    setTime({ hours: 0, minutes: 0, seconds: 0 });
    toast.success('Clock-in status has been reset!');
  };


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


  const handleSubmit = (event) => {
    event.preventDefault();
    if (reportText.length < MIN_CHAR_LIMIT) { // Check if reportText is below the minimum length
      toast.error(`Report must be at least ${MIN_CHAR_LIMIT} characters`);
      return;
    }
    console.log('Daily Update Submitted:', reportText);
    toast.success('Report Submitted Successfully, now you can clock out');
    setIsReportSubmitted(true);
    setReportText('');
  };

  const onChangesubmit = (event) => {
    if (event.target.value.length <= MAX_CHAR_LIMIT) {
      setReportText(event.target.value);
    }
  };
  // Cleanup interval on component unmount
  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);








  return (
    <>

      <div className="content-wrapper">
        <div className="content-header">
          <div className="container-fluid">
            <div className="row mb-2">
              <div className="col-sm-6">
                <h1 className="m-0">Console</h1>
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


        {/* This is clock in function */}


        <section className="content">
          <div className="container-fluid">
            <div className="row">
              <div className="col-lg-12 col-12 col-sm-12">
                <div className="card card-widget widget-user-2" bis_skin_checked={1}>
                  <div className="card card-widget widget-user shadow-lg">
                    <div className="widget-user-header text-white" style={{ background: 'url("../distingg/img/photo1.png") center center' }}>
                      <h3 className="widget-user-username text-left ml-auto text-base shadow-xl-black " style={{ fontWeight: 'bolder', textShadow: '5px 5px black' }}>{`${greetingMessage}, Shaik Sajid Hussain`}</h3>
                      <h5 className="widget-user-desc text-left ml-auto">Web Developer</h5>
                    </div>
                    <div className="widget-user-image">
                      <img className="img-circle" src="https://res.cloudinary.com/defsu5bfc/image/upload/v1710237566/QubicGen/Contact%20Us/cropped_robot_yspx0x.jpg" alt="User Avatar" />
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

                          className={`w-20 bg-red-400 text-xs text-white font-semibold py-2 px-1 rounded-full shadow-lg transform hover:scale-105 transition duration-300 ease-in-out ml-4 `}
                          onClick={resetClockInStatus} >
                          Reset
                        </button>
                      </div>
                    </div>

                  </div>

                </div>
              </div>
              <div className="col-lg-6 col-12  ">
                <div className="small-box bg-white" bis_size="{&quot;x&quot;:371,&quot;y&quot;:72,&quot;w&quot;:341,&quot;h&quot;:142,&quot;abs_x&quot;:621,&quot;abs_y&quot;:169}">
                  <div className="inner h-4/6" bis_size="{&quot;x&quot;:371,&quot;y&quot;:72,&quot;w&quot;:341,&quot;h&quot;:112,&quot;abs_x&quot;:621,&quot;abs_y&quot;:169}" >
                    {/* <h3 bis_size="{&quot;x&quot;:381,&quot;y&quot;:82,&quot;w&quot;:321,&quot;h&quot;:42,&quot;abs_x&quot;:631,&quot;abs_y&quot;:179}" style={{fontSize:'25px'}}>Statistics<sup style={{fontSize: '20px'}} bis_size="{&quot;x&quot;:418,&quot;y&quot;:85,&quot;w&quot;:17,&quot;h&quot;:25,&quot;abs_x&quot;:668,&quot;abs_y&quot;:182}"></sup></h3> */}
                    <p className='text-left' style={{ fontSize: '15px', height: '65px' }}>
                      {currentTime.toLocaleDateString('en-US', { weekday: 'long' })}, {currentTime.toLocaleTimeString('en-US')}                      <p bis_size="{&quot;x&quot;:381,&quot;y&quot;:134,&quot;w&quot;:321,&quot;h&quot;:24,&quot;abs_x&quot;:631,&quot;abs_y&quot;:231}" className='text-center text-lg my-2'>Work Time</p>
                    </p>
                    <p className='text-center ' style={{ fontSize: '20px' }}> {`${time.hours} Hrs : ${time.minutes} Min : ${time.seconds} Sec`}</p>

                    {/* <a href="#" className="small-box-footer ml-3" bis_size="{&quot;x&quot;:371,&quot;y&quot;:184,&quot;w&quot;:341,&quot;h&quot;:30,&quot;abs_x&quot;:621,&quot;abs_y&quot;:281}">View Attendence <i className="fas fa-arrow-circle-right" bis_size="{&quot;x&quot;:567,&quot;y&quot;:191,&quot;w&quot;:16,&quot;h&quot;:16,&quot;abs_x&quot;:817,&quot;abs_y&quot;:288}" /></a> */}
                    <div className="card-footer p-0" bis_skin_checked={1} >
                      <ul className="nav flex-column bg-white">
                        <li className="nav-item flex justify-center align-middle items-center">
                          <div className="bg-white h-4/6" bis_size="{&quot;x&quot;:371,&quot;y&quot;:72,&quot;w&quot;:341,&quot;h&quot;:112,&quot;abs_x&quot;:621,&quot;abs_y&quot;:169}" >
                            {/* <h3 bis_size="{&quot;x&quot;:381,&quot;y&quot;:82,&quot;w&quot;:321,&quot;h&quot;:42,&quot;abs_x&quot;:631,&quot;abs_y&quot;:179}" style={{fontSize:'25px'}}>Statistics<sup style={{fontSize: '20px'}} bis_size="{&quot;x&quot;:418,&quot;y&quot;:85,&quot;w&quot;:17,&quot;h&quot;:25,&quot;abs_x&quot;:668,&quot;abs_y&quot;:182}"></sup></h3> */}
                            <div className='flex justify-between'>

                              <p bis_size="{&quot;x&quot;:381,&quot;y&quot;:134,&quot;w&quot;:321,&quot;h&quot;:24,&quot;abs_x&quot;:631,&quot;abs_y&quot;:231}" className='text-left text-sm'>Task Reports</p>
                              <p className="text-xs text-right mb-2">{reportText.length}/{MAX_CHAR_LIMIT}</p>
                            </div>

                            <div className="card-footer bg-w p-0" bis_skin_checked={1}>
                              <div className="reports bg-white">
                                <form onSubmit={handleSubmit}>
                                  <textarea
                                    value={reportText}
                                    onChange={onChangesubmit}
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


                        </li>



                      </ul>
                    </div>
                  </div>

                </div>

              </div>



              {/* This is Reports */}
              <div className="col-lg-6 shadow-md bg-white rounded-xl" >
                <div className=" h-6/6" bis_size="{&quot;x&quot;:371,&quot;y&quot;:72,&quot;w&quot;:341,&quot;h&quot;:112,&quot;abs_x&quot;:621,&quot;abs_y&quot;:169}" >

                  <div className='flex justify-between'>
                    <p bis_size="{&quot;x&quot;:381,&quot;y&quot;:134,&quot;w&quot;:321,&quot;h&quot;:24,&quot;abs_x&quot;:631,&quot;abs_y&quot;:231}" className='text-left mx-2 font-bold' >My Details</p>

                    <p bis_size="{&quot;x&quot;:381,&quot;y&quot;:134,&quot;w&quot;:321,&quot;h&quot;:24,&quot;abs_x&quot;:631,&quot;abs_y&quot;:231}" className='text-left mx-2 text-sm  text-black font-bold py-1 px-3 my-1 transform hover:scale-105 transition duration-300 ease-in-out hover:bg-yellow-300 rounded-xl'  >More Details  </p>
                  </div>
                  <div className="card-footer p-2 bg-white" bis_skin_checked={1}>


                    <div className='flex justify-evenly '>

                      <div className="section_personal">
                        <h1 className='mx-2 font-bold'>Personal Information :</h1>

                        <h5 className='px-2 text-xs mt-3 font-semibold'>First Name : </h5>
                        <h5 className='px-2 text-xs mt-2 font-semibold'>Second Name :</h5>
                        <h5 className='px-2 text-xs mt-2 font-semibold'>Email(Personal) :</h5>
                        <h5 className='px-2 text-xs mt-2 font-semibold'>Phone Number :</h5>
                        <h5 className='px-2 text-xs mt-2 font-semibold'>Address :</h5>
                      </div>
                      <div className="section_personal">
                        <h1 className='mx-2 font-bold'>Project Information :</h1>

                        <h5 className='px-2 text-xs mt-3 font-semibold'>Associate ID :</h5>
                        <h5 className='px-2 text-xs mt-2 font-semibold'>Designaton :</h5>
                        <h5 className='px-2 text-xs mt-2 font-semibold'>Company Mail :</h5>
                        <h5 className='px-2 text-xs mt-2 font-semibold'>Business Unit :</h5>
                        <h5 className='px-2 text-xs mt-2 font-semibold'>Project Name :</h5>
                        <h5 className='px-2 text-xs mt-2 font-semibold'>Project Location :</h5>
                      </div>
                    </div>


                  </div>
                </div>
              </div>
              {/* <div className="small-box bg-white h-[33vh] lg:h-[20vh] md:h-[23vh]" bis_size="{&quot;x&quot;:371,&quot;y&quot;:72,&quot;w&quot;:341,&quot;h&quot;:142,&quot;abs_x&quot;:621,&quot;abs_y&quot;:169}">
                 

                </div> */}

            </div>

            {/* This is time hseet row */}

            <div className="row" bis_skin_checked={1}>
              <div className="col-12 col-lg-6" bis_skin_checked={1}>
                <div className="card" bis_skin_checked={1}>
                  <div className="card-header" bis_skin_checked={1}>
                    <h3 className="card-title">Time Sheets</h3>
                    <div className="card-tools" bis_skin_checked={1}>
                      <div className="input-group input-group-sm" style={{ width: 150 }} bis_skin_checked={1}>
                        <input type="text" name="table_search" className="form-control float-right" placeholder="Search" />
                        <div className="input-group-append" bis_skin_checked={1}>
                          <button type="submit" className="btn btn-default">
                            <i className="fas fa-search" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="card-body table-responsive p-0" bis_skin_checked={1}>
                    <table className="table table-hover text-nowrap">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>User</th>
                          <th>Date</th>
                          <th>Status</th>
                          <th>Reason</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>183</td>
                          <td>John Doe</td>
                          <td>11-7-2014</td>
                          <td><span className="tag tag-success">Approved</span></td>
                          <td>Bacon ipsum dolor sit amet salami venison chicken flank fatback doner.</td>
                        </tr>
                        <tr>
                          <td>219</td>
                          <td>Alexander Pierce</td>
                          <td>11-7-2014</td>
                          <td><span className="tag tag-warning">Pending</span></td>
                          <td>Bacon ipsum dolor sit amet salami venison chicken flank fatback doner.</td>
                        </tr>
                        <tr>
                          <td>657</td>
                          <td>Bob Doe</td>
                          <td>11-7-2014</td>
                          <td><span className="tag tag-primary">Approved</span></td>
                          <td>Bacon ipsum dolor sit amet salami venison chicken flank fatback doner.</td>
                        </tr>
                        <tr>
                          <td>175</td>
                          <td>Mike Doe</td>
                          <td>11-7-2014</td>
                          <td><span className="tag tag-danger">Denied</span></td>
                          <td>Bacon ipsum dolor sit amet salami venison chicken flank fatback doner.</td>
                        </tr>
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
              <div className='col-12 col-lg-12 mt-2 ' >

                <iframe src="https://shaiksajidhussain.github.io/menja_game/" frameborder="0" style={{width:'80vw',height:'60vh'}}></iframe>
              </div>


          </div>
        </section>
      </div>


    </>
  )
}

export default Dashboard