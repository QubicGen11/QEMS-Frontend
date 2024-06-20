import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import config from '../config';

const Editbankdetails = ({ canEdit }) => {
    const employee_id = Cookies.get('employee_id');
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        panNumber: '',
        aadharNumber: '',
        pfNumber: ''
    });

    useEffect(() => {
        const fetchBankDetails = async () => {
            try {
                const response = await axios.get(`${config.apiUrl}/api/bankdetails/${employee_id}`);
                if (response.data) {
                    setFormData(response.data);
                }
            } catch (error) {
                console.error('Error fetching bank details:', error);
            }
        };

        fetchBankDetails();
    }, [employee_id]);

    useEffect(() => {
        const lastEditTimestamp = localStorage.getItem('lastEditTimestamp');
        if (lastEditTimestamp) {
            const lastEditDate = new Date(lastEditTimestamp);
            const currentDate = new Date();
            const diffTime = Math.abs(currentDate - lastEditDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays < 30) {
                toast.info(`You can edit your bank details after ${30 - diffDays} days`);
            } else {
                canEdit = true;
            }
        }
    }, [canEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!canEdit) {
            toast.error('You can only edit your bank details once every 30 days.');
            return;
        }

        try {
            await axios.post(`${config.apiUrl}/api/bankdetails/${employee_id}`, formData);
            toast.success('Bank details updated successfully');
            localStorage.setItem('lastEditTimestamp', new Date().toISOString());
            navigate('/profile/bank-details');
            window.location.reload();
        } catch (error) {
            console.error('Error submitting form:', error);
            toast.error('Error submitting form');
        }
    };

    return (
        <div className="tab-pane fade show active" id="edit-bank-details" role="tabpanel" aria-labelledby="edit-bank-details-tab" tabIndex={0}>
            <form onSubmit={handleSubmit} className="row gy-3 gy-xxl-4">
                <div className="col-12 col-md-6">
                    <label htmlFor="bankName" className="form-label">Bank Name<span>*</span></label>
                    <input type="text" className="form-control" id="bankName" name="bankName" value={formData.bankName} onChange={handleChange} disabled={!canEdit} />
                </div>
                <div className="col-12 col-md-6">
                    <label htmlFor="accountNumber" className="form-label">Account Number<span>*</span></label>
                    <input type="text" className="form-control" id="accountNumber" name="accountNumber" value={formData.accountNumber} onChange={handleChange} disabled={!canEdit} />
                </div>
                <div className="col-12 col-md-6">
                    <label htmlFor="ifscCode" className="form-label">IFSC Code<span>*</span></label>
                    <input type="text" className="form-control" id="ifscCode" name="ifscCode" value={formData.ifscCode} onChange={handleChange} disabled={!canEdit} />
                </div>
                <div className="col-12 col-md-6">
                    <label htmlFor="panNumber" className="form-label">Pan Number<span>*</span></label>
                    <input type="text" className="form-control" id="panNumber" name="panNumber" value={formData.panNumber} onChange={handleChange} disabled={!canEdit} />
                </div>
                <div className="col-12 col-md-6">
                    <label htmlFor="aadharNumber" className="form-label">Aadhar Number<span>*</span></label>
                    <input type="text" className="form-control" id="aadharNumber" name="aadharNumber" value={formData.aadharNumber} onChange={handleChange} disabled={!canEdit} />
                </div>
                <div className="col-12 col-md-6">
                    <label htmlFor="pfNumber" className="form-label">PF Number<span>*</span></label>
                    <input type="text" className="form-control" id="pfNumber" name="pfNumber" value={formData.pfNumber} onChange={handleChange} disabled={!canEdit} />
                </div>
                <div className="col-12">
                    <button type="submit" className="btn btn-primary" disabled={!canEdit}>Submit</button>
                </div>
            </form>
        </div>
    );
};

export default Editbankdetails;