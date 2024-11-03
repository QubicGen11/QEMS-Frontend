import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import "./Vieweditprofile.css";
import config from '../../config';
import useEmployeeStore from '../../../store/employeeStore';
import debounce from 'lodash/debounce';

const ViewEditProfile = () => {
  const email = Cookies.get('email');
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    dob: '',
    gender: '',
    address: '',
    education: '',
    skills: '',
    phone: '',
    email: '',
    linkedin: '',
    about: '',
    companyEmail: email,
    employeeImg: null
  });
  const [employeeId, setEmployeeId] = useState(null);
  const [imagePreview, setImagePreview] = useState("https://res.cloudinary.com/defsu5bfc/image/upload/v1717093278/facebook_images_f7am6j.webp");
  const [hover, setHover] = useState(false);
  const fileInputRef = useRef(null);
  const { updateEmployeeData, forceRefresh } = useEmployeeStore();

  useEffect(() => {
    const fetchEmployeeData = async () => {
      if (!email) {
        toast.error('No email found in cookies');
        return;
      }
      try {
        const response = await axios.get(`${config.apiUrl}/qubinest/getemployees/${email}`);
        if (response.data) {
          const employee = response.data;
          setFormData({
            ...employee,
            dob: employee.dob.split('T')[0],
            companyEmail: email
          });
          setEmployeeId(employee.employee_id);
          setImagePreview(employee.employeeImg || "https://res.cloudinary.com/defsu5bfc/image/upload/v1717093278/facebook_images_f7am6j.webp");
          localStorage.setItem('employeeData', JSON.stringify(employee)); // Store data in local storage
        } else {
          toast.error('No employee data found');
        }
      } catch (error) {
        console.error('Error fetching employee data:', error);
      }
    };

    // Check if employee data is already in local storage
    const storedEmployeeData = localStorage.getItem('employeeData');
    if (storedEmployeeData) {
      const employee = JSON.parse(storedEmployeeData);
      setFormData({
        ...employee,
        dob: employee.dob.split('T')[0],
        companyEmail: email
      });
      setEmployeeId(employee.employee_id);
      setImagePreview(employee.employeeImg || "https://res.cloudinary.com/defsu5bfc/image/upload/v1717093278/facebook_images_f7am6j.webp");
    } else {
      fetchEmployeeData();
    }
  }, [email]);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (e.g., max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    try {
      // Show preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData(prev => ({ ...prev, employeeImg: reader.result }));
      };
      reader.readAsDataURL(file);

    } catch (error) {
      console.error('Error handling image:', error);
      toast.error('Error uploading image');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Update UI immediately
    e.target.value = value;
    // Debounce the state update
    debouncedHandleChange(name, value);
  };

  // Add debounced form updates
  const debouncedHandleChange = debounce((name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, 300);

  // Add cleanup for debounce
  useEffect(() => {
    return () => {
      debouncedHandleChange.cancel();
    };
  }, []);

  // Add optimistic update function
  const optimisticUpdate = (newData) => {
    // Update local storage immediately
    localStorage.setItem('employeeData', JSON.stringify(newData));
    localStorage.setItem('employeeInfo', JSON.stringify(newData));
    
    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('employeeDataUpdated', { detail: newData }));
  };

  // Optimized handleSubmit function
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Define required fields explicitly
    const requiredFields = [
      'firstname',
      'lastname',
      'dob',
      'gender',
      'address',
      'education',
      'skills',
      'phone',
      'email',
      'linkedin',
      'about'
    ];

    // Check only the defined required fields
    const emptyFields = requiredFields.filter(field => !formData[field]);
    
    if (emptyFields.length > 0) {
      toast.error(`${emptyFields[0]} is required`);
      return;
    }

    const loadingToast = toast.loading('Updating profile...');
    
    try {
      // Optimistic update
      optimisticUpdate(formData);
      
      // Make API call
      const apiCall = employeeId
        ? axios.put(`${config.apiUrl}/qubinest/employees/${employeeId}`, formData)
        : axios.post(`${config.apiUrl}/qubinest/employees`, formData);

      const response = await apiCall;
      
      if (!employeeId) {
        const newEmployeeId = response.data.employee_id;
        setEmployeeId(newEmployeeId);
        Cookies.set('employee_id', newEmployeeId);
      }

      // Update store
      await updateEmployeeData(formData.companyEmail);
      
      toast.update(loadingToast, {
        render: "Profile updated successfully",
        type: "success",
        isLoading: false,
        autoClose: 2000
      });

      navigate('/viewprofile/personal-details');

    } catch (error) {
      console.error('Error submitting form:', error);
      toast.update(loadingToast, {
        render: "Error updating profile",
        type: "error",
        isLoading: false,
        autoClose: 2000
      });
    }
  };

  return (
    <div className="tab-pane fade show active" id="profile-tab-pane" role="tabpanel" aria-labelledby="profile-tab" tabIndex={0}>
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
              name="file"
              accept="image/*"
              onChange={handleImageChange}
              ref={fileInputRef}
              style={{ display: 'none' }}
            />
          </div>
        </div>
        <div className="col-12 col-md-6">
          <label htmlFor="inputFirstName" className="form-label">First Name <span>*</span></label>
          <input type="text" className="form-control" id="inputFirstName" name="firstname" value={formData.firstname} onChange={handleChange} />
        </div>
        <div className="col-12 col-md-6">
          <label htmlFor="inputLastName" className="form-label">Last Name<span>*</span></label>
          <input type="text" className="form-control" id="inputLastName" name="lastname" value={formData.lastname} onChange={handleChange} />
        </div>
        <div className="col-12 col-md-6">
          <label htmlFor="inputDob" className="form-label">Date of Birth<span>*</span></label>
          <input type="date" className="form-control" id="inputDob" name="dob" value={formData.dob} onChange={handleChange} />
        </div>
        <div className="col-12 col-md-6">
          <label className="form-label">Gender<span>*</span></label>
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
          <label htmlFor="inputAddress" className="form-label">Address<span>*</span></label>
          <input type="text" className="form-control" id="inputAddress" name="address" value={formData.address} onChange={handleChange} />
        </div>
        <div className="col-12">
          <label htmlFor="inputEducation" className="form-label">Education<span>*</span></label>
          <input type="text" className="form-control" id="inputEducation" name="education" value={formData.education} onChange={handleChange} />
        </div>
        <div className="col-12">
          <label htmlFor="inputSkill" className="form-label">Skills<span>*</span></label>
          <input type="text" className="form-control" id="inputSkill" name="skills" value={formData.skills} onChange={handleChange} />
        </div>
        <div className="col-12 col-md-6">
          <label htmlFor="inputPhone" className="form-label">Phone<span>*</span></label>
          <input type="text" className="form-control" id="inputPhone" name="phone" value={formData.phone} onChange={handleChange} />
        </div>
        <div className="col-12 col-md-6">
          <label htmlFor="inputEmail" className="form-label">Personal Email<span>*</span></label>
          <input type="email" className="form-control" id="inputEmail" name="email" value={formData.email} onChange={handleChange} />
        </div>
        <div className="col-12 col-md-12">
          <label htmlFor="inputLinkedin" className="form-label">LinkedIn<span>*</span></label>
          <input type="text" className="form-control" id="inputLinkedin" name="linkedin" value={formData.linkedin} onChange={handleChange} />
        </div>
        <div className="col-12">
          <label htmlFor="inputAbout" className="form-label">About<span>*</span></label>
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
