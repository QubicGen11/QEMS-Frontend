import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import config from '../config';

const Editbankdetails = ({ canEdit }) => {
    const [isAdmin, setIsAdmin] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [employees, setEmployees] = useState([]);
    const [formData, setFormData] = useState({
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        panNumber: '',
        aadharNumber: '',
        pfNumber: ''
    });
    const employee_id = Cookies.get('employee_id');
    const navigate = useNavigate();

    // First fetch all users and check if current user is admin
    useEffect(() => {
        const checkAdminAndFetchUsers = async () => {
            try {
                // Check if current user is admin
                const userResponse = await axios.get(`${config.apiUrl}/qubinest/getemployees/${Cookies.get('email')}`);
                const isUserAdmin = userResponse.data.users[0]?.role === 'Admin';
                setIsAdmin(isUserAdmin);

                if (isUserAdmin) {
                    // Get all users if admin
                    const allUsersResponse = await axios.get(`${config.apiUrl}/qubinest/allusers`);
                    setEmployees(allUsersResponse.data);
                }
            } catch (error) {
                console.error('Error:', error);
                toast.error('Error fetching users data');
            }
        };

        checkAdminAndFetchUsers();
    }, []);

    // Fetch bank details when an employee is selected
    useEffect(() => {
        const fetchBankDetails = async () => {
            try {
                if (selectedEmployee) {
                    const response = await axios.get(`${config.apiUrl}/api/bankdetails/${selectedEmployee}`);
                    if (response.data) {
                        setFormData(response.data);
                    }
                }
            } catch (error) {
                console.error('Error fetching bank details:', error);
                toast.error('Error fetching bank details');
            }
        };

        fetchBankDetails();
    }, [selectedEmployee]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!selectedEmployee) {
                toast.error('Please select an employee');
                return;
            }

            await axios.post(`${config.apiUrl}/api/bankdetails/${selectedEmployee}`, formData);
            toast.success('Bank details updated successfully');
            navigate('/profile/bank-details');
        } catch (error) {
            console.error('Error submitting form:', error);
            toast.error('Error updating bank details');
        }
    };

    return (
        <div className="tab-pane fade show active">
            {isAdmin ? (
                <form onSubmit={handleSubmit} className="row gy-3">
                    <div className="col-12">
                        <label className="form-label">Select Employee</label>
                        <select 
                            className="form-select" 
                            value={selectedEmployee} 
                            onChange={(e) => setSelectedEmployee(e.target.value)}
                        >
                            <option value="">Select an employee</option>
                            {employees.map(emp => (
                                <option key={emp.employeeId} value={emp.employeeId}>
                                    {emp.username} ({emp.email})
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedEmployee && (
                        <>
                            <div className="col-12 col-md-6">
                                <label htmlFor="bankName" className="form-label">Bank Name<span>*</span></label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    id="bankName" 
                                    name="bankName" 
                                    value={formData.bankName} 
                                    onChange={handleChange} 
                                    required
                                />
                            </div>
                            <div className="col-12 col-md-6">
                                <label htmlFor="accountNumber" className="form-label">Account Number<span>*</span></label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    id="accountNumber" 
                                    name="accountNumber" 
                                    value={formData.accountNumber} 
                                    onChange={handleChange} 
                                    required
                                />
                            </div>
                            <div className="col-12 col-md-6">
                                <label htmlFor="ifscCode" className="form-label">IFSC Code<span>*</span></label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    id="ifscCode" 
                                    name="ifscCode" 
                                    value={formData.ifscCode} 
                                    onChange={handleChange} 
                                    required
                                />
                            </div>
                            <div className="col-12 col-md-6">
                                <label htmlFor="panNumber" className="form-label">Pan Number<span>*</span></label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    id="panNumber" 
                                    name="panNumber" 
                                    value={formData.panNumber} 
                                    onChange={handleChange} 
                                    required
                                />
                            </div>
                            <div className="col-12 col-md-6">
                                <label htmlFor="aadharNumber" className="form-label">Aadhar Number<span>*</span></label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    id="aadharNumber" 
                                    name="aadharNumber" 
                                    value={formData.aadharNumber} 
                                    onChange={handleChange} 
                                    required
                                />
                            </div>
                            <div className="col-12 col-md-6">
                                <label htmlFor="pfNumber" className="form-label">PF Number<span>*</span></label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    id="pfNumber" 
                                    name="pfNumber" 
                                    value={formData.pfNumber} 
                                    onChange={handleChange} 
                                    required
                                />
                            </div>
                            <div className="col-12">
                                <button 
                                    type="submit" 
                                    className="btn btn-primary"
                                >
                                    Submit
                                </button>
                            </div>
                        </>
                    )}
                </form>
            ) : (
                <div className="alert alert-warning">
                    Only administrators can edit bank details.
                </div>
            )}
        </div>
    );
};

export default Editbankdetails;