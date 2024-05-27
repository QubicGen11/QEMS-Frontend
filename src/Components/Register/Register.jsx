import React, { useState, useRef } from "react";
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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const navigate = useNavigate();
  const formRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);


  const onSubmit = async (event) => {
    event.preventDefault();

    if (!role) {
      toast.error('Please select a role');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    toast.success("Admin will approve your request shortly");

    try {
      const response = await axios.post(`${config.apiUrl}/register`, { username, email, password, role, firstname, lastname, dob, gender, address, phone });
      console.log(response);
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setRole('');
      setFirstname('');
      setLastname('');
      setDob('');
      setGender('');
      setAddress('');
      setPhone('');
      toast.success('Registration successful');
      navigate('/login');
    } catch (error) {
      const errorMessage = error.response ? error.response.data.message : 'An error occurred during the registration process.';
      toast.error(errorMessage);
    }
  };

  const scrollToTop = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
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
        <div className="text-white text-4xl font-bold font-sans relative z-50 h-[100vh] w-[30vw] flex justify-center items-center" id="welcome">
          WELCOME
        </div>
        <div className='loginform z-40 flex justify-center items-center' data-aos="flip-left" >
          <div className="max-w-md relative flex flex-col rounded-lg text-black bg-[#EEF7FF] p-10" id="form">
            <div className="text-2xl font-bold mb-2 text-[#1e0e4b] text-center px-9">
              Welcome to <span className="text-yellow-400">QubiNest</span>
            </div>
            <div className="text-sm font-normal mb-4 text-center text-[#1e0e4b]">
              Register in to your account as <br />
            </div>
            <form className="flex flex-col gap-3 overflow-auto max-h-[500px] " onSubmit={onSubmit} ref={formRef} id="form-container" >
              <div className="block relative">
                <label htmlFor="role" className="block text-gray-600 cursor-text text-sm leading-[140%] font-normal mb-2">
                  Role
                </label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="rounded border  text-sm w-full font-normal leading-[18px] text-black tracking-[0px] appearance-none block h-11 m-0 p-[11px]  ring-offset-2 ring-gray-900 outline-0"
                >
                  <option value="">Select</option>
                  <option value="Employee">Employee</option>
                  <option value="Intern">Intern</option>
                  <option value="Manager">Manager</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div className="block relative">
                <label htmlFor="username" className="block text-gray-600 cursor-text text-sm leading-[140%] font-normal mb-2">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="rounded border  text-sm w-full font-normal leading-[18px] text-black tracking-[0px] appearance-none block h-11 m-0 p-[11px]  ring-offset-2 ring-gray-900 outline-0"
                />
              </div>

              <div className="block relative">
                <label htmlFor="firstname" className="block text-gray-600 cursor-text text-sm leading-[140%] font-normal mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstname"
                  name="firstname"
                  placeholder="Enter your first name"
                  value={firstname}
                  onChange={(e) => setFirstname(e.target.value)}
                  className="rounded border  text-sm w-full font-normal leading-[18px] text-black tracking-[0px] appearance-none block h-11 m-0 p-[11px]  ring-offset-2 ring-gray-900 outline-0"
                />
              </div>
              <div className="block relative">
                <label htmlFor="lastname" className="block text-gray-600 cursor-text text-sm leading-[140%] font-normal mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastname"
                  name="lastname"
                  placeholder="Enter your last name"
                  value={lastname}
                  onChange={(e) => setLastname(e.target.value)}
                  className="rounded border  text-sm w-full font-normal leading-[18px] text-black tracking-[0px] appearance-none block h-11 m-0 p-[11px]  ring-offset-2 ring-gray-900 outline-0"
                />
              </div>
              <div className="block relative">
                <label htmlFor="dob" className="block text-gray-600 cursor-text text-sm leading-[140%] font-normal mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  id="dob"
                  name="dob"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="rounded border  text-sm w-full font-normal leading-[18px] text-black tracking-[0px] appearance-none block h-11 m-0 p-[11px]  ring-offset-2 ring-gray-900 outline-0"
                />
              </div>
              <div className="block relative">
                <label className="block text-gray-600 cursor-text text-sm leading-[140%] font-normal mb-2">
                  Gender
                </label>
                <div className="flex">
                  <input
                    type="radio"
                    id="male"
                    name="gender"
                    value="male"
                    checked={gender === 'male'}
                    onChange={(e) => setGender(e.target.value)}
                    className="mr-2"
                  />
                  <label htmlFor="male" className="mr-4">Male</label>
                  <input
                    type="radio"
                    id="female"
                    name="gender"
                    value="female"
                    checked={gender === 'female'}
                    onChange={(e) => setGender(e.target.value)}
                    className="mr-2"
                  />
                  <label htmlFor="female">Female</label>
                </div>
              </div>
              <div className="block relative">
                <label htmlFor="address" className="block text-gray-600 cursor-text text-sm leading-[140%] font-normal mb-2">
                  Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  placeholder="Enter your address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="rounded border  text-sm w-full font-normal leading-[18px] text-black tracking-[0px] appearance-none block h-11 m-0 p-[11px]  ring-offset-2 ring-gray-900 outline-0"
                />
              </div>
              <div className="block relative">
                <label htmlFor="phone" className="block text-gray-600 cursor-text text-sm leading-[140%] font-normal mb-2">
                  Phone
                </label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  placeholder="Enter your phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="rounded border  text-sm w-full font-normal leading-[18px] text-black tracking-[0px] appearance-none block h-11 m-0 p-[11px]  ring-offset-2 ring-gray-900 outline-0"
                />
              </div>



              <div className="block relative">
                <label htmlFor="email" className="block text-gray-600 cursor-text text-sm leading-[140%] font-normal mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded border  text-sm w-full font-normal leading-[18px] text-black tracking-[0px] appearance-none block h-11 m-0 p-[11px]  ring-offset-2 ring-gray-900 outline-0"
                />
              </div>
              <div className="block relative">
                <label htmlFor="password" className="block text-gray-600 cursor-text text-sm leading-[140%] font-normal mb-2">
                  Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded border  text-sm w-full font-normal leading-[18px] text-black tracking-[0px] appearance-none block h-11 m-0 p-[11px]  ring-offset-2 ring-gray-900 outline-0"
                />
                <span
                  className="absolute right-3 top-1/2 transform -translate-y-2/2 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "🙈" : "👁️"}
                </span>
              </div>
              <div className="block relative">
                <label htmlFor="confirmPassword" className="block text-gray-600 cursor-text text-sm leading-[140%] font-normal mb-2">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? "text" : "password"} id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="rounded border  text-sm w-full font-normal leading-[18px] text-black tracking-[0px] appearance-none block h-11 m-0 p-[11px]  ring-offset-2 ring-gray-900 outline-0"
                />
                <span
                  className="absolute right-3 top-1/2 transform -translate-y-2/2 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "🙈" : "👁️"}
                </span>
              </div>
              {/* Additional fields */}

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
