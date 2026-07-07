// Account credentials (Step 1) 
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/signup3.css';
import SignupStepper from '../../components/stepper/SignupStepper';
import ProcessOrderButton from '../../components/buttons/ProceedOrderButton';
import eyeIcon from '../../assets/icons/eye.png';
import { sendEmailOTP, setTempEmail, getTempEmail, setSignupData, getSignupData } from '../../integration/SignupAPI';

const Signup3 = () => {
  const navigate = useNavigate();
  const [currentStep] = useState(1); 
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [formData, setFormData] = useState({
    emailAddress: '',
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState({
    emailAddress: '',
    username: '',
    password: '',
    terms: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {
      emailAddress: '',
      username: '',
      password: '',
      terms: ''
    };

    let isValid = true;

    if (!formData.emailAddress.trim()) {
      newErrors.emailAddress = 'Email address is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.emailAddress)) {
      newErrors.emailAddress = 'Please enter a valid email address';
      isValid = false;
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
      isValid = false;
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    if (!agreedToTerms) {
      newErrors.terms = 'You must agree to the terms and conditions';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // Send OTP to email
      console.log('Sending email OTP to:', formData.emailAddress);
      const result = await sendEmailOTP(formData.emailAddress);
      
      if (result.success) {
        console.log('OTP sent successfully:', result.data);
        
        // Store email temporarily for verification process
        console.log('Storing temp email:', formData.emailAddress);
        setTempEmail(formData.emailAddress);
        
        // Verify temp email was stored
        const checkTempEmail = getTempEmail();
        console.log('Verification - temp email stored:', checkTempEmail);
        
        // Store initial signup data
        const initialData = {
          email: formData.emailAddress,
          username: formData.username,
          password: formData.password
        };
        console.log('Storing initial signup data:', initialData);
        setSignupData(initialData);
        
        // Verify signup data was stored
        const storedData = getSignupData();
        console.log('Verification - stored data:', storedData);
        
        // Check sessionStorage directly
        console.log('Direct localStorage check:');
        console.log('- temp_email:', localStorage.getItem('temp_email'));
        console.log('- signup_data:', localStorage.getItem('signup_data'));
        
        // Navigate to email verification page (Step 2)
        // Route: /signup1 → Signup4.js (Email verification)
        navigate('/signup1');
      } else {
        setErrors(prev => ({
          ...prev,
          emailAddress: result.error || 'Failed to send OTP. Please try again.'
        }));
      }
    } catch (error) {
      console.error('Error in handleNext:', error);
      setErrors(prev => ({
        ...prev,
        emailAddress: error.message || 'An unexpected error occurred. Please try again.'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevious = () => {
    navigate('/login');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleTermsChange = (e) => {
    const isChecked = e.target.checked;
    setAgreedToTerms(isChecked);
    
    // Clear terms error when user checks the box
    if (isChecked && errors.terms) {
      setErrors(prev => ({
        ...prev,
        terms: ''
      }));
    }
  };

  return (
    <div className="signup3-container">
      {/* Stepper */}
      <div className="signup3-stepper">
        <SignupStepper currentStep={currentStep} />
      </div>

      {/* Form Content - Step 1: Account credentials */}
      <div className="signup3-form">
        <div className="form-card3">
          <div className="input-group3">
            <label className="input-label3">
              Email address
            </label>
            <input
              type="email"
              name="emailAddress"
              value={formData.emailAddress}
              onChange={handleInputChange}
              placeholder="example@gmail.com"
              className={`input-field3 ${errors.emailAddress ? 'error' : ''}`}
              autoComplete="new-email"
              required
              disabled={isLoading}
            />
            {errors.emailAddress && <span className="error-message">{errors.emailAddress}</span>}
          </div>

          <div className="input-group3">
            <label className="input-label3">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="example_username"
              className={`input-field3 ${errors.username ? 'error' : ''}`}
              autoComplete="new-username"
              required
              disabled={isLoading}
            />
            {errors.username && <span className="error-message">{errors.username}</span>}
          </div>

          <div className="input-group3">
            <label className="input-label3">
              Password
            </label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="**********"
                className={`input-field3 password-input ${errors.password ? 'error' : ''}`}
                autoComplete="new-password"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={togglePasswordVisibility}
                disabled={isLoading}
              >
                <img src={eyeIcon} alt="Toggle password visibility" className="eye-icon" />
              </button>
            </div>
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          {/* Simple Checkbox */}
          <div className="terms-section">
            <label className="terms-checkbox">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={handleTermsChange}
                className="checkbox-input"
                disabled={isLoading}
              />
              <span className="terms-text">
                By checking this box, you agree to our terms of service and privacy policy.
              </span>
            </label>
            {errors.terms && <span className="error-message terms-error">{errors.terms}</span>}
          </div>

          <div className="form-navigation3">
            <button 
              type="button" 
              className="previous-btn3"
              onClick={handlePrevious}
              disabled={isLoading}
            >
              Back
            </button>
            <ProcessOrderButton 
              onClick={handleNext} 
              title={isLoading ? "Sending OTP..." : "Next"}
              disabled={!agreedToTerms || isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup3;