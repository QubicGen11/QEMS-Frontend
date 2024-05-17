import React, { useEffect } from "react";
import "./Login.css";
import AOS from "aos";
import "aos/dist/aos.css";
import { Link } from "react-router-dom";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useForm } from "react-hook-form";
import axios from 'axios'
const Login = () => {
  useEffect(() => {
    AOS.init();
  }, []);

  // Initialize the form
  const { register, handleSubmit, formState: { errors },reset } = useForm();

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      const response = await axios.post('http://localhost:9987/qubinest/login', data);
      reset(); // Reset form fields
      // If login is successful, you can redirect the user or perform other actions
      console.log(data)
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const errorMessage = error.response.data.message || 'An error occurred';
        toast.error(errorMessage);
      } else if (error.request) {
        // The request was made but no response was received
        toast.error('No response from server');
      } else {
        // Something happened in setting up the request that triggered an Error
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
                Log in to your account
              </div>

              <form className="flex flex-col gap-3" onSubmit={handleSubmit(onSubmit)}>
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
                    placeholder="Enter your email"
                    {...register("email", { required: "Email is required" })}
                    className="rounded border bg-gray-200 text-sm w-full font-normal leading-[18px] text-black tracking-[0px] appearance-none block h-11 m-0 p-[11px] focus:ring-2 ring-offset-2 ring-gray-900 outline-0"
                  />
                  {errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}
                </div>
                <div className="block relative">
                  <label
                    htmlFor="password"
                    className="block text-gray-600 cursor-text text-sm leading-[140%] font-normal mb-2"
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    placeholder="Enter your password"
                    {...register("password", { required: "Password is required" })}
                    className="rounded border bg-gray-200 text-sm w-full font-normal leading-[18px] text-black tracking-[0px] appearance-none block h-11 m-0 p-[11px] focus:ring-2 ring-offset-2 ring-gray-900 outline-0"
                  />
                  {errors.password && <p className="text-red-600 text-sm">{errors.password.message}</p>}
                </div>
                <div>
                  <a className="text-sm text-[#7747ff]" href="#">
                    Forgot your password?
                  </a>
                </div>
                <Link to="/dashboard">

                <button
                  type="submit"
                  className="w-max m-auto px-7 py-2 rounded flex bg-yellow-400 text-black text-sm font-bold transform transition-all duration-500 ease-in-out hover:scale-110 hover:brightness-110 hover:animate-pulse active:animate-bounce"
                >
                  SIGN IN
                </button>
                </Link>
               
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
