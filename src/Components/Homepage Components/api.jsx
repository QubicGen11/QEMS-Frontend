// api.js
import axios from 'axios';
import config from '../config';

export const fetchAttendanceData = async (email) => {
  try {
    const response = await axios.get(`${config.apiUrl}/qubinest/attendance/${email}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching attendance data:', error);
    throw error;
  }
};
