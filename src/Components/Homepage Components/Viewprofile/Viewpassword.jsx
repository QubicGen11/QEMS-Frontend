import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Cookies from 'js-cookie';

const Viewpassword = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const email = Cookies.get('email');

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);

        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error('Please fill all password fields');
            setIsLoading(false);
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('New password and confirm password do not match');
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.put('http://localhost:3000/qubinest/changepassword', {
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
                        <input
                            type="password"
                            className="form-control"
                            id="currentPassword"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <div className="col-12">
                        <label htmlFor="newPassword" className="form-label">New Password</label>
                        <input
                            type="password"
                            className="form-control"
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <div className="col-12">
                        <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                        <input
                            type="password"
                            className="form-control"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            disabled={isLoading}
                        />
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
