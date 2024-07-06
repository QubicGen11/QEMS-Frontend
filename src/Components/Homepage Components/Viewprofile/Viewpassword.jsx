import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Cookies from 'js-cookie';

const Viewpassword = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const email = Cookies.get('email');

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.error('New password and confirm password do not match');
            return;
        }

        try {
            const response = await axios.put('http://localhost:3000/qubinest/changepassword', {
                email, // replace with the actual user email
                currentPassword,
                newPassword
            });

            if (response.status === 200) {
                toast.success('Password changed successfully');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                toast.error(response.data);
            }
        } catch (error) {
            toast.error('Error changing password: ' + error.response.data);
        }
    };

    return (
        <div className="tab-pane fade show active" id="password-tab-pane" role="tabpanel" aria-labelledby="password-tab" tabIndex={0}>
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
                        />
                    </div>
                    <div className="col-12">
                        <button type="submit" className="btn btn-primary">Change Password</button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default Viewpassword;
