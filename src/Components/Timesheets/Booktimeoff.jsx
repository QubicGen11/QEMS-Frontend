import React, { useState, useEffect } from 'react';
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
import axios from 'axios';
import "./Booktimeoff.css";

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
  const [holidays, setHolidays] = useState([]);
  const [error, setError] = useState(null);

  const API_KEY = 'AIzaSyATDBo4fInPRHA6uwq__gdi1eIoM6AcVFQ';
  const CALENDAR_ID = 'en.indian#holiday@group.v.calendar.google.com';

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const now = new Date();
        const oneYearLater = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
        const response = await axios.get(
          `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events?key=${API_KEY}&timeMin=${now.toISOString()}&timeMax=${oneYearLater.toISOString()}`
        );
        console.log('Full API Response:', response.data); // Log the full API response
        if (response.data.items && response.data.items.length > 0) {
          const holidayEvents = response.data.items.map(holiday => ({
            id: holiday.id,
            title: holiday.summary,
            start: new Date(holiday.start.date || holiday.start.dateTime),
            end: new Date(holiday.end.date || holiday.end.dateTime),
          }));
          console.log('Mapped Holiday Events:', holidayEvents); // Log the mapped holiday events
          setHolidays(holidayEvents);
          setEvents(prevEvents => [...prevEvents, ...holidayEvents]);
        } else {
          console.log('No events found in the calendar');
        }
      } catch (error) {
        console.error('Error fetching holidays:', error); // Log the error
        setError('Failed to fetch holidays. Please check your API key and calendar ID.');
      }
    };

    fetchHolidays();
  }, []);

  const handleSelectSlot = ({ start, end }) => {
    setNewEvent({ ...newEvent, start, end });
    setShowModal(true);
  };

  const handleEventClick = event => {
    alert('Event: ' + event.title);
  };

  const handleSave = () => {
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
              <div style={{ height: '500px', width: '900px' }} className='content-wrapper bg-white ' id='divmain'>
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
            <div className="col-12 col-md-12 col-lg-12 col-xl-12 ">
              <div className='content-wrapper mt-14 bg-white w-auto'>
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
                    {error ? (
                      <div>{error}</div>
                    ) : (
                      <ul className="products-list product-list-in-card pl-2 pr-2">
                        {holidays.map(holiday => (
                          <li className="item" key={holiday.id}>
                            <div className="product-img">
                              {new Date(holiday.start).toDateString()}
                            </div>
                            <div className="product-info">
                              {holiday.title}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
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