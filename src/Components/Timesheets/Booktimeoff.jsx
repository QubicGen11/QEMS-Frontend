import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { 
  Box, 
  Card, 
  Grid,
  Typography, 
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Chip,
  Divider
} from '@mui/material';
import { 
  Close as CloseIcon,
  Event as EventIcon,
  Today as TodayIcon,
  NavigateNext as NavigateNextIcon,
  NavigateBefore as NavigateBeforeIcon
} from '@mui/icons-material';
import "./Booktimeoff.css";
import Header from '../Homepage Components/Header';
import Sidemenu from '../Homepage Components/Sidemenu';
import Footer from '../Homepage Components/Footer';
import axios from 'axios';
import Cookies from 'js-cookie';
import config from '../config';

const Booktimeoff = () => {
  const formatDate = (date) => {
    if (!date) return null;
    return new Date(date).toISOString();
  };

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [holidays, setHolidays] = useState([]);
  const [error, setError] = useState(null);
  const email = Cookies.get('email');
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    dayType: 'full',
    reason: '',
    comments: '',
    
    document: null,
  });
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null
  });

  const API_KEY = 'AIzaSyATDBo4fInPRHA6uwq__gdi1eIoM6AcVFQ';
  const CALENDAR_ID = 'en.indian#holiday@group.v.calendar.google.com';

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    try {
      const now = new Date();
      const oneYearLater = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
      const response = await axios.get(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events?key=${API_KEY}&timeMin=${now.toISOString()}&timeMax=${oneYearLater.toISOString()}`
      );
      if (response.data.items?.length > 0) {
        const holidayEvents = response.data.items.map(holiday => ({
          id: holiday.id,
          title: holiday.summary,
          date: new Date(holiday.start.date || holiday.start.dateTime),
        }));
        setHolidays(holidayEvents);
      }
    } catch (error) {
      setError('Failed to fetch holidays');
    }
  };

  const handleDateClick = (date) => {
    if (!dateRange.startDate) {
      setDateRange({ startDate: date, endDate: null });
    } else if (!dateRange.endDate) {
      if (date >= dateRange.startDate) {
        setDateRange(prev => ({ ...prev, endDate: date }));
        setShowModal(true);
        setFormData(prev => ({
          ...prev,
          startDate: dateRange.startDate,
          endDate: date
        }));
      } else {
        setDateRange({ startDate: date, endDate: null });
      }
    } else {
      setDateRange({ startDate: date, endDate: null });
    }
  };

  const handleSubmit = async () => {
    if (!dateRange.startDate || !dateRange.endDate || !formData.type || !formData.reason) {
      setError('Please fill in all required fields');
      return;
    }

    const payload = {
      companyEmail: email,
      leaveType: formData.type,
      duration: formData.dayType,
      reason: formData.reason,
      startDate: formatDate(dateRange.startDate),
      endDate: formatDate(dateRange.endDate),
      comments: formData.comments || '',
      document: formData.document || null,
    };

    try {
      console.log('Submitting payload:', payload);
      const response = await axios.post(`${config.apiUrl}/qubinest/newleaverequest`, payload);
      
      if (response.data.leaveRequest) {
        setEvents(prevEvents => [...prevEvents, {
          id: response.data.leaveRequest.leave_id,
          title: formData.type || 'Leave Request',
          date: new Date(response.data.leaveRequest.startDate),
          startDate: new Date(response.data.leaveRequest.startDate),
          endDate: new Date(response.data.leaveRequest.endDate),
          status: response.data.leaveRequest.status,
          ...formData
        }]);

        setShowModal(false);
        setFormData({
          title: '',
          type: '',
          dayType: 'full',
          reason: '',
          comments: '',
          document: null,
        });
        setDateRange({ startDate: null, endDate: null });
      }
    } catch (error) {
      console.error('Error details:', error.response?.data);
      setError(error.response?.data || 'Failed to submit leave request');
    }
  };

  const formatDisplayDate = (date) => {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0];
  };

  const tileContent = ({ date }) => {
    const dateStr = date.toISOString().split('T')[0];
    
    const eventForDate = events.find(event => {
      const startStr = new Date(event.startDate).toISOString().split('T')[0];
      const endStr = new Date(event.endDate).toISOString().split('T')[0];
      return dateStr >= startStr && dateStr <= endStr;
    });

    const holidayForDate = holidays.some(holiday => 
      holiday.date.toISOString().split('T')[0] === dateStr
    );

    if (eventForDate) {
      return (
        <div className="leave-indicator">
          <div className={`dot event ${eventForDate.status}`} />
          <div className="leave-type">{eventForDate.type || eventForDate.leaveType}</div>
        </div>
      );
    }

    if (holidayForDate) {
      return <div className="dot holiday" />;
    }

    return null;
  };

  const tileClassName = ({ date }) => {
    const dateStr = date.toISOString().split('T')[0];
    const classes = [];

    if (dateRange.startDate && dateRange.endDate) {
      const startStr = dateRange.startDate.toISOString().split('T')[0];
      const endStr = dateRange.endDate.toISOString().split('T')[0];
      if (dateStr >= startStr && dateStr <= endStr) {
        classes.push('highlight-range');
      }
    }

    const hasEvent = events.some(event => {
      const eventStartStr = new Date(event.startDate).toISOString().split('T')[0];
      const eventEndStr = new Date(event.endDate).toISOString().split('T')[0];
      return dateStr >= eventStartStr && dateStr <= eventEndStr;
    });

    if (hasEvent) {
      classes.push('has-event');
    }

    return classes.join(' ');
  };

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        const response = await axios.get(`${config.apiUrl}/qubinest/getleaverequests/${encodeURIComponent(email)}`);
        if (response.data) {
          const formattedEvents = response.data.map(leave => ({
            id: leave.leave_id,
            type: leave.leaveType,
            title: `${leave.leaveType} Leave`,
            startDate: new Date(leave.startDate),
            endDate: new Date(leave.endDate),
            status: leave.status,
            reason: leave.reason
          }));
          setEvents(formattedEvents);
        }
      } catch (error) {
        console.error('Error fetching leave requests:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        setError(`Failed to fetch leave requests: ${error.message}`);
      }
    };

    if (email) {
      fetchLeaveRequests();
    }
  }, [email]);

  return (
    <>
      <Header />
      <Sidemenu />
      <Box className="content-wrapper" sx={{ p: 3, backgroundColor: '#f4f6f9' }}>
        <Grid container spacing={3}>
          {/* Calendar Section */}
          <Grid item xs={12} md={8}>
            <Card 
              elevation={3}
              sx={{
                p: 3,
                height: '100%',
                borderRadius: 2,
                backgroundColor: '#fff'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#1976d2' }}>
                  <EventIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Book Time Off
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<TodayIcon />}
                  onClick={() => setSelectedDate(new Date())}
                >
                  Today
                </Button>
              </Box>
              
              <Paper 
                elevation={0}
                sx={{ 
                  p: 2, 
                  backgroundColor: '#f8fafc',
                  borderRadius: 2
                }}
              >
                <Calendar
                  onChange={handleDateClick}
                  value={selectedDate}
                  tileContent={tileContent}
                  tileClassName={tileClassName}
                  className="custom-calendar"
                  nextLabel={<NavigateNextIcon />}
                  prevLabel={<NavigateBeforeIcon />}
                  navigationLabel={({ date }) => (
                    <Typography variant="h6" sx={{ fontWeight: 500 }}>
                      {date.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </Typography>
                  )}
                />
              </Paper>
            </Card>
          </Grid>

          {/* Holiday List Section */}
          <Grid item xs={12} md={4}>
            <Card 
              elevation={3}
              sx={{
                height: '100%',
                borderRadius: 2,
                backgroundColor: '#fff'
              }}
            >
              <Box sx={{ 
                p: 2, 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #eee'
              }}>
                <Typography variant="h6" sx={{ fontWeight: 500 }}>
                  Holiday List
                </Typography>
                <IconButton size="small">
                  <CloseIcon />
                </IconButton>
              </Box>
              
              <Box sx={{ p: 2, maxHeight: '600px', overflowY: 'auto' }}>
                {error ? (
                  <Typography color="error">{error}</Typography>
                ) : (
                  holidays.map(holiday => (
                    <Box 
                      key={holiday.id}
                      sx={{
                        mb: 2,
                        p: 2,
                        borderRadius: 1,
                        backgroundColor: '#f8fafc',
                        '&:hover': {
                          backgroundColor: '#f0f4f8'
                        }
                      }}
                    >
                      <Chip
                        label={new Date(holiday.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                        color="primary"
                        size="small"
                        sx={{ mb: 1 }}
                      />
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        {holiday.title}
                      </Typography>
                    </Box>
                  ))
                )}
              </Box>
            </Card>
          </Grid>
        </Grid>

        {/* Leave Request Modal */}
        <Dialog 
          open={showModal} 
          onClose={() => setShowModal(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            elevation: 0,
            sx: {
              borderRadius: 2
            }
          }}
        >
          <DialogTitle sx={{ 
            borderBottom: '1px solid #eee',
            backgroundColor: '#f8fafc'
          }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="h6">Request Leave</Typography>
              <IconButton onClick={() => setShowModal(false)} size="small">
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          
          <DialogContent sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  required
                  label="From Date"
                  type="date"
                  value={formatDisplayDate(dateRange.startDate)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  onChange={(e) => {
                    const date = new Date(e.target.value);
                    setDateRange(prev => ({ ...prev, startDate: date }));
                  }}
                />
              </Grid>
              
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  required
                  label="To Date"
                  type="date"
                  value={formatDisplayDate(dateRange.endDate)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  onChange={(e) => {
                    const date = new Date(e.target.value);
                    setDateRange(prev => ({ ...prev, endDate: date }));
                  }}
                  inputProps={{
                    min: formatDisplayDate(dateRange.startDate)
                  }}
                />
              </Grid>

              {dateRange.endDate && dateRange.startDate > dateRange.endDate && (
                <Grid item xs={12}>
                  <Typography color="error">
                    End date cannot be before start date
                  </Typography>
                </Grid>
              )}

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Leave Type</InputLabel>
                  <Select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    label="Leave Type"
                  >
                    <MenuItem value="vacation">Vacation Leave</MenuItem>
                    <MenuItem value="sick">Sick Leave</MenuItem>
                    <MenuItem value="personal">Personal Leave</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Duration</InputLabel>
                  <Select
                    value={formData.dayType}
                    onChange={(e) => setFormData({ ...formData, dayType: e.target.value })}
                    label="Duration"
                  >
                    <MenuItem value="full">Full Day</MenuItem>
                    <MenuItem value="half">Half Day</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Reason"
                  multiline
                  rows={2}
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Comments"
                  multiline
                  rows={2}
                  value={formData.comments}
                  onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  startIcon={<EventIcon />}
                >
                  Upload Document
                  <input
                    type="file"
                    hidden
                    onChange={(e) => setFormData({ ...formData, document: e.target.files[0] })}
                  />
                </Button>
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ p: 2, borderTop: '1px solid #eee' }}>
            <Button onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained" 
              color="primary"
              startIcon={<EventIcon />}
            >
              Submit Request
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
      <Footer />
    </>
  );
};

export default Booktimeoff;
