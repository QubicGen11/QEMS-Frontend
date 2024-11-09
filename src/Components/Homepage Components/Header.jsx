import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Divider,
  Modal,
  ListItemIcon
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import config from "../config"; // Import the config file
import { useUser } from '../context/UserContext';
import Cookies from 'js-cookie';
import { Link, useNavigate } from 'react-router-dom';
import useEmployeeStore from '../../store/employeeStore';
import DOMPurify from 'dompurify';

// Styled components
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: '#343a40',
  boxShadow: 'none',
  position: 'relative',
  marginLeft: '250px',
  width: 'calc(100% - 250px)',
  '@media (max-width: 768px)': {
    marginLeft: 0,
    width: '100%'
  }
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#FF4444',
    color: 'white'
  }
}));

const NotificationModal = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '80px',
  right: '20px',
  width: 400,
  maxHeight: '80vh',
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[5],
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden'
}));

const NotificationItem = ({ notification, onRead }) => {
  const getBorderColor = (type) => {
    switch (type) {
      case 'LEAVE_APPROVED':
      case 'ATTENDANCE_APPROVED':
        return 'success.main';
      case 'LEAVE_REJECTED':
      case 'ATTENDANCE_REJECTED':
        return 'error.main';
      case 'REPORT_PENDING':
        return 'warning.main';
      default:
        return 'primary.main';
    }
  };

  return (
    <Box
      onClick={() => onRead(notification.id)}
      sx={{
        p: 2,
        cursor: 'pointer',
        borderLeft: 3,
        borderColor: getBorderColor(notification.type),
        '&:hover': {
          bgcolor: 'action.hover',
        },
        bgcolor: notification.isRead ? 'transparent' : 'action.selected',
      }}
    >
      <Typography 
        variant="body2" 
        sx={{ color: 'text.primary' }}
        component="div"
        dangerouslySetInnerHTML={{ 
          __html: DOMPurify.sanitize(notification.message) 
        }}
      />
      <Typography 
        variant="caption" 
        sx={{ 
          color: 'text.secondary', 
          mt: 0.5, 
          display: 'block' 
        }}
      >
        {new Date(notification.createdAt).toLocaleString()}
      </Typography>
    </Box>
  );
};

const Header = () => {
  const { employeeData, isLoading, updateEmployeeData } = useEmployeeStore();
  const { email } = useUser();
  const userEmail = email || Cookies.get('email');
  const navigate = useNavigate();
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [isReportSubmitted, setIsReportSubmitted] = useState(false);
  const [clockInTime, setClockInTime] = useState(null);
  const [clockOutTime, setClockOutTime] = useState(null);
  const [time, setTime] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [openNotifications, setOpenNotifications] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  useEffect(() => {
    if (userEmail && !employeeData) {
      updateEmployeeData(userEmail);
    }
  }, [userEmail]);

  const handleLogout = async () => {
    try {
      await axios.post(`${config.apiUrl}/qubinest/logout`);
      Cookies.remove('employee_id');
      Cookies.remove('email');

      // Clear local storage except for "clock in" and "clock out"
      const clockInData = localStorage.getItem(`lastClockIn_${userEmail}`);
      const clockOutData = localStorage.getItem(`lastClockOut_${userEmail}`);
      localStorage.clear();
      if (clockInData) {
        localStorage.setItem(`lastClockIn_${userEmail}`, clockInData);
      }
      if (clockOutData) {
        localStorage.setItem(`lastClockOut_${userEmail}`, clockOutData);
      }

      toast.success('Logout successful');
      navigate('/');
    } catch (error) {
      console.error(error);
      toast.error('Logout not possible');
    }
  };

  const clockIn = async () => {
    const today = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();
    
    const timestamp = new Date().getTime();
    const userClockInKey = `lastClockIn_${email}`;
    const lastClockIn = JSON.parse(localStorage.getItem(userClockInKey));

    if (lastClockIn && lastClockIn.date === today) {
      toast.error('You have already clocked in today.');
      return;
    }

    try {
      console.log('Sending clock-in request...');
      const response = await axios.post(`${config.apiUrl}/qubinest/clockin`, { email });
      toast.success('Clock-in successful!');
      setIsClockedIn(true);
      setClockInTime(currentTime);
      localStorage.setItem(userClockInKey, JSON.stringify({ date: today, time: currentTime, timestamp }));
      return response.data;
    } catch (error) {
      if (error.response.status === 500) {
        setIsModalOpen(true);
      }
      const errorMessage = error.response ? error.response.data.message : error.message;
      toast.error(errorMessage);
      console.error('Error clocking in:', error);
      throw error;
    }
  };

  const clockOut = async () => {
    if (!isClockedIn) {
      toast.error('You need to clock in first.');
      return;
    }

    const today = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();
    const timestamp = new Date().getTime();
    const userClockOutKey = `lastClockOut_${email}`;
    const lastClockOut = JSON.parse(localStorage.getItem(userClockOutKey));

    if (lastClockOut && lastClockOut.date === today) {
      toast.error('You have already clocked out today.');
      return;
    }

    if (!isReportSubmitted) {
      toast.error('Please submit your daily report before clocking out.');
      return;
    }

    try {
      console.log('Sending clock-out request...');
      const response = await axios.post(`${config.apiUrl}/qubinest/clockout`, { email });
      toast.success('Clock-out successful!');
      setIsClockedIn(false);
      setClockOutTime(currentTime);
      localStorage.setItem(userClockOutKey, JSON.stringify({ date: today, time: currentTime, timestamp }));
      localStorage.setItem('You have worked for : ', JSON.stringify(time));
      setTime({ hours: 0, minutes: 0, seconds: 0 });

      setTimeout(() => {
        // Clear all local storage items except clock-in and clock-out data
        const itemsToKeep = ['lastClockIn_', 'lastClockOut_', 'You have worked for : '];
        const keys = Object.keys(localStorage);
        for (let key of keys) {
          if (!itemsToKeep.some(item => key.startsWith(item))) {
            localStorage.removeItem(key);
          }
        }
        toast.success('Data has been successfully reset.');
      }, 10000);

      return response.data;
    } catch (error) {
      const errorMessage = error.response ? error.response.data.message : error.message;
      toast.error(errorMessage);
      console.error('Error clocking out:', error);
      throw error;
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!employeeData?.employee_id) return;
    
    try {
        const response = await axios.get(`${config.apiUrl}/qubinest/notifications/${employeeData.employee_id}`);
        setNotifications(response.data);
        setUnreadCount(response.data.filter(notif => !notif.isRead).length);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        // Don't show error toast for 404s as they're expected when no notifications exist
        if (error.response?.status !== 404) {
            toast.error('Failed to fetch notifications');
        }
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
        await axios.put(`${config.apiUrl}/qubinest/notifications/${notificationId}/read`);
        setNotifications(notifications.map(notif => 
            notif.id === notificationId ? { ...notif, isRead: true } : notif
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
        console.error('Error marking notification as read:', error);
        toast.error('Failed to mark notification as read');
    }
  };

  // Add function to mark all as read
  const markAllAsRead = async () => {
    if (!employeeData?.employee_id) return;
    
    try {
        await axios.put(`${config.apiUrl}/qubinest/notifications/markAllRead/${employeeData.employee_id}`);
        setNotifications(notifications.map(notif => ({ ...notif, isRead: true })));
        setUnreadCount(0);
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        toast.error('Failed to mark all notifications as read');
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every minute
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [employeeData?.employee_id]);

  // Early loading state with skeleton
  if (isLoading) {
    return (
      <nav className="main-header navbar navbar-expand navbar-dark navbar-dark">
        <div className="animate-pulse flex items-center">
          <div className="rounded-full bg-gray-300 h-9 w-9"></div>
          <div className="ml-2 h-4 w-24 bg-gray-300 rounded"></div>
        </div>
      </nav>
    );
  }

  if (!employeeData) {
    return <div>Loading...</div>; // Show loading state
  }

  // Profile menu handlers
  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileClose = () => {
    setAnchorEl(null);
  };

  return (
    <StyledAppBar>
      <Toolbar sx={{ minHeight: '56px !important' }}>
        {/* Mobile menu icon */}
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ 
            display: { sm: 'none' },
            marginRight: 2
          }}
        >
          <i className="fas fa-bars" />
        </IconButton>

        {/* Page Title */}
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
         
        </Typography>

        {/* Notifications */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            color="inherit"
            onClick={() => setOpenNotifications(true)}
            sx={{ position: 'relative' }}
          >
            <StyledBadge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </StyledBadge>
          </IconButton>

          {/* Profile Avatar */}
          <IconButton
            onClick={handleProfileClick}
            size="small"
            aria-controls={open ? 'account-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
          >
            <Avatar
              src={employeeData?.employeeImg}
              alt={`${employeeData?.firstname || 'User'}`}
              sx={{ width: 32, height: 32 }}
            />
          </IconButton>
        </Box>

        {/* Notification Modal */}
        <Modal
          open={openNotifications}
          onClose={() => setOpenNotifications(false)}
          BackdropProps={{ invisible: true }}
        >
          <NotificationModal>
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'grey.100' }}>
              <Typography variant="h6">Notifications</Typography>
              <Box>
                {notifications.length > 0 && (
                  <IconButton
                    size="small"
                    onClick={markAllAsRead}
                    sx={{ mr: 1, color: 'primary.main', fontSize: '0.875rem' }}
                  >
                    Mark all as read
                  </IconButton>
                )}
                <IconButton
                  size="small"
                  onClick={() => setOpenNotifications(false)}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
            <Divider />
            <Box sx={{ maxHeight: 'calc(80vh - 100px)', overflow: 'auto' }}>
              {notifications.length === 0 ? (
                <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
                  No notifications
                </Box>
              ) : (
                notifications.map(notification => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onRead={markAsRead}
                  />
                ))
              )}
            </Box>
          </NotificationModal>
        </Modal>

        {/* Profile Menu */}
        <Menu
          anchorEl={anchorEl}
          id="account-menu"
          open={open}
          onClose={handleProfileClose}
          onClick={handleProfileClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1.5,
              '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              '&:before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
            },
          }}
        >
          <MenuItem onClick={() => navigate('/viewprofile')}>
            <ListItemIcon>
              <PersonIcon fontSize="small" />
            </ListItemIcon>
            View Profile
          </MenuItem>
          <MenuItem>
            <ListItemIcon>
              <SettingsIcon fontSize="small" />
            </ListItemIcon>
            Settings
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </StyledAppBar>
  );
};

export default Header;
