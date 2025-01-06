import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaClock, 
  FaPlay, 
  FaPause, 
  FaRedo,
  FaCog
} from 'react-icons/fa';

const ProductivityTools = () => {
  // States for Pomodoro timer
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [customMinutes, setCustomMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);

  // Timer logic
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Play notification sound when timer ends
      const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
      audio.play();
      
      setIsBreak(!isBreak);
      setTimeLeft(isBreak ? customMinutes * 60 : breakMinutes * 60);
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, isBreak, customMinutes, breakMinutes]);

  // Format time for display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Reset timer with new duration
  const resetTimer = () => {
    setTimeLeft(customMinutes * 60);
    setIsActive(false);
    setIsBreak(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto"
    >
      <motion.div 
        className="bg-white rounded-xl shadow-xl p-8"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div 
          className="flex items-center justify-between mb-8"
          initial={{ x: -20 }}
          animate={{ x: 0 }}
        >
          <div className="flex items-center gap-3">
            <FaClock className="text-emerald-500 text-2xl" />
            <h2 className="text-xl font-bold text-gray-800">Focus Timer</h2>
          </div>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowSettings(!showSettings)}
            className="text-gray-500 hover:text-emerald-500 transition-colors"
          >
            <FaCog />
          </motion.button>
        </motion.div>

        {showSettings && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 bg-gray-50 rounded-lg"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Focus Duration (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Break Duration (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={breakMinutes}
                  onChange={(e) => setBreakMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  resetTimer();
                  setShowSettings(false);
                }}
                className="w-full bg-emerald-500 text-white py-2 rounded-md hover:bg-emerald-600 transition-colors"
              >
                Apply Changes
              </motion.button>
            </div>
          </motion.div>
        )}

        <motion.div 
          className="text-center"
          animate={{ 
            scale: isActive ? [1, 1.02, 1] : 1,
            color: isBreak ? '#10b981' : '#1f2937'
          }}
          transition={{ duration: 2, repeat: isActive ? Infinity : 0 }}
        >
          <div className="text-7xl font-bold mb-8 font-mono">
            {formatTime(timeLeft)}
          </div>

          <div className="flex justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsActive(!isActive)}
              className={`${
                isActive ? 'bg-red-500' : 'bg-emerald-500'
              } text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-shadow`}
            >
              {isActive ? <FaPause /> : <FaPlay />}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={resetTimer}
              className="bg-gray-200 text-gray-600 p-4 rounded-full shadow-lg hover:shadow-xl transition-shadow"
            >
              <FaRedo />
            </motion.button>
          </div>

          <motion.p 
            className={`mt-6 font-medium ${
              isBreak ? 'text-emerald-500' : 'text-gray-600'
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {isBreak ? "Time for a break! 🌟" : "Stay focused! 💪"}
          </motion.p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default ProductivityTools; 