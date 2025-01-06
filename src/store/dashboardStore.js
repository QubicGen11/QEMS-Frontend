import { create } from 'zustand';
import axios from 'axios';
import config from '../Components/config';

const useDashboardStore = create((set, get) => ({
  // State
  employee: null,
  clockStatus: {
    isClockedIn: false,
    clockInTime: null,
    clockOutTime: null,
  },
  reports: {
    todayReport: null,
    history: [],
  },
  attendance: [],
  timesheet: [],
  isLoading: {
    employee: false,
    clock: false,
    reports: false,
    attendance: false,
  },
  errors: {},

  // Clock Actions
  clockIn: async (email) => {
    set(state => ({ isLoading: { ...state.isLoading, clock: true }}));
    try {
      const response = await axios.post(`${config.apiUrl}/qubinest/clockin`, { email });
      set(state => ({
        clockStatus: {
          ...state.clockStatus,
          isClockedIn: true,
          clockInTime: new Date(),
        }
      }));
    } catch (error) {
      set(state => ({ errors: { ...state.errors, clock: error.message }}));
    } finally {
      set(state => ({ isLoading: { ...state.isLoading, clock: false }}));
    }
  },

  clockOut: async (email) => {
    set(state => ({ isLoading: { ...state.isLoading, clock: true }}));
    try {
      const response = await axios.post(`${config.apiUrl}/qubinest/clockout`, { email });
      set(state => ({
        clockStatus: {
          ...state.clockStatus,
          isClockedIn: false,
          clockOutTime: new Date(),
        }
      }));
    } catch (error) {
      set(state => ({ errors: { ...state.errors, clock: error.message }}));
    } finally {
      set(state => ({ isLoading: { ...state.isLoading, clock: false }}));
    }
  },

  getClockStatus: async (email) => {
    try {
      const response = await axios.get(`${config.apiUrl}/qubinest/clockstatus/${email}`);
      set({ clockStatus: response.data });
    } catch (error) {
      set(state => ({ errors: { ...state.errors, clockStatus: error.message }}));
    }
  },

  // Report Actions
  submitDailyReport: async (email, reportContent) => {
    set(state => ({ isLoading: { ...state.isLoading, reports: true }}));
    try {
      const response = await axios.post(`${config.apiUrl}/qubinest/submitreport`, {
        email,
        reportContent,
        date: new Date().toISOString()
      });
      // Update reports state after submission
      get().fetchReportHistory(email);
    } catch (error) {
      set(state => ({ errors: { ...state.errors, reports: error.message }}));
    } finally {
      set(state => ({ isLoading: { ...state.isLoading, reports: false }}));
    }
  },

  checkReportStatus: async (email) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await axios.get(`${config.apiUrl}/qubinest/reportstatus/${email}/${today}`);
      set(state => ({
        reports: {
          ...state.reports,
          todayReport: response.data
        }
      }));
    } catch (error) {
      set(state => ({ errors: { ...state.errors, reportStatus: error.message }}));
    }
  },

  fetchReportHistory: async (email) => {
    set(state => ({ isLoading: { ...state.isLoading, reports: true }}));
    try {
      const response = await axios.get(`${config.apiUrl}/qubinest/reports/${email}`);
      set(state => ({
        reports: {
          ...state.reports,
          history: response.data
        }
      }));
    } catch (error) {
      set(state => ({ errors: { ...state.errors, reportHistory: error.message }}));
    } finally {
      set(state => ({ isLoading: { ...state.isLoading, reports: false }}));
    }
  },

  // Attendance Actions
  fetchAttendance: async (email) => {
    set(state => ({ isLoading: { ...state.isLoading, attendance: true }}));
    try {
      const response = await axios.get(`${config.apiUrl}/qubinest/attendance/${email}`);
      set({ attendance: response.data });
    } catch (error) {
      set(state => ({ errors: { ...state.errors, attendance: error.message }}));
    } finally {
      set(state => ({ isLoading: { ...state.isLoading, attendance: false }}));
    }
  },

  fetchTimesheet: async (email) => {
    try {
      const response = await axios.get(`${config.apiUrl}/qubinest/timesheets/${email}`);
      set({ timesheet: response.data });
    } catch (error) {
      set(state => ({ errors: { ...state.errors, timesheet: error.message }}));
    }
  },

  // Employee Data Actions
  fetchEmployeeDetails: async (email) => {
    set(state => ({ isLoading: { ...state.isLoading, employee: true }}));
    try {
      const [employeeResponse, profileResponse] = await Promise.all([
        axios.get(`${config.apiUrl}/qubinest/employee/${email}`),
        axios.get(`${config.apiUrl}/qubinest/profile/${email}`)
      ]);
      
      set({ 
        employee: {
          ...employeeResponse.data,
          profile: profileResponse.data
        }
      });
    } catch (error) {
      set(state => ({ errors: { ...state.errors, employee: error.message }}));
    } finally {
      set(state => ({ isLoading: { ...state.isLoading, employee: false }}));
    }
  },

  // Initialize Dashboard
  initializeDashboard: async (email) => {
    try {
      await Promise.all([
        get().fetchEmployeeDetails(email),
        get().getClockStatus(email),
        get().checkReportStatus(email),
        get().fetchAttendance(email),
        get().fetchTimesheet(email),
        get().fetchReportHistory(email)
      ]);
    } catch (error) {
      console.error('Dashboard initialization error:', error);
    }
  },

  // Clear Store
  clearStore: () => {
    set({
      employee: null,
      clockStatus: {
        isClockedIn: false,
        clockInTime: null,
        clockOutTime: null,
      },
      reports: {
        todayReport: null,
        history: [],
      },
      attendance: [],
      timesheet: [],
      isLoading: {
        employee: false,
        clock: false,
        reports: false,
        attendance: false,
      },
      errors: {},
    });
  },
}));

export default useDashboardStore;