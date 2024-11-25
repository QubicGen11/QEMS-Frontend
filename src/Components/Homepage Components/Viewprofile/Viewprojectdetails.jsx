import React, { useEffect } from 'react';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loading from '../../Loading Components/Loading';
import useEmployeeStore from '../../../store/employeeStore';

const Viewprojectdetails = () => {
    const email = Cookies.get('email');
    const { employeeData, updateEmployeeData } = useEmployeeStore();

    useEffect(() => {
        const fetchEmployeeData = async () => {
            try {
                if (!email) {
                    toast.error('No email found in cookies');
                    return;
                }
                await updateEmployeeData(email);
            } catch (error) {
                console.error('Error fetching employee data:', error);
                toast.error('Failed to fetch employee data');
            }
        };

        fetchEmployeeData();

        const handleDataUpdate = () => {
            fetchEmployeeData();
        };

        window.addEventListener('employeeDataUpdated', handleDataUpdate);

        return () => {
            window.removeEventListener('employeeDataUpdated', handleDataUpdate);
        };
    }, [email, updateEmployeeData]);

    if (!employeeData) {
        return <Loading />;
    }

    const user = employeeData.users?.[0];

    return (
        <div className="tab-pane fade show active" id="email-tab-pane" role="tabpanel" aria-labelledby="email-tab" tabIndex={0}>
            <h5 className="mb-3 text-2xl">Project Information</h5>
            <div className="row g-0">
                <div className="col-5 col-md-3 bg-light border-bottom border-white border-3">
                    <div className="p-2">Associate ID</div>
                </div>
                <div className="col-7 col-md-9 bg-light border-start border-bottom border-white border-3">
                    <div className="p-2">{employeeData.employee_id || 'N/A'}</div>
                </div>

                <div className="col-5 col-md-3 bg-light border-bottom border-white border-3">
                    <div className="p-2">Company Mail</div>
                </div>
                <div className="col-7 col-md-9 bg-light border-start border-bottom border-white border-3">
                    <div className="p-2">{employeeData.companyEmail || employeeData.email || 'N/A'}</div>
                </div>

                <div className="col-5 col-md-3 bg-light border-bottom border-white border-3">
                    <div className="p-2">Job</div>
                </div>
                <div className="col-7 col-md-9 bg-light border-start border-bottom border-white border-3">
                    <div className="p-2">{user?.mainPosition || 'N/A'}</div>
                </div>

                <div className="col-5 col-md-3 bg-light border-bottom border-white border-3">
                    <div className="p-2">Project Location</div>
                </div>
                <div className="col-7 col-md-9 bg-light border-start border-bottom border-white border-3">
                    <div className="p-2">{employeeData.location || 'Anantapur'}</div>
                </div>

                <div className="col-5 col-md-3 bg-light border-bottom border-white border-3">
                    <div className="p-2">Company</div>
                </div>
                <div className="col-7 col-md-9 bg-light border-start border-bottom border-white border-3">
                    <div className="p-2">{employeeData.company || 'QubicGen'}</div>
                </div>
            </div>
        </div>
    );
};

export default Viewprojectdetails;