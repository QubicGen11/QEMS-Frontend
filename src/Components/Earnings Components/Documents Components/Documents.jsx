import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../../Homepage Components/Header';
import Sidemenu from '../../Homepage Components/Sidemenu';
import Footer from '../../Homepage Components/Footer';
import axios from 'axios';
import Cookies from 'js-cookie';

export const Documents = () => {
    const { id } = useParams(); // Get employeeId from the URL parameters
    const [documentContent, setDocumentContent] = useState('');
    const [selectedDocument, setSelectedDocument] = useState('offer'); // Default document type

    const fetchDocument = async (employeeId, type) => {
        console.log('Fetching document for:', { employeeId, type }); // Debugging line
        try {
            const response = await axios.get(`http://localhost:3000/documents/${type}/${employeeId}`, {
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

    return (
        <>
            <Header />
            <Sidemenu />
            <div className="content-wrapper bg-white">
                <h1 className="text-3xl px-10">Documents</h1>
                <div className="mainoptions flex gap-3 mt-3 ml-4">
                    <div className="dropdown">
                        <button className="btn btn-warning dropdown-toggle font-bold" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            Select Document
                        </button>
                        <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                            <a className="dropdown-item" href="#" onClick={() => handleDocumentChange('offer')}>Offer Letter</a>
                            <a className="dropdown-item" href="#" onClick={() => handleDocumentChange('joining')}>Joining Letter</a>
                            <a className="dropdown-item" href="#" onClick={() => handleDocumentChange('experience')}>Experience Letter</a>
                            <a className="dropdown-item" href="#" onClick={() => handleDocumentChange('hike')}>Hike Letter</a>
                        </div>
                    </div>
                </div>
                <div
                    className="containerviewing h-96 w-auto mt-10 ml-4"
                    dangerouslySetInnerHTML={{ __html: documentContent }}
                ></div>
            </div>
            <Footer />
        </>
    );
};

export default Documents;
