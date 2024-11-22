import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
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
  const [localFormData, setLocalFormData] = useState({
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
  
  const { employeeData, loading, updateEmployeeData } = useEmployeeStore();
  const [employeeId, setEmployeeId] = useState(null);
  const [imagePreview, setImagePreview] = useState("https://res.cloudinary.com/defsu5bfc/image/upload/v1717093278/facebook_images_f7am6j.webp");
  const [hover, setHover] = useState(false);
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  // Handle form changes with debounce
  const debouncedUpdate = useCallback(
    debounce((newData) => {
      setLocalFormData(newData);
    }, 300),
    []
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    e.persist();
    
    // Update UI immediately
    setLocalFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Debounce the actual state update
    debouncedUpdate({
      ...localFormData,
      [name]: value
    });
  };

  // Load data on mount
  useEffect(() => {
    if (email && !loading) {
      updateEmployeeData(email);
    }
  }, [email]);

  // Update local form when employee data changes
  useEffect(() => {
    if (employeeData) {
      setLocalFormData(prev => ({
        ...prev,
        ...employeeData,
        dob: employeeData.dob?.split('T')[0] || '',
      }));
      setEmployeeId(employeeData.employee_id);
      setImagePreview(employeeData.employeeImg || "https://res.cloudinary.com/defsu5bfc/image/upload/v1717093278/facebook_images_f7am6j.webp");
    }
  }, [employeeData]);

  // Cleanup
  useEffect(() => {
    return () => {
      debouncedUpdate.cancel();
    };
  }, [debouncedUpdate]);

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
        setLocalFormData(prev => ({ ...prev, employeeImg: reader.result }));
      };
      reader.readAsDataURL(file);

    } catch (error) {
      console.error('Error handling image:', error);
      toast.error('Error uploading image');
    }
  };

  // Add optimistic update function
  const optimisticUpdate = (newData) => {
    // Update local storage immediately
    localStorage.setItem('employeeData', JSON.stringify(newData));
    localStorage.setItem('employeeInfo', JSON.stringify(newData));
    
    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('employeeDataUpdated', { detail: newData }));
  };

  // Optimized handleSubmit function with loading state
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    


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
    const emptyFields = requiredFields.filter(field => !localFormData[field]);
    
    if (emptyFields.length > 0) {
      toast.error(`${emptyFields[0]} is required`);
      setIsLoading(false);
      return;
    }

    try {
      // Optimistic update
      optimisticUpdate(localFormData);
      
      // Make API call
      const apiCall = employeeId
        ? axios.put(`${config.apiUrl}/qubinest/employees/${employeeId}`, localFormData)
        : axios.post(`${config.apiUrl}/qubinest/employees`, localFormData);

      const response = await apiCall;
      
      if (!employeeId) {
        const newEmployeeId = response.data.employee_id;
        setEmployeeId(newEmployeeId);
        Cookies.set('employee_id', newEmployeeId);
      }

      // Update store
      await updateEmployeeData(localFormData.companyEmail);
      
      // Show success toast
      toast.success("Profile updated successfully!");
      
      // Wait a bit before navigating to ensure toast is visible
      setTimeout(() => {
        navigate('/viewprofile/personal-details');
      }, 2000);

    } catch (error) {
      console.error('Error submitting form:', error);
      // Show error toast
      toast.error(error.response?.data?.message || "Error updating profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
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
            <input type="text" className="form-control" id="inputFirstName" name="firstname" value={localFormData.firstname} onChange={handleChange} />
          </div>
          <div className="col-12 col-md-6">
            <label htmlFor="inputLastName" className="form-label">Last Name<span>*</span></label>
            <input type="text" className="form-control" id="inputLastName" name="lastname" value={localFormData.lastname} onChange={handleChange} />
          </div>
          <div className="col-12 col-md-6">
            <label htmlFor="inputDob" className="form-label">Date of Birth<span>*</span></label>
            <input type="date" className="form-control" id="inputDob" name="dob" value={localFormData.dob} onChange={handleChange} />
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label">Gender<span>*</span></label>
            <div>
              <label>
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={localFormData.gender === "male"}
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
                  checked={localFormData.gender === "female"}
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
                  checked={localFormData.gender === "other"}
                  onChange={handleChange}
                  className='mx-2'
                />
                Other
              </label>
            </div>
          </div>
          <div className="col-12">
            <label htmlFor="inputAddress" className="form-label">Address<span>*</span></label>
            <input type="text" className="form-control" id="inputAddress" name="address" value={localFormData.address} onChange={handleChange} />
          </div>
          <div className="col-12">
            <label htmlFor="inputEducation" className="form-label">Education<span>*</span></label>
            <input type="text" className="form-control" id="inputEducation" name="education" value={localFormData.education} onChange={handleChange} />
          </div>
          <div className="col-12">
            <label htmlFor="inputSkill" className="form-label">Skills<span>*</span></label>
            <input type="text" className="form-control" id="inputSkill" name="skills" value={localFormData.skills} onChange={handleChange} />
          </div>
          <div className="col-12 col-md-6">
            <label htmlFor="inputPhone" className="form-label">Phone<span>*</span></label>
            <input type="text" className="form-control" id="inputPhone" name="phone" value={localFormData.phone} onChange={handleChange} />
          </div>
          <div className="col-12 col-md-6">
            <label htmlFor="inputEmail" className="form-label">Personal Email<span>*</span></label>
            <input type="email" className="form-control" id="inputEmail" name="email" value={localFormData.email} onChange={handleChange} />
          </div>
          <div className="col-12 col-md-12">
            <label htmlFor="inputLinkedin" className="form-label">LinkedIn<span>*</span></label>
            <input type="text" className="form-control" id="inputLinkedin" name="linkedin" value={localFormData.linkedin} onChange={handleChange} />
          </div>
          <div className="col-12">
            <label htmlFor="inputAbout" className="form-label">About<span>*</span></label>
            <textarea className="form-control" id="inputAbout" name="about" value={localFormData.about} onChange={handleChange}></textarea>
          </div>
          <div className="col-12">
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="d-flex align-items-center gap-2">
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  Updating...
                </div>
              ) : (
                'Submit'
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default ViewEditProfile;
