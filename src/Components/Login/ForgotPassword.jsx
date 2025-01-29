import React, { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import config from "../config";

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Password validation state
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasSpecial: false,
  });

  const validatePassword = (password) => {
    const validations = {
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
    setPasswordValidation(validations);
    return Object.values(validations).every(Boolean);
  };

  const sendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${config.apiUrl}/qubinest/forgot-password`, {
        
        email,
      });
      toast.success(response.data.message || "OTP sent successfully!");
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyAndResetPassword = async (e) => {
    e.preventDefault();
    if (!validatePassword(newPassword)) {
      toast.error("Password does not meet the requirements");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`${config.apiUrl}/qubinest/verify-forgot-password-otp`, {
        email,
        otp,
        newPassword,

      });
      toast.success(response.data.message || "Password reset successfully!");
      setStep(1);
      setEmail("");
      setOtp("");
      setNewPassword("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center">
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

      {/* Modal Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-white p-8 rounded-xl shadow-lg z-10 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-center text-gray-800">
          Forgot Password
        </h2>
        {step === 1 ? (
          <form onSubmit={sendOtp} className="mt-6 space-y-4">
            <div className="relative">
              <FiMail className="absolute top-3 left-3 text-gray-400" />
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-10 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={verifyAndResetPassword} className="mt-6 space-y-4">
            <div className="relative">
              <FiMail className="absolute top-3 left-3 text-gray-400" />
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-10 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="relative">
              <FiLock className="absolute top-3 left-3 text-gray-400" />
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                className="w-full px-10 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="relative">
              <FiLock className="absolute top-3 left-3 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  validatePassword(e.target.value);
                }}
                required
                className="w-full px-10 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center"
              >
                {showPassword ? <FiEyeOff className="text-gray-400" /> : <FiEye className="text-gray-400" />}
              </button>
            </div>

            {/* Password Validation */}
            <div className="text-sm space-y-1 mt-2 text-gray-600">
              <p>Password must contain:</p>
              <ul className="ml-4 list-disc">
                <li className={passwordValidation.minLength ? "text-green-500" : ""}>
                  At least 8 characters
                </li>
                <li className={passwordValidation.hasUpperCase ? "text-green-500" : ""}>
                  At least one uppercase letter
                </li>
                <li className={passwordValidation.hasLowerCase ? "text-green-500" : ""}>
                  At least one lowercase letter
                </li>
                <li className={passwordValidation.hasSpecial ? "text-green-500" : ""}>
                  At least one special character
                </li>
              </ul>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
      </motion.div>

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
};

export default ForgotPassword;
