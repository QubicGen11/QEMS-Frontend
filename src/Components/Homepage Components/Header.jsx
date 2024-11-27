import React, { useState, useEffect, useRef } from 'react';
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
  maxHeight: '60vh',
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[5],
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden'
}));

const NotificationItem = ({ notification, onRead, onSelect, isSelected, selectedNotification }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (isSelected && containerRef.current) {
      containerRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, [isSelected]);

  const getBorderColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'success':
        return '#4CAF50';
      case 'warning':
        return '#FFC107';
      case 'error':
        return '#F44336';
      case 'info':
        return '#2196F3';
      default:
        return '#2196F3'; // default to info color
    }
  };

  return (
    <Box
      ref={containerRef}
      onClick={(e) => {
        if (!isSelected) {
          onRead(notification.id);
          onSelect(notification);
        }
      }}
      sx={{
        p: 1.5,
        cursor: 'pointer',
        borderLeft: 3,
        borderColor: getBorderColor(notification.type),
        '&:hover': {
          bgcolor: !isSelected && 'action.hover',
        },
        bgcolor: isSelected ? 'action.selected' : notification.isRead ? 'transparent' : 'action.selected',
        borderRadius: 1,
        boxShadow: '0 1px 2px gray',
        transition: 'all 0.3s ease',
        display: isSelected ? 'block' : (selectedNotification ? 'none' : 'block'),
        position: isSelected ? 'relative' : 'relative',
        padding: isSelected ? '16px' : '12px',
        margin: isSelected ? '0' : '4px 8px',
        minHeight: isSelected ? 'auto' : '80px',
        maxHeight: isSelected ? 'none' : '80px',
        
      }}
    >
      {isSelected && (
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            onSelect(null);
          }}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'text.secondary',
          }}
          size="small"
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      )}

      <Typography 
        variant="body2" 
        sx={{ 
          color: 'text.primary',
          fontWeight: !notification.isRead ? 600 : 400,
          fontSize: '0.875rem',
          pr: isSelected ? 4 : 0,
          ...(isSelected ? {
            display: 'block',
          } : {
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          })
        }}
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
          display: 'block',
          fontSize: '0.75rem'
        }}
      >
        {new Date(notification.createdAt).toLocaleString()}
      </Typography>
      
      {isSelected && (
        <Box sx={{ mt: 2 }}>
          <Divider sx={{ my: 1 }} />
          {notification.type && (
            <Typography variant="body2" color="text.secondary">
              Type: {notification.type}
            </Typography>
          )}
          {notification.location && (
            <Typography variant="body2" color="text.secondary">
              Location: {notification.location}
            </Typography>
          )}
          {notification.date && (
            <Typography variant="body2" color="text.secondary">
              Date: {notification.date}
            </Typography>
          )}
          {notification.time && (
            <Typography variant="body2" color="text.secondary">
              Time: {notification.time}
            </Typography>
          )}
        </Box>
      )}
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
  const [selectedNotification, setSelectedNotification] = useState(null);

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

  // Add this function to handle notification selection
  const handleNotificationSelect = (notification) => {
    setSelectedNotification(notification);
  };

  return (
    <StyledAppBar>
      <Toolbar sx={{ minHeight: '56px !important' }}>
        {/* Mobile menu icon - only visible on mobile */}
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ 
            display: { xs: 'flex', md: 'none' }, // Show only on mobile, hide on md and up
            marginRight: 2
          }}
          onClick={() => document.body.classList.toggle('sidebar-open')}
        >
          <i className="fas fa-bars" />
        </IconButton>

        {/* Desktop menu icon - only visible on larger screens */}
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ 
            display: { xs: 'none', md: 'flex' }, // Hide on mobile, show on md and up
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
          onClose={() => {
            setOpenNotifications(false);
            setSelectedNotification(null);
          }}
          BackdropProps={{ invisible: true }}
        >
          <NotificationModal>
            <Box sx={{ 
              p: 2, 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              bgcolor: 'grey.100',
              position: 'sticky',
              top: 0,
              zIndex: 3,
            }}>
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
                  onClick={() => {
                    setOpenNotifications(false);
                    setSelectedNotification(null);
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
            <Divider />
            <Box 
              sx={{ 
                maxHeight: 'calc(60vh - 60px)',
                overflow: 'auto',
                '&::-webkit-scrollbar': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  borderRadius: '3px',
                },
                position: 'relative',
                padding: selectedNotification ? 0 : '8px 0',
                scrollBehavior: 'smooth',
              }}
            >
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
                    onSelect={handleNotificationSelect}
                    isSelected={selectedNotification?.id === notification.id}
                    selectedNotification={selectedNotification}
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
