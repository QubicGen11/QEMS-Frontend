import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../../Homepage Components/Header';
import Sidemenu from '../../Homepage Components/Sidemenu';
import Footer from '../../Homepage Components/Footer';
import axios from 'axios';
import Cookies from 'js-cookie';
import './Documents.css';
import config from '../../config';


export const Documents = () => {
    const { id } = useParams(); // Get employeeId from the URL parameters
    const [documentContent, setDocumentContent] = useState('');
    const [selectedDocument, setSelectedDocument] = useState('offer'); // Default document type

    const documentTypes = {
        offer: 'Offer Letter',
        joining: 'Joining Letter',  
        experience: 'Experience Letter',
        hike: 'Hike Letter'
    };

    const fetchDocument = async (employeeId, type) => {
        console.log('Fetching document for:', { employeeId, type }); // Debugging line
        try {
            const response = await axios.get(`${config.apiUrl}/documents/${type}/${employeeId}`, {
                headers: {
                    'Content-Type': 'text/html',
                },
            });
            console.log('Document fetched successfully:', response.data); // Debugging line
            setDocumentContent(response.data);
        } catch (error) {
            console.error('Error fetching document:', error);
        }
    };

    useEffect(() => {
        const employeeId = id || Cookies.get('employee_id'); // Get employee ID from URL or cookie
        console.log('Employee ID:', employeeId); // Debugging line
        if (employeeId) {
            fetchDocument(employeeId, selectedDocument); // Fetch document when the component mounts or selectedDocument changes
        } else {
            console.error('No employee ID found'); // Error handling
        }
    }, [id, selectedDocument]);

    const handleDocumentChange = (type) => {
        setSelectedDocument(type);
        const employeeId = id || Cookies.get('employee_id'); // Get employee ID from URL or cookie
        console.log('Document type changed to:', type); // Debugging line
        if (employeeId) {
            fetchDocument(employeeId, type); // Fetch document when the document type changes
        } else {
            console.error('No employee ID found when changing document type'); // Error handling
        }
    };

    const handleDownloadHTML = () => {
        const element = document.querySelector('.containerviewing');
        const htmlContent = element.innerHTML;
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedDocument}-document.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleRedirect = () => {
        localStorage.setItem('documentContent', documentContent);
        const newWindow = window.open('/documentsnewone', '_blank');
        newWindow.focus();
    };

    return (
        <>
            <Header />
            <Sidemenu />
            <div className="content-wrapper bg-white">
                <h1 className="text-3xl px-10">Documents</h1>
                <div className="mainoptions flex gap-3 ml-4">
                    <div className="dropdown">
                        <button className="btn btn-warning dropdown-toggle font-bold" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            {documentTypes[selectedDocument] || 'Select Document'}
                        </button>
                        <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                            {Object.entries(documentTypes).map(([type, name]) => (
                                <a className="dropdown-item" href="#" key={type} onClick={() => handleDocumentChange(type)}>{name}</a>
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

                <div
                    className="containerviewing h-auto w-auto ml-4 relative" id="document-content"
                    dangerouslySetInnerHTML={{ __html: documentContent }}
                ></div>
            </div>
            <Footer />
        </>
    );
};

export default Documents;
