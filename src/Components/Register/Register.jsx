import React, { useState } from "react";
import "./Register.css";
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import config from "../config"; 

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('');
  const navigate = useNavigate();
  // Handle form submission
 // Frontend: Ensure form sends correct data
const onSubmit = async (event) => {
  event.preventDefault();

  // Check if email is empty
  if (!email && !password && !role) {
    toast.error('Please Check all the details');
    return;
  }
  
  if (!email) {
    toast.error('Please enter your email address.');
    return;
  }

  // Check if password is empty
  if (!password) {
    toast.error('Please enter your password.');
    return;
  }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address.');
      return;
    }

    
    // Validate email domain
    if (!email.endsWith('@qubicgen.com')) {
      toast.error('Please use an email address with @qubicgen.com domain.');
      return;
    }

  if (!role) {
    toast.error('Please select a role');
    return;
  }
  try {
    const response = await axios.post(`${config.apiUrl}/qubinest/register`, { role, username, email, password });
    console.log(response);
    setEmail('');
    setPassword('');
    setRole('');
    toast.success('Registration successful');
  } catch (error) {
    console.error(error)
  }
};


  return (
    <div className="Careersmain">
      <div className="logo">
        <img
          className="w-6/12"
          src="https://res.cloudinary.com/defsu5bfc/image/upload/v1715348582/og_6_jqnrvf.png"
          alt="QubiNest Logo"
        />
      </div>
      <div className="login-left flex justify-around">
        <div>
          <h1 className="text-white text-4xl font-bold font-sans relative z-50 h-[100vh] w-[30vw] flex justify-center items-center">
            WELCOME
          </h1>
        </div>
        <div className='loginform z-40 flex justify-center items-center' data-aos="flip-left">
          <div className="max-w-md relative flex flex-col rounded-lg text-black bg-[#EEF7FF] p-10">
            <div className="text-2xl font-bold mb-2 text-[#1e0e4b] text-center px-9">
              Welcome to <span className="text-yellow-400">QubiNest</span>
            </div>
            <div className="text-sm font-normal mb-4 text-center text-[#1e0e4b]">
              Register in to your account as <br />
            </div>
            <form className="flex flex-col gap-3" onSubmit={onSubmit}>
              <div className="block relative">
                <label
                  htmlFor="role"
                  className="block text-gray-600 cursor-text text-sm leading-[140%] font-normal mb-2"
                >
                  Role <span className="text-red-600 "> * </span> 
                </label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="rounded border bg-gray-200 text-sm w-full font-normal leading-[18px] text-black tracking-[0px] appearance-none block h-11 m-0 p-[11px] focus:ring-2 ring-offset-2 ring-gray-900 outline-0"
                >
                  <option value="">Select</option>
                  <option value="Employee">Employee</option>
                  <option value="Intern">Intern</option>
                  <option value="Manager">Manager</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
           
              <div className="block relative">
                <label
                  htmlFor="username"
                  className="block text-gray-600 cursor-text text-sm leading-[140%] font-normal mb-2"
                >
                  Email  <span className="text-red-600 "> * </span> 
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded border bg-gray-200 text-sm w-full font-normal leading-[18px] text-black tracking-[0px] appearance-none block h-11 m-0 p-[11px] focus:ring-2 ring-offset-2 ring-gray-900 outline-0"
                />
              </div>
              <div className="block relative">
                <label
                  htmlFor="password"
                  className="block text-gray-600 cursor-text text-sm leading-[140%] font-normal mb-2"
                >
                  Password  <span className="text-red-600 "> * </span> 
                </label>
                <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                  name="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded border bg-gray-200 text-sm w-full font-normal leading-[18px] text-black tracking-[0px] appearance-none block h-11 m-0 p-[11px] focus:ring-2 ring-offset-2 ring-gray-900 outline-0"
                />
                  <span
                    className="absolute right-3 top-1/2 transform -translate-y-2/2 cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </span>
              </div>
              <div className="block relative">
                <label
                  htmlFor="password"
                  className="block text-gray-600 cursor-text text-sm leading-[140%] font-normal mb-2"
                >
                  Confirm Password  <span className="text-red-600 " > * </span> 
                </label>
                <input
                    type="password"
                    id="confrimpassword"
                  name="confrimpassword"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded border bg-gray-200 text-sm w-full font-normal leading-[18px] text-black tracking-[0px] appearance-none block h-11 m-0 p-[11px] focus:ring-2 ring-offset-2 ring-gray-900 outline-0"
                />
                  <span
                    className="absolute right-3 top-1/2 transform -translate-y-2/2 cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                  </span>
              </div>
              <button
                type="submit"
                className="w-max m-auto px-7 py-2 rounded flex bg-yellow-400 text-black text-sm font-bold transform transition-all duration-500 ease-in-out hover:scale-110 hover:brightness-110 hover:animate-pulse active:animate-bounce"
              >
                Register
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
