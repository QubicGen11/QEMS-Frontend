import React, { useState, useMemo } from "react";
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import config from "../config";

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);  
  const [role, setRole] = useState('');
  const [salary, setSalary] = useState('');
  const [mainPosition, setMainPosition] = useState('');
  const [joiningDate, setJoiningDate] = useState('');
  const [department, setDepartment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOTPField, setShowOTPField] = useState(false);
  const [otp, setOTP] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [subDepartment, setSubDepartment] = useState('');
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecial: false
  });
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const navigate = useNavigate();

  const backgroundVideos = [
"https://videos.pexels.com/video-files/3254006/3254006-uhd_2560_1440_25fps.mp4",
"https://videos.pexels.com/video-files/853870/853870-hd_1920_1080_25fps.mp4"
  ];

  const departmentStructure = {
    "Operations": {
      "General Administration": ["Office Manager", "Administrative Assistant", "Facility Manager"],
      "Facility Management": ["Facilities Supervisor", "Maintenance Technician", "Security Officer"],
      "Travel Coordination": ["Travel Coordinator", "Travel Assistant"],
      "Event Coordination": ["Event Coordinator", "Event Planner"],
      "Records Management": ["Records Manager", "Document Controller"],
      "Procurement": ["Procurement Officer", "Purchasing Agent"]
    },
    "Human Resources": {
      "Recruitment and Onboarding": ["Recruitment Manager", "HR Recruiter"],
      "Employee Relations": ["Employee Relations Specialist", "HR Generalist"],
      "Training and Development": ["Training Manager", "Learning and Development Specialist"],
      "Compensation and Benefits": ["Compensation Analyst", "Benefits Coordinator"]
    },
    "Information Technology": {
      "IT Support and Helpdesk": ["IT Support Specialist", "Helpdesk Technician"],
      "Network Administration": ["Network Administrator", "Systems Engineer"],
      "Cybersecurity": ["Cybersecurity Analyst", "Information Security Manager"],
      "Software Maintenance": ["Software Engineer", "Maintenance Technician"]
    },
    "Development and Engineering": {
      "Software Development": ["Software Developer", "Frontend Developer", "Backend Developer"],
      "Quality Assurance (QA)": ["QA Engineer", "Test Analyst"],
      "DevOps": ["DevOps Engineer", "Build and Release Manager"],
      "Research and Development (R&D)": ["R&D Manager", "Research Analyst"]
    },
    "Sales and Marketing": {
      "Sales Operations": ["Sales Manager", "Account Executive"],
      "Marketing and Advertising": ["Marketing Manager", "Digital Marketing Specialist"],
      "Customer Relationship Management (CRM)": ["CRM Manager", "Customer Success Manager"],
      "Content Creation and Social Media": ["Content Manager", "Social Media Specialist"]
    },
    "Finance and Accounting": {
      "Budgeting and Forecasting": ["Financial Analyst", "Budget Analyst"],
      "Payroll": ["Payroll Manager", "Payroll Specialist"],
      "Accounts Payable and Receivable": ["Accounts Payable Clerk", "Accounts Receivable Clerk"],
      "Financial Reporting": ["Financial Controller", "Accountant"]
    },
    "Product Management": {
      "Product Development": ["Product Manager", "Product Owner"],
      "User Experience (UX) and Design": ["UX Designer", "UI Designer"],
      "Market Research": ["Market Research Analyst", "Business Analyst"]
    },
    "Customer Support": {
      "Technical Support": ["Technical Support Engineer", "Helpdesk Support"],
      "Customer Service": ["Customer Service Representative", "Call Center Agent"],
      "Client Success Management": ["Client Success Manager", "Account Manager"]
    },
    "Legal and Compliance": {
      "Contract Management": ["Contracts Manager", "Legal Counsel"],
      "Compliance and Regulatory Affairs": ["Compliance Officer", "Regulatory Affairs Specialist"],
      "Intellectual Property Management": ["IP Manager", "Patent Analyst"]
    },
  };

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
      toast.error('Password must be at least 8 characters long');
      return false;
    }
    if (!hasUpperCase) {
      toast.error('Password must contain at least one uppercase letter');
      return false;
    }
    if (!hasLowerCase) {
      toast.error('Password must contain at least one lowercase letter');
      return false;
    }
    if (!hasNumbers) {
      toast.error('Password must contain at least one number');
      return false;
    }
    if (!hasSpecialChar) {
      toast.error('Password must contain at least one special character');
      return false;
    }
    return true;
  };

  const checkPasswordStrength = (password) => {
    setPasswordValidation({
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    });
  };

  const handleInitialRegistration = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    if (!username || !email || !password || !confirmPassword || !role || !salary || !mainPosition || !joiningDate || !department || 
        (departmentStructure[department] && !subDepartment)) {
      toast.error('Please fill all the required details');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (!validatePassword(password)) {
      setIsLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address.');
      setIsLoading(false);
      return;
    }

    if (!email.endsWith('@qubicgen.com')) {
      toast.error('Please use an email address with @qubicgen.com domain.');
      setIsLoading(false);
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
        joiningDate,
        department,
        subDepartment: subDepartment || null,
      });

      console.log('Registration Response:', response.data);
      toast.success('OTP sent to your email!');
      setShowOTPField(true);
      setRegisteredEmail(email);
      
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Registration failed!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerification = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(`${config.apiUrl}/qubinest/verify-otp`, {
        email: registeredEmail,
        otp
      });

      console.log('OTP Verification Response:', response.data);
      toast.success('Registration completed successfully!');
      
      // Clear form
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setRole('');
      setSalary('');
      setMainPosition('');
      setJoiningDate('');
      setDepartment('');
      setOTP('');
      setShowOTPField(false);
      
      // Redirect to login
      setTimeout(() => {
        navigate('/');
      }, 2000);
      
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'OTP verification failed!');
    } finally {
      setIsLoading(false);
    }
  };

  const allRequirementsMet = useMemo(() => {
    return (
      passwordValidation.minLength &&
      passwordValidation.hasUpperCase &&
      passwordValidation.hasLowerCase &&
      passwordValidation.hasNumber &&
      passwordValidation.hasSpecial
    );
  }, [passwordValidation]);

  return (
    <div className="relative min-h-screen w-full overflow-y-auto p-4 md:p-8">
      {/* Video Background */}
      <div className="fixed inset-0 w-full h-full">
        <video
          id="backgroundVideo"
          autoPlay
          muted
          playsInline
          loop
          className="absolute inset-0 w-full h-full object-cover"
          src={backgroundVideos[currentVideoIndex]}
        >
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
        <div className="w-full lg:w-1/2  flex items-center justify-center lg:justify-start lg:pl-20 py-8 lg:py-0">
          <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-bold text-center lg:text-left relative animate-bounce">
            <span className="inline-block animate-pulse bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 text-transparent bg-clip-text transform hover:scale-110 transition-transform duration-300" 
                  style={{
                    textShadow: '0 0 20px rgba(255,255,255,0.5)',
                    animation: 'circusFloat 3s ease-in-out infinite'
                  }}>
              W
            </span>
            <span className="inline-block animate-pulse bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-transparent bg-clip-text transform hover:scale-110 transition-transform duration-300 delay-100"
                  style={{animation: 'circusFloat 3s ease-in-out infinite 0.2s'}}>
              E
            </span>
            <span className="inline-block animate-pulse bg-gradient-to-r from-indigo-500 via-blue-500 to-green-500 text-transparent bg-clip-text transform hover:scale-110 transition-transform duration-300 delay-200"
                  style={{animation: 'circusFloat 3s ease-in-out infinite 0.4s'}}>
              L
            </span>
            <span className="inline-block animate-pulse bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 text-transparent bg-clip-text transform hover:scale-110 transition-transform duration-300 delay-300"
                  style={{animation: 'circusFloat 3s ease-in-out infinite 0.6s'}}>
              C
            </span>
            <span className="inline-block animate-pulse bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 text-transparent bg-clip-text transform hover:scale-110 transition-transform duration-300 delay-400"
                  style={{animation: 'circusFloat 3s ease-in-out infinite 0.8s'}}>
              O
            </span>
            <span className="inline-block animate-pulse bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 text-transparent bg-clip-text transform hover:scale-110 transition-transform duration-300 delay-500"
                  style={{animation: 'circusFloat 3s ease-in-out infinite 1s'}}>
              M
            </span>
            <span className="inline-block animate-pulse bg-gradient-to-r from-blue-500 via-green-500 to-yellow-500 text-transparent bg-clip-text transform hover:scale-110 transition-transform duration-300 delay-600"
                  style={{animation: 'circusFloat 3s ease-in-out infinite 1.2s'}}>
              E
            </span>
          </h1>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-4 lg:pr-8">
          <div className="w-full max-w-[650px]  rounded-lg p-4 md:p-7 " style={{backgroundColor: 'rgba(255, 255, 255, 0.5)' , backdropFilter: 'blur(10px)'}}>
            <div className="text-center mb-4 md:mb-5">
              <h2 className="text-xl md:text-2xl font-semibold">
                Welcome to <span className="text-yellow-400">QubiNest</span>
              </h2>
              <p className="text-gray-600 mt-2 text-sm">Register into your account as</p>
            </div>

            {!showOTPField ? (
              // Initial Registration Form
              <form onSubmit={handleInitialRegistration} className="grid grid-cols-2 gap-x-5 gap-y-4">
                {/* Role Select */}
                <div>
                  <label className="block text-gray-700 text-sm mb-1.5">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 rounded border border-gray-200 focus:outline-none focus:border-gray-300 text-sm"
                  >
                    <option value="">Select</option>
                    <option value="Admin">Admin</option>
                   
                    <option value="Manager">Manager</option>
                    <option value="Employee">Employee</option>
                    <option value="Intern">Intern</option>
                    
                   
                  </select>
                </div>

                {/* Username Input */}
                <div>
                  <label className="block text-gray-700 text-sm mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 rounded border border-gray-200 focus:outline-none focus:border-gray-300 text-sm"
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Email Input */}
                <div>
                  <label className="block text-gray-700 text-sm mb-1.5">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 rounded border border-gray-200 focus:outline-none focus:border-gray-300 text-sm"
                    placeholder="Enter your email"
                  />
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-gray-700 text-sm mb-1.5">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        checkPasswordStrength(e.target.value);
                      }}
                      onFocus={() => setIsPasswordFocused(true)}
                      onBlur={() => {
                        if (!password) {
                          setIsPasswordFocused(false);
                        }
                      }}
                      autoComplete="new-password"
                      className="w-full p-2.5 bg-gray-50 rounded border border-gray-200 focus:outline-none focus:border-gray-300 text-sm"
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                  
                  {/* Only show requirements when password field is focused and not all requirements are met */}
                  {isPasswordFocused && !allRequirementsMet && (
                    <div className="mt-2 bg-gray-900 text-white rounded-lg p-4 shadow-lg absolute z-10 w-80">
                      <div className="flex items-center mb-3">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12zm1-7a1 1 0 10-2 0v2a1 1 0 102 0V9z" clipRule="evenodd" />
                        </svg>
                        <span className="font-semibold">Password Requirements</span>
                      </div>
                      <ul className="space-y-2">
                        <li className="flex items-center text-sm">
                          <span className={`inline-flex items-center justify-center w-5 h-5 mr-2 rounded-full 
                            ${passwordValidation.minLength ? 'bg-green-500' : 'bg-gray-600'}`}>
                            {passwordValidation.minLength ? '✓' : ''}
                          </span>
                          <span className={passwordValidation.minLength ? 'text-green-400' : 'text-gray-300'}>
                            At least 8 characters
                          </span>
                        </li>
                        <li className="flex items-center text-sm">
                          <span className={`inline-flex items-center justify-center w-5 h-5 mr-2 rounded-full 
                            ${passwordValidation.hasUpperCase ? 'bg-green-500' : 'bg-gray-600'}`}>
                            {passwordValidation.hasUpperCase ? '✓' : ''}
                          </span>
                          <span className={passwordValidation.hasUpperCase ? 'text-green-400' : 'text-gray-300'}>
                            One uppercase letter
                          </span>
                        </li>
                        <li className="flex items-center text-sm">
                          <span className={`inline-flex items-center justify-center w-5 h-5 mr-2 rounded-full 
                            ${passwordValidation.hasLowerCase ? 'bg-green-500' : 'bg-gray-600'}`}>
                            {passwordValidation.hasLowerCase ? '✓' : ''}
                          </span>
                          <span className={passwordValidation.hasLowerCase ? 'text-green-400' : 'text-gray-300'}>
                            One lowercase letter
                          </span>
                        </li>
                        <li className="flex items-center text-sm">
                          <span className={`inline-flex items-center justify-center w-5 h-5 mr-2 rounded-full 
                            ${passwordValidation.hasNumber ? 'bg-green-500' : 'bg-gray-600'}`}>
                            {passwordValidation.hasNumber ? '✓' : ''}
                          </span>
                          <span className={passwordValidation.hasNumber ? 'text-green-400' : 'text-gray-300'}>
                            One number
                          </span>
                        </li>
                        <li className="flex items-center text-sm">
                          <span className={`inline-flex items-center justify-center w-5 h-5 mr-2 rounded-full 
                            ${passwordValidation.hasSpecial ? 'bg-green-500' : 'bg-gray-600'}`}>
                            {passwordValidation.hasSpecial ? '✓' : ''}
                          </span>
                          <span className={passwordValidation.hasSpecial ? 'text-green-400' : 'text-gray-300'}>
                            One special character
                          </span>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>

                {/* Confirm Password Input */}
                <div>
                  <label className="block text-gray-700 text-sm mb-1.5">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 rounded border border-gray-200 focus:outline-none focus:border-gray-300 text-sm"
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showConfirmPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>

                {/* Salary Input */}
                <div>
                  <label className="block text-gray-700 text-sm mb-1.5">
                    Salary <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 rounded border border-gray-200 focus:outline-none focus:border-gray-300 text-sm"
                    placeholder="Enter your salary"
                  />
                </div>

                {/* Main Position Input */}
               

                {/* Department Select */}
                <div>
                  <label className="block text-gray-700 text-sm mb-1.5">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={department}
                    onChange={(e) => {
                      setDepartment(e.target.value);
                      setSubDepartment('');
                      setMainPosition('');
                    }}
                    className="w-full p-2.5 bg-gray-50 rounded border border-gray-200 focus:outline-none focus:border-gray-300 text-sm"
                  >
                    <option value="">Select Department</option>
                    {Object.keys(departmentStructure).map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                {department && (
                  <div>
                    <label className="block text-gray-700 text-sm mb-1.5">
                      Sub Department <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={subDepartment}
                      onChange={(e) => {
                        setSubDepartment(e.target.value);
                        setMainPosition('');
                      }}
                      className="w-full p-2.5 bg-gray-50 rounded border border-gray-200 focus:outline-none focus:border-gray-300 text-sm"
                    >
                      <option value="">Select Sub Department</option>
                      {Object.keys(departmentStructure[department] || {}).map((subDept) => (
                        <option key={subDept} value={subDept}>{subDept}</option>
                      ))}
                    </select>
                  </div>
                )}

                {subDepartment && (
                  <div>
                    <label className="block text-gray-700 text-sm mb-1.5">
                      Main Position <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={mainPosition}
                      onChange={(e) => setMainPosition(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 rounded border border-gray-200 focus:outline-none focus:border-gray-300 text-sm"
                    >
                      <option value="">Select Position</option>
                      {(departmentStructure[department]?.[subDepartment] || []).map((position) => (
                        <option key={position} value={position}>{position}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Joining Date Input */}
                <div>
                  <label className="block text-gray-700 text-sm mb-1.5">
                    Joining Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={joiningDate}
                    onChange={(e) => setJoiningDate(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 rounded border border-gray-200 focus:outline-none focus:border-gray-300 text-sm"
                  />
                </div>
                <div>

                </div>

                {/* Submit Button - New Stylish Version */}
                <div className="flex justify-end ">

                <button
                  type="submit"
                  disabled={isLoading}
                  className="col-span-1 md:col-span-2 mt-4 relative inline-flex items-center justify-center px-8 py-2.5 
                           bg-gradient-to-r from-yellow-400 to-yellow-500
                           text-black text-sm font-semibold tracking-wide
                           rounded-full shadow-md w-6/12
                           transform transition-all duration-500 ease-in-out
                           hover:scale-[1.02] hover:shadow-lg
                           active:scale-[0.98]
                           disabled:opacity-50 disabled:cursor-not-allowed
                           group overflow-hidden "
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span className="ml-1">Processing...</span>
                    </div>
                  ) : (
                    <>
                      <span className="relative z-10 w-24 mx-auto">Register</span>
                      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-yellow-500 to-yellow-600 
                                    opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-1/4 mx-auto" />
                      <div className="absolute right-2 transform translate-x-8 group-hover:translate-x-0 transition-transform duration-300 w-4 mx-auto">
                        →
                      </div>
                    </>
                  )}
                </button>
                </div>
              </form>
            ) : (
              // OTP Verification Form
              <form onSubmit={handleOTPVerification} className="space-y-4">
                <div className="text-center mb-4">
                  <h2 className="text-xl font-semibold">Verify Your Email</h2>
                  <p className="text-gray-600 mt-2">
                    Enter the OTP sent to {registeredEmail}
                  </p>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm mb-1.5">
                    OTP <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOTP(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 rounded border border-gray-200 focus:outline-none focus:border-gray-300 text-sm"
                    placeholder="Enter OTP"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full relative inline-flex items-center justify-center px-8 py-2.5 
                           bg-gradient-to-r from-yellow-400 to-yellow-500
                           text-black text-sm font-semibold tracking-wide
                           rounded-full shadow-md
                           transform transition-all duration-500 ease-in-out
                           hover:scale-[1.02] hover:shadow-lg
                           active:scale-[0.98]
                           disabled:opacity-50 disabled:cursor-not-allowed
                           group overflow-hidden"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Verifying...</span>
                    </div>
                  ) : (
                    'Verify OTP'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        className="mt-16" // Add some top margin to prevent overlap with the logo
      />
    </div>
  );
};

export default Register;
