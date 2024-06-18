import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Holidays = () => {
  const [holidays, setHolidays] = useState([]);
  const [error, setError] = useState(null);
  const API_KEY = 'AIzaSyATDBo4fInPRHA6uwq__gdi1eIoM6AcVFQ';
  const CALENDAR_ID = 'en.usa#holiday@group.v.calendar.google.com';

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const response = await axios.get(
          `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events?key=${API_KEY}`
        );
        setHolidays(response.data.items);
      } catch (error) {
        console.error('Error fetching holidays', error);
        setError('Failed to fetch holidays. Please check your API key and calendar ID.');
      }
    };

    fetchHolidays();
  }, []);

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h1>Holiday Lists</h1>
      <ul>
        {holidays.map(holiday => (
          <li key={holiday.id}>
            {holiday.summary} - {new Date(holiday.start.date || holiday.start.dateTime).toDateString()}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Holidays;
