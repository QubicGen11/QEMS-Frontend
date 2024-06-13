import React, { useEffect, useState } from 'react';

const Documentsnewone = () => {
    const [documentContent, setDocumentContent] = useState('');

    useEffect(() => {
        const content = localStorage.getItem('documentContent');
        setDocumentContent(content);
        
        if (content) {
            // Automatically trigger the print dialog
            window.print();
        }
    }, []);

    return (
        <div
            className="containerviewing"
            dangerouslySetInnerHTML={{ __html: documentContent }}
        ></div>
    );
};

export default Documentsnewone;
