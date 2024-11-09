import { create } from 'zustand';
import axios from 'axios';
import config from '../Components/config';

const useEmployeeStore = create((set, get) => ({
  employeeData: null,
  isLoading: false,
  error: null,
  lastFetched: null,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes

  updateEmployeeData: async (email) => {
    if (!email) return;

    const currentTime = Date.now();
    const store = get();
    
    // If data exists and cache is still valid, return existing data
    if (store.employeeData && 
        store.lastFetched && 
        currentTime - store.lastFetched < store.CACHE_DURATION) {
      return store.employeeData;
    }

    try {
      set({ isLoading: true });
      const response = await axios.get(
        `${config.apiUrl}/qubinest/getemployees/${email}`,
        { withCredentials: true }
      );
      
      const data = response.data;
      if (!data.employeeImg) {
        data.employeeImg = 'https://res.cloudinary.com/defsu5bfc/image/upload/v1717093278/facebook_images_f7am6j.webp';
      }

      set({ 
        employeeData: data,
        lastFetched: currentTime,
        isLoading: false,
        error: null
      });
      
      return data;
    } catch (error) {
      set({ 
        error: error.message,
        isLoading: false 
      });
      throw error;
    }
  },

  // Method to force refresh data
  forceRefresh: async (email) => {
    set({ lastFetched: null });
    return get().updateEmployeeData(email);
  },

  clearStore: () => {
    set({ 
      employeeData: null,
      lastFetched: null,
      isLoading: false,
      error: null 
    });
  }
}));

export default useEmployeeStore;