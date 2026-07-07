// Owner's details (Step 3) 
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../styles/signup1.css';
import SignupStepper from '../../components/stepper/SignupStepper';
import ProcessOrderButton from '../../components/buttons/ProceedOrderButton';
import calendarIcon from '../../assets/icons/calendar.png';
import { sendPhoneOTP, setTempPhone, validatePhoneNumber, updateSignupData, getSignupData } from '../../integration/SignupAPI';

const Signup1 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dateInputRef = useRef(null);
  const [currentStep] = useState(3); 
  
  // Get data from URL params or localStorage
  const queryParams = new URLSearchParams(location.search);
  const urlEmail = queryParams.get('email') || '';
  const urlUsername = queryParams.get('username') || '';
  const urlPassword = queryParams.get('password') || '';
  
  // Try to get from localStorage if URL params are missing
  const signupData = getSignupData();
  const email = urlEmail || signupData?.email || '';
  const username = urlUsername || signupData?.username || '';
  const password = urlPassword || signupData?.password || '';
  
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    dob: '',
    phoneNumber: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Get data from localStorage if URL params are missing
    const signupData = getSignupData();
    console.log('Owner details page - checking data...');
    console.log('URL params - email:', email, 'username:', username, 'password:', password);
    console.log('Signup data from storage:', signupData);
    
    // Check if we have data either from URL params or localStorage
    const hasEmailFromURL = email && username && password;
    const hasDataFromStorage = signupData && signupData.email && signupData.username && signupData.password;
    
    if (!hasEmailFromURL && !hasDataFromStorage) {
      console.error('Missing required data from previous steps');
      setErrors({
        name: 'Session expired. Please start from the beginning.'
      });
      setTimeout(() => {
        navigate('/signup');
      }, 2000);
    }
  }, [email, username, password, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    // Gender validation
    if (!formData.gender) {
      newErrors.gender = 'Please select a gender';
    }

    // Date of birth validation
    if (!formData.dob) {
      newErrors.dob = 'Date of birth is required';
    } else {
      try {
        const [day, month, year] = formData.dob.split("/");
        if (!day || !month || !year) {
          newErrors.dob = 'Invalid date format';
        }
      } catch (err) {
        newErrors.dob = 'Invalid date';
      }
    }

    // Phone number validation
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateForm()) {
      return;
    }

    // Convert DOB to backend format (YYYY-MM-DD)
    let formattedDob;
    try {
      const [day, month, year] = formData.dob.split("/");
      formattedDob = `${year}-${month}-${day}`;
    } catch (err) {
      setErrors(prev => ({
        ...prev,
        dob: 'Invalid date format'
      }));
      return;
    }

    setIsLoading(true);
    try {
      // Validate phone number format
      const phoneValidation = validatePhoneNumber(formData.phoneNumber);
      
      if (!phoneValidation.isValid) {
        setErrors(prev => ({
          ...prev,
          phoneNumber: phoneValidation.message || 'Invalid phone number'
        }));
        setIsLoading(false);
        return;
      }

      // Send phone OTP
      const result = await sendPhoneOTP(phoneValidation.formatted || formData.phoneNumber);
      
      if (result.success) {
        // Store phone temporarily
        setTempPhone(phoneValidation.formatted || formData.phoneNumber);
        
        // Update signup data with owner's details
        updateSignupData({
          email,
          username,
          password,
          name: formData.name,
          gender: formData.gender,
          dob: formattedDob,
          phone_number: phoneValidation.formatted || formData.phoneNumber
        });
        
        // Verify data was stored
        const storedData = getSignupData();
        console.log('Data after update:', storedData);
        
        // Navigate to phone verification page
        navigate('/signup3');
      } else {
        setErrors(prev => ({
          ...prev,
          phoneNumber: result.error || 'Failed to send OTP'
        }));
      }
    } catch (err) {
      console.error("Send OTP error:", err);
      setErrors(prev => ({
        ...prev,
        phoneNumber: 'Server not reachable. Try again later.'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevious = () => {
    navigate(`/signup1?email=${encodeURIComponent(email)}&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`);
  };

  const handleDateChange = (e) => {
    let value = e.target.value;
    value = value.replace(/[^\d/]/g, '');
    
    const digits = value.replace(/\D/g, '');
    
    if (digits.length <= 8) {
      let formatted = digits;
      if (digits.length >= 2 && digits.length < 4) {
        formatted = digits.substring(0, 2) + '/' + digits.substring(2);
      } else if (digits.length >= 4) {
        formatted = digits.substring(0, 2) + '/' + digits.substring(2, 4) + '/' + digits.substring(4, 8);
      }
      value = formatted;
    } else {
      value = digits.substring(0, 2) + '/' + digits.substring(2, 4) + '/' + digits.substring(4, 8);
    }
    
    setFormData(prev => ({
      ...prev,
      dob: value
    }));
    
    if (errors.dob) {
      setErrors(prev => ({
        ...prev,
        dob: ''
      }));
    }
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value;
    value = value.replace(/[^\d+\s]/g, '');
    
    setFormData(prev => ({
      ...prev,
      phoneNumber: value
    }));
    
    if (errors.phoneNumber) {
      setErrors(prev => ({
        ...prev,
        phoneNumber: ''
      }));
    }
  };

  const handleCalendarClick = () => {
    if (dateInputRef.current) {
      dateInputRef.current.showPicker();
    }
  };

  const handleDateSelect = (e) => {
    const selectedDate = e.target.value;
    if (selectedDate) {
      const date = new Date(selectedDate);
      const formattedDate = formatDate(date);
      
      setFormData(prev => ({
        ...prev,
        dob: formattedDate
      }));
      
      if (errors.dob) {
        setErrors(prev => ({
          ...prev,
          dob: ''
        }));
      }
    }
  };

  return (
    <div className="signup1-container">
      <div className="signup1-stepper">
        <SignupStepper currentStep={currentStep} />
      </div>

      <div className="signup1-form">
        <div className="form-card1">
          <div className="input-group1">
            <label className="input-label1">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="eg: John"
              className={`input-field1 ${errors.name ? 'error' : ''}`}
              required
              disabled={isLoading}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="input-group1">
            <label className="input-label1">
              Gender
            </label>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="gender"
                  value="Male"
                  checked={formData.gender === 'Male'}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                <span className="radio-text">Male</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="gender"
                  value="Female"
                  checked={formData.gender === 'Female'}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                <span className="radio-text">Female</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="gender"
                  value="Prefer not to say"
                  checked={formData.gender === 'Prefer not to say'}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                <span className="radio-text">Prefer not to say</span>
              </label>
            </div>
            {errors.gender && <span className="error-message">{errors.gender}</span>}
          </div>

          <div className="input-group1">
            <label className="input-label1">
              DOB
            </label>
            <div className="date-input-wrapper">
              <input
                type="text"
                name="dob"
                value={formData.dob}
                onChange={handleDateChange}
                placeholder="DD/MM/YYYY"
                className={`input-field1 ${errors.dob ? 'error' : ''}`}
                required
                disabled={isLoading}
              />
              <input
                ref={dateInputRef}
                type="date"
                className="hidden-date-input"
                onChange={handleDateSelect}
                max={new Date().toISOString().split('T')[0]}
              />
              <button
                type="button"
                className="calendar-button"
                onClick={handleCalendarClick}
                disabled={isLoading}
              >
                <img src={calendarIcon} alt="Calendar" className="calendar-icon" />
              </button>
            </div>
            {errors.dob && <span className="error-message">{errors.dob}</span>}
          </div>

          <div className="input-group1">
            <label className="input-label1">
              Phone number
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handlePhoneChange}
              placeholder="eg: +94 **** *****"
              className={`input-field1 ${errors.phoneNumber ? 'error' : ''}`}
              required
              disabled={isLoading}
            />
            {errors.phoneNumber && <span className="error-message">{errors.phoneNumber}</span>}
          </div>

          <div className="form-navigation1">
            <button 
              type="button" 
              onClick={handlePrevious}
              className="previous-btn"
              disabled={isLoading}
            >
              Previous
            </button>
            <ProcessOrderButton 
              onClick={handleNext} 
              title={isLoading ? "Sending OTP..." : "Next"}
              disabled={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup1;