import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Cookies from 'js-cookie';
import config from '../../config';

const Viewpassword = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const email = Cookies.get('email');

    const [passwordValidation, setPasswordValidation] = useState({
        minLength: false,
        hasUpperCase: false,
        hasLowerCase: false,
        hasNumber: false,
        hasSpecial: false
    });
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);

    // Regex to enforce password complexity
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    const validatePassword = (password) => {
        const validations = {
            minLength: password.length >= 8,
            hasUpperCase: /[A-Z]/.test(password),
            hasLowerCase: /[a-z]/.test(password),
            hasNumber: /\d/.test(password),
            hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };
        setPasswordValidation(validations);
        return Object.values(validations).every(Boolean);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);

        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error('Please fill all password fields');
            setIsLoading(false);
            return;
        }

        if (!validatePassword(newPassword)) {
            toast.error('Password does not meet requirements');
            setIsLoading(false);
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('New password and confirm password do not match');
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.put(`${config.apiUrl}/qubinest/changepassword`, {
                email,
                currentPassword,
                newPassword
            });

            if (response.status === 200) {
                toast.success(response.data.message || 'Password changed successfully');
                // Clear form
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error(error.response?.data?.message || 'Error changing password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="tab-pane fade show active" id="password-tab-pane" role="tabpanel" aria-labelledby="password-tab" tabIndex={0}>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
            
            <form onSubmit={handleSubmit}>
                <div className="row gy-3 gy-xxl-4">
                    <div className="col-12">
                        <label htmlFor="currentPassword" className="form-label">Current Password</label>
                        <div className="position-relative">
                            <input
                                type={showCurrentPassword ? "text" : "password"}
                                className="form-control"
                                id="currentPassword"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                            <span
                                className="position-absolute top-50 end-0 translate-middle-y pe-3 cursor-pointer"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                style={{ cursor: 'pointer' }}
                            >
                                {showCurrentPassword ? "🙈" : "👁️"}
                            </span>
                        </div>
                    </div>
                    <div className="col-12">
                        <label htmlFor="newPassword" className="form-label">New Password</label>
                        <div className="position-relative">
                            <input
                                type={showNewPassword ? "text" : "password"}
                                className="form-control"
                                id="newPassword"
                                value={newPassword}
                                onChange={(e) => {
                                    setNewPassword(e.target.value);
                                    validatePassword(e.target.value);
                                }}
                                onFocus={() => setIsPasswordFocused(true)}
                                onBlur={() => setIsPasswordFocused(false)}
                                required
                                disabled={isLoading}
                            />
                            <span
                                className="position-absolute top-50 end-0 translate-middle-y pe-3 cursor-pointer"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                style={{ cursor: 'pointer' }}
                            >
                                {showNewPassword ? "🙈" : "👁️"}
                            </span>
                        </div>
                        
                        {/* Password Requirements Checklist */}
                        {isPasswordFocused && (
                            <div className="password-requirements mt-2 small">
                                <p className="mb-1 text-muted">Password must contain:</p>
                                <ul className="list-unstyled">
                                    <li className={passwordValidation.minLength ? "text-success" : "text-danger"}>
                                        <i className={`fas fa-${passwordValidation.minLength ? 'check' : 'times'} me-2`}></i>
                                        At least 8 characters
                                    </li>
                                    <li className={passwordValidation.hasUpperCase ? "text-success" : "text-danger"}>
                                        <i className={`fas fa-${passwordValidation.hasUpperCase ? 'check' : 'times'} me-2`}></i>
                                        One uppercase letter
                                    </li>
                                    <li className={passwordValidation.hasLowerCase ? "text-success" : "text-danger"}>
                                        <i className={`fas fa-${passwordValidation.hasLowerCase ? 'check' : 'times'} me-2`}></i>
                                        One lowercase letter
                                    </li>
                                    <li className={passwordValidation.hasNumber ? "text-success" : "text-danger"}>
                                        <i className={`fas fa-${passwordValidation.hasNumber ? 'check' : 'times'} me-2`}></i>
                                        One number
                                    </li>
                                    <li className={passwordValidation.hasSpecial ? "text-success" : "text-danger"}>
                                        <i className={`fas fa-${passwordValidation.hasSpecial ? 'check' : 'times'} me-2`}></i>
                                        One special character
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                    <div className="col-12">
                        <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                        <div className="position-relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                className="form-control"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                            <span
                                className="position-absolute top-50 end-0 translate-middle-y pe-3 cursor-pointer"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                style={{ cursor: 'pointer' }}
                            >
                                {showConfirmPassword ? "🙈" : "👁️"}
                            </span>
                        </div>
                    </div>
                    <div className="col-12">
                        <button 
                            type="submit" 
                            className="btn btn-primary"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="d-flex align-items-center gap-2">
                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    <span>Updating Password...</span>
                                </div>
                            ) : (
                                'Change Password'
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default Viewpassword;