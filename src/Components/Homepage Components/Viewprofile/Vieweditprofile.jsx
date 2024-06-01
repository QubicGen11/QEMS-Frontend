import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./Vieweditprofile.css";
import Cookies from 'js-cookie';

const ViewEditProfile = ({ employeeId }) => {
    const userEmail = Cookies.get('email');
    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        dob: '',
        gender: '',
        address: '',
        education: '',
        skills:'',
        phone: '',
        position: '',
        email: '',
        linkedin: '',
        about: '',
        companyEmail: userEmail
    });
    const [imagePreview, setImagePreview] = useState("https://res.cloudinary.com/defsu5bfc/image/upload/v1717093278/facebook_images_f7am6j.webp");
    const [hover, setHover] = useState(false);
    const fileInputRef = useRef(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
            setFormData({ ...formData, employeeImg: file });
        }
    };

    const handleClickImage = async () => {
        const form = new FormData();
        form.append('employeeImg', formData.employeeImg);
        form.append('companyEmail', formData.companyEmail);

        try {
            const response = await axios.post('http://localhost:3000/qubinest/employee/upload', form, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            toast.success('Image uploaded successfully');
        } catch (error) {
            toast.error('Failed to upload image');
            console.error('Upload error:', error);
        }
    };

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
        for (const key in formData) {
            if (formData[key] === '') {
                toast.error(`${key} is required`);
                return;
            }
        }

        try {
            if (employeeId) {
                const response = await axios.put(`http://localhost:3000/qubinest/employees/${employeeId}`, formData);
                toast.success('Employee updated successfully');
            } else {
                const response = await axios.post('http://localhost:3000/qubinest/employees', formData);
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
                skills:'',
                linkedin: '',
                education: '',
                about: '',
                companyEmail: userEmail
            });
        } catch (error) {
            console.error('Error submitting form:', error);
            toast.error('Error submitting form');
        }
    };

    return (
        <div className="tab-pane fade" id="profile-tab-pane" role="tabpanel" aria-labelledby="profile-tab" tabIndex={0}>
            <form onSubmit={handleSubmit} className="row gy-3 gy-xxl-4">
                <div className="col-12 col-md-12 flex">
                    <div className="text-start"
                        onMouseEnter={() => setHover(true)}
                        onMouseLeave={() => setHover(false)}
                        style={{ position: 'relative', display: 'inline-block' }}>
                        <img
                            className="profile-user-img img-fluid img-circle"
                            src={imagePreview}
                            alt="User profile picture"
                            onClick={() => fileInputRef.current.click()}
                            style={{ cursor: 'pointer', width: '120px', height: '120px' }}
                        />
                        {hover && (
                            <div style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                color: 'white',
                                fontSize: '17px',
                                pointerEvents: 'none'
                            }}>
                                Edit
                            </div>
                        )}
                        <input
                            type="file"
                            id="imageUpload"
                            accept="image/*"
                            onChange={handleImageChange}
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                        />
                    </div>
                </div>
                <div className="col-12 col-md-6">
                    <label htmlFor="inputFirstName" className="form-label">First Name <span>*</span> </label>
                    <input type="text" className="form-control" id="inputFirstName" name="firstname" value={formData.firstname} onChange={handleChange} />
                </div>
                <div className="col-12 col-md-6">
                    <label htmlFor="inputLastName" className="form-label">Last Name<span>*</span> </label>
                    <input type="text" className="form-control" id="inputLastName" name="lastname" value={formData.lastname} onChange={handleChange} />
                </div>
                <div className="col-12 col-md-6">
                    <label htmlFor="inputDob" className="form-label">Date of Birth<span>*</span> </label>
                    <input type="date" className="form-control" id="inputDob" name="dob" value={formData.dob} onChange={handleChange} />
                </div>
                <div className="col-12 col-md-6">
                    <label className="form-label">Gender<span>*</span> </label>
                    <div>
                        <label>
                            <input
                                type="radio"
                                name="gender"
                                value="male"
                                checked={formData.gender === "male"}
                                onChange={handleChange}
                                className='mx-2'
                            />
                            Male
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="gender"
                                value="female"
                                checked={formData.gender === "female"}
                                onChange={handleChange}
                                className='mx-2'
                            />
                            Female
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="gender"
                                value="other"
                                checked={formData.gender === "other"}
                                onChange={handleChange}
                                className='mx-2'
                            />
                            Other
                        </label>
                    </div>
                </div>
                <div className="col-12">
                    <label htmlFor="inputAddress" className="form-label">Address<span>*</span> </label>
                    <input type="text" className="form-control" id="inputAddress" name="address" value={formData.address} onChange={handleChange} />
                </div>
                <div className="col-12">
                    <label htmlFor="inputEducation" className="form-label">Education<span>*</span> </label>
                    <input type="text" className="form-control" id="inputEducation" name="education" value={formData.education} onChange={handleChange} />
                </div>
                <div className="col-12">
                    <label htmlFor="inputEducation" className="form-label">Skills<span>*</span> </label>
                    <input type="text" className="form-control" id="inputSkill" name="skills" value={formData.skills} onChange={handleChange} />
                </div>
                <div className="col-12 col-md-6">
                    <label htmlFor="inputPhone" className="form-label">Phone<span>*</span> </label>
                    <input type="text" className="form-control" id="inputPhone" name="phone" value={formData.phone} onChange={handleChange} />
                </div>
                <div className="col-12 col-md-6">
                    <label htmlFor="inputPosition" className="form-label">Position<span>*</span> </label>
                    <input type="text" className="form-control" id="inputPosition" name="position" value={formData.position} onChange={handleChange} />
                </div>
                <div className="col-12 col-md-6">
                    <label htmlFor="inputEmail" className="form-label">Email<span>*</span> </label>
                    <input type="email" className="form-control" id="inputEmail" name="email" value={formData.email} onChange={handleChange} />
                </div>
                <div className="col-12 col-md-6">
                    <label htmlFor="inputLinkedin" className="form-label">LinkedIn<span>*</span> </label>
                    <input type="text" className="form-control" id="inputLinkedin" name="linkedin" value={formData.linkedin} onChange={handleChange} />
                </div>
                <div className="col-12">
                    <label htmlFor="inputAbout" className="form-label">About<span>*</span> </label>
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
