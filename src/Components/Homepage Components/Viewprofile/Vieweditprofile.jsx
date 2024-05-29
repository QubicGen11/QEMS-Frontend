import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const ViewEditProfile = ({ employeeId }) => {
    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        dob: '',
        gender: '',
        address: '',
        phone: '',
        position: '',
        email: '',
        linkedin: '',
        about: ''
    });
    useEffect(() => {
        const fetchEmployee = async () => {
            if (employeeId) {
                try {
                    const response = await axios.get(`http://localhost:3000/qubinest/employees/${employeeId}`);
                    setFormData(response.data);
                } catch (error) {
                    console.error('Error fetching employee:', error);
                    toast.error('Error fetching employee details');
                }
            }
        };

        fetchEmployee();
    }, [employeeId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (employeeId) {
                // Update existing employee
                const response = await axios.put(`http://localhost:3000/qubinest/employees/${employeeId}`, formData);
                console.log('Form updated successfully!', response.data);
                toast.success('Employee updated successfully');
            } else {
                // Create new employee
                const response = await axios.post('http://localhost:3000/qubinest/employees', formData);
                console.log('Form submitted successfully!', response.data);
                toast.success('Employee created successfully');
            }
            setFormData({
                firstname: '',
                lastname: '',
                dob: '',
                gender: '',
                address: '',
                phone: '',
                position: '',
                email: '',
                linkedin: '',
                about: ''
            });
        } catch (error) {
            console.error('Error submitting form:', error);
            toast.error('Error submitting form');
        }
    };

    return (
        <div className="tab-pane fade" id="profile-tab-pane" role="tabpanel" aria-labelledby="profile-tab" tabIndex={0}>
            <form onSubmit={handleSubmit} className="row gy-3 gy-xxl-4">
                <div className="col-12 col-md-6">
                    <label htmlFor="inputFirstName" className="form-label">First Name</label>
                    <input type="text" className="form-control" id="inputFirstName" name="firstname" value={formData.firstname} onChange={handleChange} />
                </div>
                <div className="col-12 col-md-6">
                    <label htmlFor="inputLastName" className="form-label">Last Name</label>
                    <input type="text" className="form-control" id="inputLastName" name="lastname" value={formData.lastname} onChange={handleChange} />
                </div>
                <div className="col-12 col-md-6">
                    <label htmlFor="inputDob" className="form-label">Date of Birth</label>
                    <input type="date" className="form-control" id="inputDob" name="dob" value={formData.dob} onChange={handleChange} />
                </div>
                <div className="col-12 col-md-6">
                    <label htmlFor="inputGender" className="form-label">Gender</label>
                    <input type="text" className="form-control" id="inputGender" name="gender" value={formData.gender} onChange={handleChange} />
                </div>
                <div className="col-12">
                    <label htmlFor="inputAddress" className="form-label">Address</label>
                    <input type="text" className="form-control" id="inputAddress" name="address" value={formData.address} onChange={handleChange} />
                </div>
                <div className="col-12 col-md-6">
                    <label htmlFor="inputPhone" className="form-label">Phone</label>
                    <input type="text" className="form-control" id="inputPhone" name="phone" value={formData.phone} onChange={handleChange} />
                </div>
                <div className="col-12 col-md-6">
                    <label htmlFor="inputPosition" className="form-label">Position</label>
                    <input type="text" className="form-control" id="inputPosition" name="position" value={formData.position} onChange={handleChange} />
                </div>
                <div className="col-12 col-md-6">
                    <label htmlFor="inputEmail" className="form-label">Email</label>
                    <input type="email" className="form-control" id="inputEmail" name="email" value={formData.email} onChange={handleChange} />
                </div>
                <div className="col-12 col-md-6">
                    <label htmlFor="inputLinkedin" className="form-label">LinkedIn</label>
                    <input type="text" className="form-control" id="inputLinkedin" name="linkedin" value={formData.linkedin} onChange={handleChange} />
                </div>
                <div className="col-12">
                    <label htmlFor="inputAbout" className="form-label">About</label>
                    <textarea className="form-control" id="inputAbout" name="about" value={formData.about} onChange={handleChange}></textarea>
                </div>
                <div className="col-12">
                    <button type="submit" className="btn btn-primary">Submit</button>
                </div>
            </form>
        </div>
    );
};
export default ViewEditProfile;
