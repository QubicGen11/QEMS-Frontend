import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import useClockStore from '../../store/clockStore';
import { useUser } from '../context/UserContext';

const Clock = () => {
  const { email } = useUser();
  const { 
    clockStatus, 
    userInfo, 
    isLoading,
    error,
    clockIn,
    clockOut,
    fetchUserInfo
  } = useClockStore();

  useEffect(() => {
    if (email) {
      fetchUserInfo(email);
    }
  }, [email, fetchUserInfo]);

  // Get time of day for greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative h-[300px] rounded-xl overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber-700 via-yellow-600 to-amber-800" />
      
      {/* Content */}
      <div className="relative z-10 p-8 text-white h-full flex flex-col justify-between">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-4xl font-bold mb-2">
            {getGreeting()}, {userInfo.name}
          </h1>
          <div className="flex flex-col gap-2 text-white/80">
            <div className="flex items-center gap-4">
              <span>📋 {userInfo.position}</span>
              <span># {userInfo.employeeId}</span>
            </div>
            <div className="flex items-center gap-4">
              <span>🏢 {userInfo.department}</span>
              {userInfo.subDepartment && (
                <span>📍 {userInfo.subDepartment}</span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Clock Actions */}
        <div className="flex justify-between items-center">
          {clockStatus.isClockedIn ? (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2"
              >
                <span>⏱️ Clock In</span>
                <span className="text-xl font-mono">({clockStatus.elapsedTime})</span>
              </motion.div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => clockOut(email)}
                className="px-6 py-2 bg-white/20 backdrop-blur-sm rounded-md 
                         hover:bg-white/30 transition-all duration-300 flex items-center gap-2"
                disabled={isLoading}
              >
                <span>🚪</span>
                {isLoading ? 'Processing...' : 'Clock Out'}
              </motion.button>
            </>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => clockIn(email)}
              className="px-6 py-2 bg-white/20 backdrop-blur-sm rounded-md 
                       hover:bg-white/30 transition-all duration-300 flex items-center gap-2"
              disabled={isLoading}
            >
              <span>🏃</span>
              {isLoading ? 'Processing...' : 'Clock In'}
            </motion.button>
          )}
        </div>
      </div>

      {/* QubiNest Logo */}
      <motion.img
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.2 }}
        transition={{ delay: 0.5 }}
        src="https://res.cloudinary.com/defsu5bfc/image/upload/v1715348582/og_6_jqnrvf.png"
        alt="QubiNest Logo"
        className="absolute right-4 top-4 w-16 opacity-20"
      />

      {/* Error Display */}
      {error && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-4 right-4 bg-red-500/80 text-white px-4 py-2 rounded-md"
        >
          {error}
        </motion.div>
      )}
    </motion.div>
  );
};

export default Clock;
