import React, { useState } from "react";
import "./Login.css";
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { useUser } from "../context/UserContext";
import config from "../config";
import useEmployeeStore from "../../store/employeeStore";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3
    }
  }
};

const letterVariants = {
  hidden: { 
    y: 50,
    opacity: 0,
    rotateX: -90
  },
  visible: {
    y: 0,
    opacity: 1,
    rotateX: 0,
    transition: {
      type: "spring",
      damping: 10,
      stiffness: 100
    }
  },
  hover: {
    scale: 1.2,
    rotate: [0, 5, -5, 0],
    transition: {
      duration: 0.3
    }
  }
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setEmail: setUserEmail } = useUser();
  const { clearStore } = useEmployeeStore();

  const onSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      clearStore();
      localStorage.clear();

      const response = await axios.post(`${config.apiUrl}/qubinest/login`, { email, password });
      console.log(response);
      Cookies.set('email', email, { secure: true, sameSite: 'Strict' });
      setUserEmail(email);
      
      const existingEmails = JSON.parse(localStorage.getItem('userEmails')) || [];
      if (!existingEmails.includes(email)) {
        existingEmails.push(email);
      }
      localStorage.setItem('userEmails', JSON.stringify(existingEmails));

      localStorage.setItem('currentUserEmail', email);
      localStorage.setItem('loginTimestamp', Date.now().toString());

      setEmail('');
      setPassword('');
      toast.success(response.data.message || 'Login successful!');
      navigate('/dashboard');
    } catch (error) {
      if (error.response) {
        const errorMessage = error.response.data.message || 'Invalid Credentials';
        toast.error(errorMessage);
      } else if (error.request) {
        toast.error('Network error. Please check your connection.');
      } else {
        toast.error('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full">
        <video
          autoPlay
          loop
          muted
          className="absolute min-w-full min-h-full object-cover"
        >
          <source 
            src="https://videos.pexels.com/video-files/853870/853870-hd_1920_1080_25fps.mp4" 
            type="video/mp4" 
          />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Black Overlay */}
      <div className="absolute inset-0 bg-black/75" />

      {/* Logo */}
      <div className="absolute top-4 left-4 md:top-8 md:left-8 w-32 md:w-48 z-20">
        <img
          src="https://res.cloudinary.com/defsu5bfc/image/upload/v1715348582/og_6_jqnrvf.png"
          alt="QubiNest Logo"
          className="w-full"
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col lg:flex-row min-h-screen">
        {/* Left Side - Welcome Text */}
        <div className="w-full lg:w-1/2 flex items-center justify-center lg:justify-start lg:pl-20 py-8 lg:py-0">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex space-x-2"
          >
            {[
              { letter: 'W', gradient: 'from-yellow-400 via-red-500 to-pink-500' },
              { letter: 'E', gradient: 'from-green-400 via-blue-500 to-purple-500' },
              { letter: 'L', gradient: 'from-purple-400 via-pink-500 to-red-500' },
              { letter: 'C', gradient: 'from-blue-400 via-indigo-500 to-purple-500' },
              { letter: 'O', gradient: 'from-red-400 via-yellow-500 to-orange-500' },
              { letter: 'M', gradient: 'from-teal-400 via-cyan-500 to-blue-500' },
              { letter: 'E', gradient: 'from-pink-400 via-rose-500 to-red-500' }
            ].map(({ letter, gradient }, index) => (
              <motion.span
                key={index}
                variants={letterVariants}
                whileHover="hover"
                className={`text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r ${gradient} text-transparent bg-clip-text`}
                style={{
                  textShadow: '0 0 20px rgba(255,255,255,0.5)',
                  display: 'inline-block'
                }}
              >
                {letter}
              </motion.span>
            ))}
          </motion.div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-4 lg:pr-8">
          <div className="w-full max-w-[450px] rounded-lg p-4 md:p-7" 
               style={{backgroundColor: 'rgba(255, 255, 255, 0.5)', backdropFilter: 'blur(10px)'}}>
            <div className="text-2xl font-bold mb-2 text-[#1e0e4b] text-center px-9">
              Welcome to <span className="text-yellow-400">QubiNest</span>
            </div>
            <div className="text-sm font-normal mb-4 text-center text-[#1e0e4b]">
              Log in to your account
            </div>
            <form className="flex flex-col gap-3" onSubmit={onSubmit}>
              <div className="block relative">
                <label
                  htmlFor="email"
                  className="block text-gray-600 cursor-text text-sm leading-[140%] font-normal mb-2"
                >
                  Email
                </label>
                <input
                  type="text"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded border bg-gray-200 text-sm w-full font-normal leading-[18px] text-black tracking-[0px] appearance-none block h-11 m-0 p-[11px] focus:ring-2 ring-offset-2 ring-gray-900 outline-0"
                  autoComplete="email"
                />
              </div>
              <div className="block relative">
                <label
                  htmlFor="password"
                  className="block text-gray-600 cursor-text text-sm leading-[140%] font-normal mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="rounded border bg-gray-200 text-sm w-full font-normal leading-[18px] text-black tracking-[0px] appearance-none block h-11 m-0 p-[11px] focus:ring-2 ring-offset-2 ring-gray-900 outline-0"
                    autoComplete="current-password"
                  />
                  <span
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </span>
                </div>
              </div>
              <div>
                <a className="text-sm text-[#7747ff]" href="#">
                  Forgot your password?
                </a>

          

              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-max m-auto px-7 py-2 rounded flex items-center justify-center bg-yellow-400 text-black text-sm font-bold transform transition-all duration-500 ease-in-out hover:scale-110 hover:brightness-110 hover:animate-pulse active:animate-bounce disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </div>
                ) : (
                  'SIGN IN'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
