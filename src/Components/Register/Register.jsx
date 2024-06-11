import React, { useState } from "react";
import "./Register.css";
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import config from "../config";

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('');
  const [salary, setSalary] = useState('');
  const [mainPosition, setMainPosition] = useState('');
  const [joiningDate, setJoiningDate] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (event) => {
    event.preventDefault();

    if (!username || !email || !password || !confirmPassword || !role || !salary || !mainPosition || !joiningDate) {
      toast.error('Please fill all the details');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address.');
      return;
    }

    if (!email.endsWith('@qubicgen.com')) {
      toast.error('Please use an email address with @qubicgen.com domain.');
      return;
    }

    try {
      const response = await axios.post(`${config.apiUrl}/qubinest/register`, {
        username,
        email,
        password,
        role,
        salary: parseFloat(salary),
        mainPosition,
        joiningDate
      });
      console.log(response);
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setRole('');
      setSalary('');
      setMainPosition('');
      setJoiningDate('');
      toast.success('Registration successful');
      // Navigate to login or another page after successful registration
      navigate('/login');
    } catch (error) {
      console.error('Registration failed:', error.response ? error.response.data : error.message);
      toast.error('User already exists. Please login.');
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
          <div className="max-w-md relative flex flex-col rounded-lg text-black bg-[#EEF7FF] p-10" >
            <div className="text-2xl font-bold mb-2 text-[#1e0e4b] text-center px-9" >
              Welcome to <span className="text-yellow-400">QubiNest</span>
            </div>
            <div className="text-sm font-normal mb-4 text-center text-[#1e0e4b]" >
              Register into your account as <br />
            </div>
            <form className="flex flex-col gap-3" onSubmit={onSubmit}  >
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
                  Username <span className="text-red-600 "> * </span> 
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="rounded border bg-gray-200 text-sm w-full font-normal leading-[18px] text-black tracking-[0px] appearance-none block h-11 m-0 p-[11px] focus:ring-2 ring-offset-2 ring-gray-900 outline-0"
                />
              </div>
              <div className="block relative">
                <label
                  htmlFor="email"
                  className="block text-gray-600 cursor-text text-sm leading-[140%] font-normal mb-2"
                >
                  Email <span className="text-red-600 "> * </span> 
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
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
                  Password <span className="text-red-600 "> * </span> 
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
                  htmlFor="confirmPassword"
                  className="block text-gray-600 cursor-text text-sm leading-[140%] font-normal mb-2"
                >
                  Confirm Password <span className="text-red-600 ">*</span> 
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="rounded border bg-gray-200 text-sm w-full font-normal leading-[18px] text-black tracking-[0px] appearance-none block h-11 m-0 p-[11px] focus:ring-2 ring-offset-2 ring-gray-900 outline-0"
                />
              </div>
              <div className="block relative">
                <label
                  htmlFor="salary"
                  className="block text-gray-600 cursor-text text-sm leading-[140%] font-normal mb-2"
                >
                  Salary <span className="text-red-600 "> * </span> 
                </label>
                <input
                  type="number"
                  id="salary"
                  name="salary"
                  placeholder="Enter your salary"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  className="rounded border bg-gray-200 text-sm w-full font-normal leading-[18px] text-black tracking-[0px] appearance-none block h-11 m-0 p-[11px] focus:ring-2 ring-offset-2 ring-gray-900 outline-0"
                />
              </div>
              <div className="block relative">
                <label
                  htmlFor="mainPosition"
                  className="block text-gray-600 cursor-text text-sm leading-[140%] font-normal mb-2"
                >
                  Main Position <span className="text-red-600 "> * </span> 
                </label>
                <input
                  type="text"
                  id="mainPosition"
                  name="mainPosition"
                  placeholder="Enter your main position"
                  value={mainPosition}
                  onChange={(e) => setMainPosition(e.target.value)}
                  className="rounded border bg-gray-200 text-sm w-full font-normal leading-[18px] text-black tracking-[0px] appearance-none block h-11 m-0 p-[11px] focus:ring-2 ring-offset-2 ring-gray-900 outline-0"
                />
              </div>
              <div className="block relative">
                <label
                  htmlFor="joiningDate"
                  className="block text-gray-600 cursor-text text-sm leading-[140%] font-normal mb-2"
                >
                  Joining Date <span className="text-red-600 "> * </span> 
                </label>
                <input
                  type="date"
                  id="joiningDate"
                  name="joiningDate"
                  placeholder="Enter your joining date"
                  value={joiningDate}
                  onChange={(e) => setJoiningDate(e.target.value)}
                  className="rounded border bg-gray-200 text-sm w-full font-normal leading-[18px] text-black tracking-[0px] appearance-none block h-11 m-0 p-[11px] focus:ring-2 ring-offset-2 ring-gray-900 outline-0"
                />
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
