import React, { useEffect, useRef, useState } from 'react'

const Dashboard = () => {




  const [isClockedIn, setIsClockedIn] = useState(false);
  const [time, setTime] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const intervalRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(new Date());


  const clockIn = () => {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    alert(`Employee Successfully Clocked In on ${formattedTime}`);
    setIsClockedIn(true);
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
    const now = new Date();
    const formattedTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    alert(`Employee Successfully Clocked Out on ${formattedTime}`);

    setIsClockedIn(false);
    clearInterval(intervalRef.current);
  };

  useEffect(() => {
    return () => clearInterval(intervalRef.current); // Cleanup interval on component unmount
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Cleanup the interval on component unmount
    return () => clearInterval(timer);
  }, []);




  return (
    <>

      <div className="content-wrapper">
        <div className="content-header">
          <div className="container-fluid">
            <div className="row mb-2">
              <div className="col-sm-6">
                <h1 className="m-0">Dashboard</h1>
              </div>
              <div className="col-sm-6">
                <ol className="breadcrumb float-sm-right">
                  <li className="breadcrumb-item"><a href="#">Home</a></li>
                  <li className="breadcrumb-item active">Dashboard v1</li>
                </ol>
              </div>
            </div>
          </div>
        </div>


        {/* This is clock in function */}


        <section className="content">
          <div className="container-fluid">
            <div className="row">
              <div className="col-lg-3 col-6">
                <div className="card card-widget widget-user-2" bis_skin_checked={1}>
                  <div className="card card-widget widget-user shadow-lg">
                    <div className="widget-user-header text-white" style={{ background: 'url("../dist/img/photo1.png") center center' }}>
                      <h3 className="widget-user-username text-right">Shaik Sajid Hussain</h3>
                      <h5 className="widget-user-desc text-right">Web Developer</h5>
                    </div>
                    <div className="widget-user-image">
                      <img className="img-circle" src="https://res.cloudinary.com/defsu5bfc/image/upload/v1710237566/QubicGen/Contact%20Us/cropped_robot_yspx0x.jpg" alt="User Avatar" />
                    </div>




                  </div>
                  <div className="row h-20">
                    <div className="col-sm-6 border-right">
                      <div className="description-block">
                        <button
                          onClick={clockIn}
                          className="w-20 bg-green-600 text-xs text-white font-semibold py-2 px-1 rounded-full shadow-lg transform hover:scale-105 transition duration-300 ease-in-out hover:bg-yellow-500"
                        >
                          Clock In
                        </button>


                      </div>
                    </div>
                    <div className="col-sm-6 border-right">
                      <div className="description-block">
                        <button
                          onClick={clockOut}
                          className="w-20 bg-red-600 text-xs text-white font-semibold py-2 px-1 rounded-full shadow-lg transform hover:scale-105 transition duration-300 ease-in-out hover:bg-yellow-500 ml-4"
                        >
                          Clock Out
                        </button>
                      </div>
                    </div>

                  </div>

                </div>
              </div>
              <div className="col-lg-3 col-6  ">
                <div className="small-box bg-white" bis_size="{&quot;x&quot;:371,&quot;y&quot;:72,&quot;w&quot;:341,&quot;h&quot;:142,&quot;abs_x&quot;:621,&quot;abs_y&quot;:169}">
                  <div className="inner h-4/6" bis_size="{&quot;x&quot;:371,&quot;y&quot;:72,&quot;w&quot;:341,&quot;h&quot;:112,&quot;abs_x&quot;:621,&quot;abs_y&quot;:169}" >
                    {/* <h3 bis_size="{&quot;x&quot;:381,&quot;y&quot;:82,&quot;w&quot;:321,&quot;h&quot;:42,&quot;abs_x&quot;:631,&quot;abs_y&quot;:179}" style={{fontSize:'25px'}}>Statistics<sup style={{fontSize: '20px'}} bis_size="{&quot;x&quot;:418,&quot;y&quot;:85,&quot;w&quot;:17,&quot;h&quot;:25,&quot;abs_x&quot;:668,&quot;abs_y&quot;:182}"></sup></h3> */}
                    <p className='text-left' style={{ fontSize: '15px', height: '65px' }}>
                      {currentTime.toLocaleDateString('en-US', { weekday: 'long' })}, {currentTime.toLocaleTimeString('en-US')}                      <p bis_size="{&quot;x&quot;:381,&quot;y&quot;:134,&quot;w&quot;:321,&quot;h&quot;:24,&quot;abs_x&quot;:631,&quot;abs_y&quot;:231}" className='text-center text-lg my-2'>Work Time</p>
                    </p>            <p className='text-center ' style={{ fontSize: '20px' }}> {`${time.hours} Hrs : ${time.minutes} Min : ${time.seconds} Sec`}</p>

                    <a href="#" className="small-box-footer ml-3" bis_size="{&quot;x&quot;:371,&quot;y&quot;:184,&quot;w&quot;:341,&quot;h&quot;:30,&quot;abs_x&quot;:621,&quot;abs_y&quot;:281}">View Attendence <i className="fas fa-arrow-circle-right" bis_size="{&quot;x&quot;:567,&quot;y&quot;:191,&quot;w&quot;:16,&quot;h&quot;:16,&quot;abs_x&quot;:817,&quot;abs_y&quot;:288}" /></a>
                    <div className="card-footer p-0" bis_skin_checked={1} >
                      <ul className="nav flex-column">
                        <li className="nav-item">
                          <div className="bg-white h-4/6" bis_size="{&quot;x&quot;:371,&quot;y&quot;:72,&quot;w&quot;:341,&quot;h&quot;:112,&quot;abs_x&quot;:621,&quot;abs_y&quot;:169}" >
                            {/* <h3 bis_size="{&quot;x&quot;:381,&quot;y&quot;:82,&quot;w&quot;:321,&quot;h&quot;:42,&quot;abs_x&quot;:631,&quot;abs_y&quot;:179}" style={{fontSize:'25px'}}>Statistics<sup style={{fontSize: '20px'}} bis_size="{&quot;x&quot;:418,&quot;y&quot;:85,&quot;w&quot;:17,&quot;h&quot;:25,&quot;abs_x&quot;:668,&quot;abs_y&quot;:182}"></sup></h3> */}
                            <p bis_size="{&quot;x&quot;:381,&quot;y&quot;:134,&quot;w&quot;:321,&quot;h&quot;:24,&quot;abs_x&quot;:631,&quot;abs_y&quot;:231}" className='text-left'>Task Reports!</p>
                            <div className="card-footer bg-w p-0" bis_skin_checked={1}>
                              <div className="reports bg-white">
                                <textarea name="" id="" style={{ border: 'solid 1px black', width: "250px" }} placeholder='Submit Your Daily Update...' className='text-[12px]'></textarea>
                                <button className="inline-flex cursor-pointer h-5 w-16 items-center gap-1 rounded bg-yellow-300 border  active:opacity-100 text-sm px-2 font-bold ml-28">
                                  Submit
                                </button>

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
              <div className="col-lg-6 " >
                <div className="small-box bg-white h-[33vh]" bis_size="{&quot;x&quot;:371,&quot;y&quot;:72,&quot;w&quot;:341,&quot;h&quot;:142,&quot;abs_x&quot;:621,&quot;abs_y&quot;:169}"  style={{
    background: `
      linear-gradient(rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.3)),
      url('https://plus.unsplash.com/premium_photo-1661775756810-82dbd209fc95?q=80&w=1954&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')
    `,
  }}>
                  <div className=" h-6/6" bis_size="{&quot;x&quot;:371,&quot;y&quot;:72,&quot;w&quot;:341,&quot;h&quot;:112,&quot;abs_x&quot;:621,&quot;abs_y&quot;:169}" >
                    
                    <div className='flex justify-between'>
                    <p bis_size="{&quot;x&quot;:381,&quot;y&quot;:134,&quot;w&quot;:321,&quot;h&quot;:24,&quot;abs_x&quot;:631,&quot;abs_y&quot;:231}" className='text-left mx-2' >My Details</p>

                    <p bis_size="{&quot;x&quot;:381,&quot;y&quot;:134,&quot;w&quot;:321,&quot;h&quot;:24,&quot;abs_x&quot;:631,&quot;abs_y&quot;:231}" className='text-left mx-2 text-sm bg-black text-white font-bold py-1 px-3 my-1 rounded-full animate-pulse">
  Pulse Animation'  >More Details</p>
                    </div>

                    <div className="card-footer p-2" bis_skin_checked={1}>

            
            <div className='flex justify-evenly'>

                      <div className="section_personal">
                      <h1 className='mx-2'>Personal Information :</h1>

                      <h5 className='px-2 text-xs mt-3'>First Name : </h5>
                      <h5 className='px-2 text-xs mt-2'>Second Name :</h5>
                      <h5 className='px-2 text-xs mt-2'>Gmail(Personal) :</h5>
                      <h5 className='px-2 text-xs mt-2'>Phone Number :</h5>
                      </div>
                      <div className="section_personal">
                      <h1 className='mx-2'>Project Information :</h1>

                      <h5 className='px-2 text-xs mt-3'>Associate ID :</h5>
                      <h5 className='px-2 text-xs mt-2'>Designaton :</h5>
                      <h5 className='px-2 text-xs mt-2'>Company Mail :</h5>
                      <h5 className='px-2 text-xs mt-2'>Business Unit :</h5>
                      <h5 className='px-2 text-xs mt-2'>Project Name :</h5>
                      <h5 className='px-2 text-xs mt-2'>Project Location :</h5>
                      </div>
            </div>


                    </div>
                  </div>

                </div>
              </div>

            </div>
            <div className="row">
              <section className="col-lg-7 connectedSortable">
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">
                      <i className="fas fa-chart-pie mr-1" />
                      Sales
                    </h3>
                    <div className="card-tools">
                      <ul className="nav nav-pills ml-auto">
                        <li className="nav-item">
                          <a className="nav-link active" href="#revenue-chart" data-toggle="tab">Area</a>
                        </li>
                        <li className="nav-item">
                          <a className="nav-link" href="#sales-chart" data-toggle="tab">Donut</a>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="tab-content p-0">
                      <div className="chart tab-pane active" id="revenue-chart" style={{ position: 'relative', height: 300 }}>
                        <canvas id="revenue-chart-canvas" height={300} style={{ height: 300 }} />
                      </div>
                      <div className="chart tab-pane" id="sales-chart" style={{ position: 'relative', height: 300 }}>
                        <canvas id="sales-chart-canvas" height={300} style={{ height: 300 }} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card direct-chat direct-chat-primary">
                  <div className="card-header">
                    <h3 className="card-title">Direct Chat</h3>
                    <div className="card-tools">
                      <span title="3 New Messages" className="badge badge-primary">3</span>
                      <button type="button" className="btn btn-tool" data-card-widget="collapse">
                        <i className="fas fa-minus" />
                      </button>
                      <button type="button" className="btn btn-tool" title="Contacts" data-widget="chat-pane-toggle">
                        <i className="fas fa-comments" />
                      </button>
                      <button type="button" className="btn btn-tool" data-card-widget="remove">
                        <i className="fas fa-times" />
                      </button>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="direct-chat-messages">
                      <div className="direct-chat-msg">
                        <div className="direct-chat-infos clearfix">
                          <span className="direct-chat-name float-left">Alexander Pierce</span>
                          <span className="direct-chat-timestamp float-right">23 Jan 2:00 pm</span>
                        </div>
                        <img className="direct-chat-img" src="dist/img/user1-128x128.jpg" alt="message user image" />
                        <div className="direct-chat-text">
                          Is this template really for free? That's unbelievable!
                        </div>
                      </div>
                      <div className="direct-chat-msg right">
                        <div className="direct-chat-infos clearfix">
                          <span className="direct-chat-name float-right">Sarah Bullock</span>
                          <span className="direct-chat-timestamp float-left">23 Jan 2:05 pm</span>
                        </div>
                        <img className="direct-chat-img" src="dist/img/user3-128x128.jpg" alt="message user image" />
                        <div className="direct-chat-text">
                          You better believe it!
                        </div>
                      </div>
                      <div className="direct-chat-msg">
                        <div className="direct-chat-infos clearfix">
                          <span className="direct-chat-name float-left">Alexander Pierce</span>
                          <span className="direct-chat-timestamp float-right">23 Jan 5:37 pm</span>
                        </div>
                        <img className="direct-chat-img" src="dist/img/user1-128x128.jpg" alt="message user image" />
                        <div className="direct-chat-text">
                          Working with AdminLTE on a great new app! Wanna join?
                        </div>
                      </div>
                      <div className="direct-chat-msg right">
                        <div className="direct-chat-infos clearfix">
                          <span className="direct-chat-name float-right">Sarah Bullock</span>
                          <span className="direct-chat-timestamp float-left">23 Jan 6:10 pm</span>
                        </div>
                        <img className="direct-chat-img" src="dist/img/user3-128x128.jpg" alt="message user image" />
                        <div className="direct-chat-text">
                          I would love to.
                        </div>
                      </div>
                    </div>
                    <div className="direct-chat-contacts">
                      <ul className="contacts-list">
                        <li>
                          <a href="#">
                            <img className="contacts-list-img" src="dist/img/user1-128x128.jpg" alt="User Avatar" />
                            <div className="contacts-list-info">
                              <span className="contacts-list-name">
                                Count Dracula
                                <small className="contacts-list-date float-right">2/28/2015</small>
                              </span>
                              <span className="contacts-list-msg">How have you been? I was...</span>
                            </div>
                          </a>
                        </li>
                        <li>
                          <a href="#">
                            <img className="contacts-list-img" src="dist/img/user7-128x128.jpg" alt="User Avatar" />
                            <div className="contacts-list-info">
                              <span className="contacts-list-name">
                                Sarah Doe
                                <small className="contacts-list-date float-right">2/23/2015</small>
                              </span>
                              <span className="contacts-list-msg">I will be waiting for...</span>
                            </div>
                          </a>
                        </li>
                        <li>
                          <a href="#">
                            <img className="contacts-list-img" src="dist/img/user3-128x128.jpg" alt="User Avatar" />
                            <div className="contacts-list-info">
                              <span className="contacts-list-name">
                                Nadia Jolie
                                <small className="contacts-list-date float-right">2/20/2015</small>
                              </span>
                              <span className="contacts-list-msg">I'll call you back at...</span>
                            </div>
                          </a>
                        </li>
                        <li>
                          <a href="#">
                            <img className="contacts-list-img" src="dist/img/user5-128x128.jpg" alt="User Avatar" />
                            <div className="contacts-list-info">
                              <span className="contacts-list-name">
                                Nora S. Vans
                                <small className="contacts-list-date float-right">2/10/2015</small>
                              </span>
                              <span className="contacts-list-msg">Where is your new...</span>
                            </div>
                          </a>
                        </li>
                        <li>
                          <a href="#">
                            <img className="contacts-list-img" src="dist/img/user6-128x128.jpg" alt="User Avatar" />
                            <div className="contacts-list-info">
                              <span className="contacts-list-name">
                                John K.
                                <small className="contacts-list-date float-right">1/27/2015</small>
                              </span>
                              <span className="contacts-list-msg">Can I take a look at...</span>
                            </div>
                          </a>
                        </li>
                        <li>
                          <a href="#">
                            <img className="contacts-list-img" src="dist/img/user8-128x128.jpg" alt="User Avatar" />
                            <div className="contacts-list-info">
                              <span className="contacts-list-name">
                                Kenneth M.
                                <small className="contacts-list-date float-right">1/4/2015</small>
                              </span>
                              <span className="contacts-list-msg">Never mind I found...</span>
                            </div>
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="card-footer">
                    <form action="#" method="post">
                      <div className="input-group">
                        <input type="text" name="message" placeholder="Type Message ..." className="form-control" />
                        <span className="input-group-append">
                          <button type="button" className="btn btn-primary">Send</button>
                        </span>
                      </div>
                    </form>
                  </div>
                </div>
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">
                      <i className="ion ion-clipboard mr-1" />
                      To Do List
                    </h3>
                    <div className="card-tools">
                      <ul className="pagination pagination-sm">
                        <li className="page-item"><a href="#" className="page-link">«</a></li>
                        <li className="page-item"><a href="#" className="page-link">1</a></li>
                        <li className="page-item"><a href="#" className="page-link">2</a></li>
                        <li className="page-item"><a href="#" className="page-link">3</a></li>
                        <li className="page-item"><a href="#" className="page-link">»</a></li>
                      </ul>
                    </div>
                  </div>
                  <div className="card-body">
                    <ul className="todo-list" data-widget="todo-list">
                      <li>
                        <span className="handle">
                          <i className="fas fa-ellipsis-v" />
                          <i className="fas fa-ellipsis-v" />
                        </span>
                        <div className="icheck-primary d-inline ml-2">
                          <input type="checkbox" defaultValue name="todo1" id="todoCheck1" />
                          <label htmlFor="todoCheck1" />
                        </div>
                        <span className="text">Design a nice theme</span>
                        <small className="badge badge-danger"><i className="far fa-clock" /> 2 mins</small>
                        <div className="tools">
                          <i className="fas fa-edit" />
                          <i className="fas fa-trash-o" />
                        </div>
                      </li>
                      <li>
                        <span className="handle">
                          <i className="fas fa-ellipsis-v" />
                          <i className="fas fa-ellipsis-v" />
                        </span>
                        <div className="icheck-primary d-inline ml-2">
                          <input type="checkbox" defaultValue name="todo2" id="todoCheck2" defaultChecked />
                          <label htmlFor="todoCheck2" />
                        </div>
                        <span className="text">Make the theme responsive</span>
                        <small className="badge badge-info"><i className="far fa-clock" /> 4 hours</small>
                        <div className="tools">
                          <i className="fas fa-edit" />
                          <i className="fas fa-trash-o" />
                        </div>
                      </li>
                      <li>
                        <span className="handle">
                          <i className="fas fa-ellipsis-v" />
                          <i className="fas fa-ellipsis-v" />
                        </span>
                        <div className="icheck-primary d-inline ml-2">
                          <input type="checkbox" defaultValue name="todo3" id="todoCheck3" />
                          <label htmlFor="todoCheck3" />
                        </div>
                        <span className="text">Let theme shine like a star</span>
                        <small className="badge badge-warning"><i className="far fa-clock" /> 1 day</small>
                        <div className="tools">
                          <i className="fas fa-edit" />
                          <i className="fas fa-trash-o" />
                        </div>
                      </li>
                      <li>
                        <span className="handle">
                          <i className="fas fa-ellipsis-v" />
                          <i className="fas fa-ellipsis-v" />
                        </span>
                        <div className="icheck-primary d-inline ml-2">
                          <input type="checkbox" defaultValue name="todo4" id="todoCheck4" />
                          <label htmlFor="todoCheck4" />
                        </div>
                        <span className="text">Let theme shine like a star</span>
                        <small className="badge badge-success"><i className="far fa-clock" /> 3 days</small>
                        <div className="tools">
                          <i className="fas fa-edit" />
                          <i className="fas fa-trash-o" />
                        </div>
                      </li>
                      <li>
                        <span className="handle">
                          <i className="fas fa-ellipsis-v" />
                          <i className="fas fa-ellipsis-v" />
                        </span>
                        <div className="icheck-primary d-inline ml-2">
                          <input type="checkbox" defaultValue name="todo5" id="todoCheck5" />
                          <label htmlFor="todoCheck5" />
                        </div>
                        <span className="text">Check your messages and notifications</span>
                        <small className="badge badge-primary"><i className="far fa-clock" /> 1 week</small>
                        <div className="tools">
                          <i className="fas fa-edit" />
                          <i className="fas fa-trash-o" />
                        </div>
                      </li>
                      <li>
                        <span className="handle">
                          <i className="fas fa-ellipsis-v" />
                          <i className="fas fa-ellipsis-v" />
                        </span>
                        <div className="icheck-primary d-inline ml-2">
                          <input type="checkbox" defaultValue name="todo6" id="todoCheck6" />
                          <label htmlFor="todoCheck6" />
                        </div>
                        <span className="text">Let theme shine like a star</span>
                        <small className="badge badge-secondary"><i className="far fa-clock" /> 1 month</small>
                        <div className="tools">
                          <i className="fas fa-edit" />
                          <i className="fas fa-trash-o" />
                        </div>
                      </li>
                    </ul>
                  </div>
                  <div className="card-footer clearfix">
                    <button type="button" className="btn btn-primary float-right"><i className="fas fa-plus" /> Add item</button>
                  </div>
                </div>
              </section>
              <section className="col-lg-5 connectedSortable">
                <div className="card bg-gradient-primary">
                  <div className="card-header border-0">
                    <h3 className="card-title">
                      <i className="fas fa-map-marker-alt mr-1" />
                      Visitors
                    </h3>
                    <div className="card-tools">
                      <button type="button" className="btn btn-primary btn-sm daterange" title="Date range">
                        <i className="far fa-calendar-alt" />
                      </button>
                      <button type="button" className="btn btn-primary btn-sm" data-card-widget="collapse" title="Collapse">
                        <i className="fas fa-minus" />
                      </button>
                    </div>
                  </div>
                  <div className="card-body">
                    <div id="world-map" style={{ height: 250, width: '100%' }} />
                  </div>
                  <div className="card-footer bg-transparent">
                    <div className="row">
                      <div className="col-4 text-center">
                        <div id="sparkline-1" />
                        <div className="text-white">Visitors</div>
                      </div>
                      <div className="col-4 text-center">
                        <div id="sparkline-2" />
                        <div className="text-white">Online</div>
                      </div>
                      <div className="col-4 text-center">
                        <div id="sparkline-3" />
                        <div className="text-white">Sales</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card bg-gradient-info">
                  <div className="card-header border-0">
                    <h3 className="card-title">
                      <i className="fas fa-th mr-1" />
                      Sales Graph
                    </h3>
                    <div className="card-tools">
                      <button type="button" className="btn bg-info btn-sm" data-card-widget="collapse">
                        <i className="fas fa-minus" />
                      </button>
                      <button type="button" className="btn bg-info btn-sm" data-card-widget="remove">
                        <i className="fas fa-times" />
                      </button>
                    </div>
                  </div>
                  <div className="card-body">
                    <canvas className="chart" id="line-chart" style={{ minHeight: 250, height: 250, maxHeight: 250, maxWidth: '100%' }} />
                  </div>
                  <div className="card-footer bg-transparent">
                    <div className="row">
                      <div className="col-4 text-center">
                        <input type="text" className="knob" data-readonly="true" defaultValue={20} data-width={60} data-height={60} data-fgcolor="#39CCCC" />
                        <div className="text-white">Mail-Orders</div>
                      </div>
                      <div className="col-4 text-center">
                        <input type="text" className="knob" data-readonly="true" defaultValue={50} data-width={60} data-height={60} data-fgcolor="#39CCCC" />
                        <div className="text-white">Online</div>
                      </div>
                      <div className="col-4 text-center">
                        <input type="text" className="knob" data-readonly="true" defaultValue={30} data-width={60} data-height={60} data-fgcolor="#39CCCC" />
                        <div className="text-white">In-Store</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card bg-gradient-success">
                  <div className="card-header border-0">
                    <h3 className="card-title">
                      <i className="far fa-calendar-alt" />
                      Calendar
                    </h3>
                    <div className="card-tools">
                      <div className="btn-group">
                        <button type="button" className="btn btn-success btn-sm dropdown-toggle" data-toggle="dropdown" data-offset={-52}>
                          <i className="fas fa-bars" />
                        </button>
                        <div className="dropdown-menu" role="menu">
                          <a href="#" className="dropdown-item">Add new event</a>
                          <a href="#" className="dropdown-item">Clear events</a>
                          <div className="dropdown-divider" />
                          <a href="#" className="dropdown-item">View calendar</a>
                        </div>
                      </div>
                      <button type="button" className="btn btn-success btn-sm" data-card-widget="collapse">
                        <i className="fas fa-minus" />
                      </button>
                      <button type="button" className="btn btn-success btn-sm" data-card-widget="remove">
                        <i className="fas fa-times" />
                      </button>
                    </div>
                  </div>
                  <div className="card-body pt-0">
                    <div id="calendar" style={{ width: '100%' }} />
                  </div>
                </div>
              </section>
            </div>
          </div>
        </section>
      </div>


    </>
  )
}

export default Dashboard