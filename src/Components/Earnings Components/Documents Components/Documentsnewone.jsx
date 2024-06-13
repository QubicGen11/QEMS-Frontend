import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const Documentsnewone = () => {
    const location = useLocation();
    const { documentContent } = location.state || {};

    useEffect(() => {
        if (documentContent) {
            // Automatically trigger the print dialog
            window.print();
        }
    }, [documentContent]);

    return (
        <div
            className="containerviewing"
            dangerouslySetInnerHTML={{ __html: documentContent }}
        ></div>
    );
};

export default Documentsnewone;
