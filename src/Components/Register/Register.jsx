import React, { useState } from "react";
import "./Register.css";
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie'
const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // Handle form submission
  const onSubmit = async (event) => {
    event.preventDefault();
    toast.success("Admin will approve your request shortly")
    try {
      const response = await axios.post('https://qubinest-backend-five.vercel.app/qubinest/login', { username, password });
      console.log(response);
      Cookies.set('username', username, { secure: true, sameSite: 'Strict' })
      setUsername('');
      setPassword('');
      toast.success('Login successful');
      navigate('/dashboard'); // Navigate to /dashboard

    } catch (error) {
      if (error.response) {
        const errorMessage = error.response.data.message || 'An error occurred';
        toast.error(errorMessage);
      } else if (error.request) {
        toast.error('No response from server');
      } else {
        toast.error('Error occurred while sending request');
      }
    }
  };

  return (
    <>
      <div className="Careersmain">
        <div className="logo">
          <img
            className="w-6/12"
            src="https://res.cloudinary.com/defsu5bfc/image/upload/v1715348582/og_6_jqnrvf.png"
            alt=""
          />
        </div>

        <div className="login-left flex justify-around ">
          <div>
            <h1 className="text-white text-4xl font-bold font-sans relative z-50 h-[100vh] w-[30vw] flex justify-center items-center ">
              WELCOME
            </h1>
          </div>

          <div className='loginform z-40 flex justify-center items-center data-aos="flip-left" '>
            <div className="max-w-md relative flex flex-col rounded-lg text-black bg-[#EEF7FF] p-10">
              <div className="text-2xl font-bold mb-2 text-[#1e0e4b] text-center px-9">
                Welcome to <span className="text-yellow-400">QubiNest</span>
              </div>
              <div className="text-sm font-normal mb-4 text-center text-[#1e0e4b]">
                Register in to your account as <br />
                
                {/* <select name="" id="">

                  <option value="">Select</option>
                  <option value="">Employee</option>
                  <option value="">Intern</option>
                  <option value="">Manager</option>
                  <option value="">Admin</option>
                </select> */}
              </div>

              <form className="flex flex-col gap-3" onSubmit={onSubmit}>
                <div className="block relative">
                  <label
                    htmlFor="email"
                    className="block text-gray-600 cursor-text text-sm leading-[140%] font-normal mb-2"
                  >
 <select name="" id="" className="bg-[#EEF7FF]">

<option value="">Select</option>
<option value="">Employee</option>
<option value="">Intern</option>
<option value="">Manager</option>
<option value="">Admin</option>
</select>                  </label>
                  <input
                    type="text"
                    id="email"
                    name="email"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="rounded border bg-gray-200 text-sm w-full font-normal leading-[18px] text-black tracking-[0px] appearance-none block h-11 m-0 p-[11px] focus:ring-2 ring-offset-2 ring-gray-900 outline-0"
                  />
                </div>
                <div className="block relative">
                  <label
                    htmlFor="password"
                    className="block text-gray-600 cursor-text text-sm leading-[140%] font-normal mb-2"
                  >
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="rounded border bg-gray-200 text-sm w-full font-normal leading-[18px] text-black tracking-[0px] appearance-none block h-11 m-0 p-[11px] focus:ring-2 ring-offset-2 ring-gray-900 outline-0"
                  />
                </div>
                <div>

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
    </>
  );
};

export default Register;