import React, { useEffect, useState } from 'react';

const Payslipsnewone = () => {
    const [payslipContent, setPayslipContent] = useState('');

    useEffect(() => {
        const content = localStorage.getItem('payslipContent');
        setPayslipContent(content);
        
        if (content) {
            // Automatically trigger the print dialog
            window.print();
        }
    }, []);

    return (
        <div
            className="payslipviewing"
            dangerouslySetInnerHTML={{ __html: payslipContent }}
        ></div>
    );
};

export default Payslipsnewone;
