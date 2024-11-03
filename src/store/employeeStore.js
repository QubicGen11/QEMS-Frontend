import { create } from 'zustand';
import axios from 'axios';
import config from '../Components/config';


const useEmployeeStore = create((set, get) => ({
  employeeData: null,
  isLoading: false,
  error: null,

  setEmployeeData: (data) => {
    set({ employeeData: data });
    localStorage.setItem('employeeInfo', JSON.stringify(data));
  },

  updateEmployeeData: async (email) => {
    try {
      const response = await axios.get(`${config.apiUrl}/qubinest/getemployees/${email}`);
      const data = response.data;
      
      // Ensure image URL exists
      if (!data.employeeImg) {
        data.employeeImg = 'https://res.cloudinary.com/defsu5bfc/image/upload/v1717093278/facebook_images_f7am6j.webp';
      }
      
      set({ employeeData: data });
      localStorage.setItem('employeeInfo', JSON.stringify(data));
      
      return data;
    } catch (error) {
      console.error('Error updating employee data:', error);
      throw error;
    }
  },

  forceRefresh: async (email) => {
    try {
      // Clear cache first
      localStorage.removeItem('employeeData');
      localStorage.removeItem('employeeInfo');
      
      // Fetch fresh data
      return await get().updateEmployeeData(email);
    } catch (error) {
      console.error('Error forcing refresh:', error);
      throw error;
    }
  }
}));

export default useEmployeeStore;