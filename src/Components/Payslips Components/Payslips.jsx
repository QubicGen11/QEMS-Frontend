import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../Homepage Components/Header';
import Sidemenu from '../Homepage Components/Sidemenu';
import Footer from '../Homepage Components/Footer';
import axios from 'axios';
import Cookies from 'js-cookie';
import Loading from '../loadingComponents/Loading'
import config from '../config';
// import './Payslips.css';

const Payslips = () => {
    const { id } = useParams(); // Get employeeId from the URL parameters
    const [payslipContent, setPayslipContent] = useState('');
    const [selectedPayslip, setSelectedPayslip] = useState('current'); // Default payslip type
    const [loading, setLoading] = useState(false); // Loading state

    const payslipTypes = {
        current: 'Current Payslip',
        previous: 'Previous Payslip',
        annual: 'Annual Payslip'
    };  

    const fetchPayslip = async (employeeId, type) => {
        console.log('Fetching payslip for:', { employeeId, type }); // Debugging line
        setLoading(true); // Start loading
        try {
            const response = await axios.get(`${config.apiUrl}/documents/payslip/${employeeId}`, {
                headers: {
                    'Content-Type': 'text/html',
                },
            });
            console.log('Payslip fetched successfully:', response.data); // Debugging line
            setPayslipContent(response.data);
        } catch (error) {
            console.error('Error fetching payslip:', error);
        } finally {
            setLoading(false); // Stop loading
        }
    };

    useEffect(() => {
        const employeeId = id || Cookies.get('employee_id'); // Get employee ID from URL or cookie
        console.log('Employee ID:', employeeId); // Debugging line
        if (employeeId) {
            fetchPayslip(employeeId, selectedPayslip); // Fetch payslip when the component mounts or selectedPayslip changes
        } else {
            console.error('No employee ID found'); // Error handling
        }
    }, [id, selectedPayslip]);

    const handlePayslipChange = (type) => {
        setSelectedPayslip(type);
        const employeeId = id || Cookies.get('employee_id'); // Get employee ID from URL or cookie
        console.log('Payslip type changed to:', type); // Debugging line
        if (employeeId) {
            fetchPayslip(employeeId, type); // Fetch payslip when the payslip type changes
        } else {
            console.error('No employee ID found when changing payslip type'); // Error handling
        }
    };

    const handleDownloadHTML = () => {
        const element = document.querySelector('.payslipviewing');
        const htmlContent = element.innerHTML;
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedPayslip}-payslip.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleRedirect = () => {
        localStorage.setItem('payslipContent', payslipContent);
        const newWindow = window.open('/payslipsnewone', '_blank');
        newWindow.focus();
    };

    return (
        <>
            <Header />
            <Sidemenu />
            <div className="content-wrapper bg-white">
                <h1 className="text-3xl px-10">Payslips</h1>
                <div className="mainoptions flex gap-3 ml-4">
                    <div className="dropdown">
                        <button className="btn btn-warning dropdown-toggle font-bold" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            {payslipTypes[selectedPayslip] || 'Select Payslip'}
                        </button>
                        <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                            {Object.entries(payslipTypes).map(([type, name]) => (
                                <a className="dropdown-item" href="#" key={type} onClick={() => handlePayslipChange(type)}>{name}</a>
                            ))}
                        </div>
                    </div>

                    <div>
                        <button className="cursor-pointer bg-gray-800 px-3 py-2 rounded-md flex text-white tracking-wider shadow-xl animate-bounce hover:animate-none" onClick={handleDownloadHTML}>
                            <svg className="w-5 h-5" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" strokeLinejoin="round" strokeLinecap="round" />
                            </svg>
                            <h1 className='text-sm'>Download HTML</h1>
                        </button>
                    </div>
                    
                    <div>
                        <button className="cursor-pointer bg-gray-800 px-3 py-2 rounded-md flex text-white tracking-wider shadow-xl animate-bounce hover:animate-none" onClick={handleRedirect}>
                            <svg className="w-5 h-5" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" strokeLinejoin="round" strokeLinecap="round" />
                            </svg>
                            <h1 className='text-sm'>Download PDF</h1>
                        </button>
                    </div>
                </div>  

                <div className="payslipviewing h-auto w-auto ml-4 relative" id="payslip-content">
                    {loading ? (
                        <div className="text-center"><Loading/></div>
                    ) : (
                        <div dangerouslySetInnerHTML={{ __html: payslipContent }}></div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Payslips;