import React, { useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import enUS from 'date-fns/locale/en-US';
import Modal from './Modal';
import Header from '../Homepage Components/Header';
import Sidemenu from '../Homepage Components/Sidemenu';
import Footer from '../Homepage Components/Footer';
import "./Booktimeoff.css"


const Holidaylist = [
  {"date": "2024-01-14", "name": "Makar Sankranti"},
  {"date": "2024-01-26", "name": "Republic Day"},
  {"date": "2024-04-10", "name": "Ugadi"},
  {"date": "2024-05-01", "name": "Labour Day"},
  {"date": "2024-05-10", "name": "Ramzan (Eid-ul-Fitr)"},
  {"date": "2024-08-15", "name": "Independence Day"},
  {"date": "2024-08-28", "name": "Krishna Janmashtami"},
  {"date": "2024-10-02", "name": "Gandhi Jayanti"},
  {"date": "2024-10-08", "name": "Bakrid (Eid-ul-Adha)"},
  {"date": "2024-10-12", "name": "Dussehra"},
  {"date": "2024-11-02", "name": "Deepavali"},
  {"date": "2024-12-25", "name": "Christmas"}
]

const locales = {
  'en-US': enUS,
};
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const Booktimeoff = () => {
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({
    title: '',
    start: '',
    end: '',
    type: '',
    dayType: 'full',
    reason: '',
    comments: '',
    document: null,
  });
  const [showModal, setShowModal] = useState(false);

  const handleSelectSlot = ({ start, end }) => {
    setNewEvent({ ...newEvent, start, end });
    setShowModal(true);
  };

  const handleEventClick = event => {
    alert('Event: ' + event.title);
  };

  const handleSave = () => {
    // Include reason in the event title
    const eventWithReason = {
      ...newEvent,
      title: `${newEvent.title} (${newEvent.reason})`,
    };
    setEvents([...events, eventWithReason]);
    setShowModal(false);
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setNewEvent(prevEvent => ({ ...prevEvent, [name]: value }));
  };

  const handleDateChange = (date, field) => {
    setNewEvent(prevEvent => ({ ...prevEvent, [field]: date }));
  };

  const handleFileChange = e => {
    setNewEvent(prevEvent => ({ ...prevEvent, document: e.target.files[0] }));
  };

  const handleRadioChange = e => {
    setNewEvent(prevEvent => ({ ...prevEvent, dayType: e.target.value }));
  };

  const eventRenderer = ({ event }) => (
    <span>
      <strong>{event.title}</strong>
      {event.reason && `: ${event.reason}`}
    </span>
  );

  return (
    <>
      <Header />
      <Sidemenu />


      <div className='content wrapper'>
        <div className="container text-center">
          <div className="row ">
            <div className="col-12 col-md-12 col-lg-12 col-xl-6" id='booktimenew'>
          <h1 className='text-xl '>Book Time Off</h1>
          <br />

              <div style={{ height: '500px', width: '740px' }} className='content-wrapper bg-white ' id='divmain'>
                <Calendar
                  localizer={localizer}
                  events={events}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: '100%', width: '100%', margin: '0 auto' }}
                                    onSelectEvent={handleEventClick}
                  onSelectSlot={handleSelectSlot}
                  selectable
                  components={{
                    event: eventRenderer,
                  }}
                />
              </div>

              {showModal && (
                <Modal
                  event={newEvent}
                  onSave={handleSave}
                  onCancel={() => setShowModal(false)}
                  onChange={handleChange}
                  onDateChange={handleDateChange}
                  onFileChange={handleFileChange}
                  onRadioChange={handleRadioChange}
                />
              )}
            </div>


            <div className="col-12 col-md-12 col-lg-12 col-xl-6 ">
              <div  className='content-wrapper mt-14 bg-white w-96'>
              <div className="card">
    <div className="card-header">
      <h3 className="card-title">Holiday List</h3>
      <div className="card-tools">
        <button
          type="button"
          className="btn btn-tool"
          data-card-widget="collapse"
        >
          <i className="fas fa-minus" />
        </button>
        <button type="button" className="btn btn-tool" data-card-widget="remove">
          <i className="fas fa-times" />
        </button>
      </div>
    </div>
    <div className="card-body p-0">
      <ul className="products-list product-list-in-card pl-2 pr-2">
    

{Holidaylist.map(item => (
        <li className="item">
        <div className="product-img">
          {item.date}
        </div>
        <div className="product-info">
         {item.name}
         
        </div>
      </li>
      ))}
      
      
      </ul>
    </div>

  </div>


                </div>
        
            </div>

          </div>



        </div>






        
      </div>
      

      


      <Footer />
    </>
  );
};

export default Booktimeoff;
