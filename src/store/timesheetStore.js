import { create } from 'zustand';
import axios from 'axios';
import config from '../Components/config';


const useTimesheetStore = create((set, get) => ({
  timesheets: [],
  isLoading: false,
  error: null,
  currentPage: 1,
  pageSize: 20,
  
  // Actions
  setCurrentPage: (page) => set({ currentPage: page }),
  
  fetchTimesheets: async (email) => {
    // Check if we already have data
    if (get().timesheets.length > 0) {
      return;
    }

    set({ isLoading: true, error: null });
    
    try {
      const response = await axios.get(
        `${config.apiUrl}/qubinest/attendance/${email}`,
        {
          withCredentials: true,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );
      
      set({ 
        timesheets: response.data,
        isLoading: false 
      });
    } catch (error) {
      console.error('Fetch error:', error);
      set({ 
        error: 'Failed to load timesheets',
        isLoading: false 
      });
    }
  },

  refreshTimesheets: async (email) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await axios.get(
        `${config.apiUrl}/qubinest/attendance/${email}`,
        {
          withCredentials: true,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );
      
      set({ 
        timesheets: response.data,
        isLoading: false 
      });
    } catch (error) {
      console.error('Refresh error:', error);
      set({ 
        error: 'Failed to refresh timesheets',
        isLoading: false 
      });
    }
  },

  getPaginatedData: () => {
    const { timesheets, currentPage, pageSize } = get();
    const startIndex = (currentPage - 1) * pageSize;
    return timesheets.slice(startIndex, startIndex + pageSize);
  },

  getTotalPages: () => {
    const { timesheets, pageSize } = get();
    return Math.ceil(timesheets.length / pageSize);
  }
}));

export default useTimesheetStore; 