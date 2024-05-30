import React, { useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import enUS from 'date-fns/locale/en-US';
import Modal from './Modal'; // Assume you have a Modal component for inputs
import Header from '../Homepage Components/Header';
import Sidemenu from '../Homepage Components/Sidemenu';
import Footer from '../Homepage Components/Footer';

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

const MyCalendar = () => {
  const [events, setEvents] = useState([
    // Existing events
  ]);
  const [newEvent, setNewEvent] = useState({});
  const [showModal, setShowModal] = useState(false);

  const handleSelectSlot = ({ start, end }) => {
    const title = window.prompt('New Event Name');
    if (title) {
      const newEvent = { id: events.length + 1, title, start, end };
      setEvents([...events, newEvent]);
    }
  };

  const handleEventClick = event => {
    alert('Event: ' + event.title);
  };

  return (
    <>
    <Header/>
    <Sidemenu/>
    <div style={{ height: '500px',width:'900px' }} className='content-wrapper'>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%', margin: '50px' }}
        onSelectEvent={handleEventClick}
        onSelectSlot={handleSelectSlot}
        selectable
      />
      {showModal && (
        <Modal
          event={newEvent}
          onSave={(eventDetails) => {
            setEvents([...events, eventDetails]);
            setShowModal(false);
          }}
          onCancel={() => setShowModal(false)}
        />
      )}
    </div>
    <Footer/>

    </>
  );
};

export default MyCalendar;
