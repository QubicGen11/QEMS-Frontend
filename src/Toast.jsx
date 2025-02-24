import React from 'react';
import ReactDOM from 'react-dom';
import { BsExclamationCircle, BsExclamationTriangle } from 'react-icons/bs';
import { IoMdCheckmark } from 'react-icons/io';
import { IoClose, IoCheckmarkCircle } from 'react-icons/io5';
import { motion, AnimatePresence } from 'framer-motion';

const Toast = ({ message, type = 'info', onClose }) => {
  const variants = {
    info: {
      bg: 'bg-[#0056B3]',
      icon: (
        <motion.div
          initial={{ rotate: 180, scale: 0, opacity: 0 }}
          animate={{ 
            rotate: [180, 1800, 1755, 1800],
            scale: [0, 1.2, 0.9, 1],
            opacity: 1
          }}
          transition={{ 
            duration: 1.2,
            times: [0, 0.7, 0.9, 1],
            ease: "easeInOut"
          }}
        >
          <BsExclamationCircle className="w-6 h-6 text-white" />
        </motion.div>
      )
    },
    error: {
      bg: 'bg-[#DC3545]',
      icon: (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ 
            scale: [0, 1.4, 0.8, 1.2, 1],
            rotate: [0, 1800, 1790, 1810, 1800],
          }}
          transition={{ 
            duration: 1.2,
            times: [0, 0.4, 0.6, 0.8, 1],
            ease: "easeOut"
          }}
        >
          <motion.div
            animate={{
              rotate: [-5, 5, -5, 5, 0],
            }}
            transition={{
              duration: 0.5,
              delay: 1.2,
              ease: "easeInOut"
            }}
          >
            <BsExclamationTriangle className="w-6 h-6 text-white" />
          </motion.div>
        </motion.div>
      )
    },
    success: {
      bg: 'bg-[#28A745]',
      icon: (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ 
            scale: [0, 1.2, 1],
            rotate: [-1800, 20, 0],
          }}
          transition={{ 
            duration: 1.2,
            times: [0, 0.8, 1],
            ease: "anticipate"
          }}
        >
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
              delay: 1.2
            }}
          >
            <IoCheckmarkCircle className="w-6 h-6 text-white" />
          </motion.div>
        </motion.div>
      )
    }
  };

  const variant = variants[type] || variants.info;

  return (
    <motion.div 
      initial={{ x: 100, opacity: 0, scale: 0.6, rotateX: 90 }}
      animate={{ 
        x: 0, 
        opacity: 1, 
        scale: 1,
        rotateX: 0,
        transition: {
          type: "spring",
          damping: 15,
          stiffness: 100,
          duration: 0.6
        }
      }}
      exit={{ 
        x: 100, 
        opacity: 0,
        scale: 0.6,
        rotateX: -90,
        transition: { 
          duration: 0.3,
          ease: "backIn"
        }
      }}
      className={`
        ${variant.bg} 
        fixed
        top-20
        right-6
        text-white 
        rounded-lg
        p-4
        flex 
        items-center 
        justify-between 
        gap-3
        min-w-[300px]
        max-w-[400px]
      
        backdrop-blur-lg
        bg-opacity-90
        border-t-2
        border-white/20
      `}
    >
      <motion.div 
        className="flex items-center gap-3"
        initial={{ x: -20, opacity: 0 }}
        animate={{ 
          x: 0,
          opacity: 1,
          transition: {
            delay: 0.2,
            duration: 0.4
          }
        }}
      >
        {variant.icon}
        <motion.span 
          className="text-sm font-medium"
          initial={{ opacity: 0, y: 10 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            transition: {
              delay: 0.3,
              duration: 0.4
            }
          }}
        >
          <motion.div
            animate={{
              scale: [1, 1.02, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
          >
            {message}
          </motion.div>
        </motion.span>
      </motion.div>
      <motion.button 
        whileHover={{ 
          scale: 1.2,
          rotate: 180,
          transition: {
            duration: 0.3,
            ease: "backOut"
          }
        }}
        whileTap={{ 
          scale: 0.8,
          rotate: 360,
        }}
        onClick={onClose}
        className="text-white/80 hover:text-white"
      >
        <IoClose className="w-5 h-5" />
      </motion.button>
    </motion.div>
  );
};

export const displayToast = (type, message) => {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed top-4 right-4 z-50 flex flex-col gap-3';
    document.body.appendChild(container);
  }

  const toastElement = document.createElement('div');
  const root = ReactDOM.createRoot(toastElement);
  
  const handleClose = () => {
    toastElement.classList.add('animate-fadeOut');
    setTimeout(() => {
      if (container.contains(toastElement)) {
        container.removeChild(toastElement);
      }
    }, 200);
  };

  root.render(
    <Toast 
      type={type} 
      message={message}
      onClose={handleClose}
    />
  );
  
  container.appendChild(toastElement);
  setTimeout(handleClose, 4000);
};

export default Toast; 
// export default Toast; 