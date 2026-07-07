// Business details (Step 5)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/signup.css';
import SignupStepper from '../../components/stepper/SignupStepper';
import ProcessOrderButton from '../../components/buttons/ProceedOrderButton';
import { registerUser, getSignupData, clearSignupData } from '../../integration/SignupAPI';

const Signup = () => {
  const navigate = useNavigate();
  const [currentStep] = useState(5);
  const [formData, setFormData] = useState({
    businessName: '',
    address: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [storedData, setStoredData] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    // Get stored signup data
    const data = getSignupData();
    console.log('Retrieved signup data:', data);
    
    if (!data) {
      console.error('No signup data found');
      setErrors({
        businessName: 'Session data not found. Please start from the beginning.'
      });
      setDataLoaded(true);
      // Redirect to first step after 2 seconds
      setTimeout(() => {
        navigate('/signup');
      }, 2000);
      return;
    }
    
    // Validate all required fields exist
    const requiredFields = ['email', 'username', 'password', 'name', 'gender', 'dob', 'phone_number'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      setErrors({
        businessName: `Missing data: ${missingFields.join(', ')}. Please start from the beginning.`
      });
      setDataLoaded(true);
      // Redirect to first step after 2 seconds
      setTimeout(() => {
        navigate('/signup');
      }, 2000);
      return;
    }
    
    console.log('All required data present:', data);
    setStoredData(data);
    setDataLoaded(true);
  }, [navigate]);

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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateForm()) {
      return;
    }

    if (!storedData) {
      setErrors({
        businessName: 'Session expired. Please start registration again.'
      });
      setTimeout(() => {
        navigate('/signup');
      }, 2000);
      return;
    }

    setIsLoading(true);
    
    try {
      // Prepare complete registration data
      const registrationData = {
        email: storedData.email,
        username: storedData.username,
        password: storedData.password,
        name: storedData.name,
        gender: storedData.gender,
        dob: storedData.dob, // Already in YYYY-MM-DD format
        phone_number: storedData.phone_number,
        business_name: formData.businessName,
        address: formData.address
      };

      console.log('Submitting registration:', registrationData);

      // Call registration API
      const result = await registerUser(registrationData);

      if (result.success) {
        console.log('Registration successful:', result.data);
        
        // Clear all stored signup data
        clearSignupData();
        
        // Navigate to account created page
        navigate('/account-created');
      } else {
        setErrors({
          businessName: result.error || 'Registration failed. Please try again.'
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({
        businessName: error.message || 'An unexpected error occurred. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevious = () => {
    navigate('/signup3');
  };

  // Show loading while checking data
  if (!dataLoaded) {
    return (
      <div className="signup-container">
        <div className="signup-stepper">
          <SignupStepper currentStep={currentStep} />
        </div>
        <div className="signup-form">
          <div className="form-card">
            <p style={{ textAlign: 'center', padding: '20px' }}>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="signup-container">
      {/* Stepper */}
      <div className="signup-stepper">
        <SignupStepper currentStep={currentStep} />
      </div>

      {/* Form Content - Step 5: Business details */}
      <div className="signup-form">
        <div className="form-card">
          <div className="input-group">
            <label className="input-label">
              Business name
            </label>
            <input
              type="text"
              name="businessName"
              value={formData.businessName}
              onChange={handleInputChange}
              placeholder="eg: Luxury Boutique"
              className={`input-field ${errors.businessName ? 'error' : ''}`}
              required
              disabled={isLoading || !storedData}
            />
            {errors.businessName && <span className="error-message">{errors.businessName}</span>}
          </div>

          <div className="input-group">
            <label className="input-label">
              Address
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="eg: 123 Main Street, Colombo"
              className={`input-field ${errors.address ? 'error' : ''}`}
              required
              disabled={isLoading || !storedData}
            />
            {errors.address && <span className="error-message">{errors.address}</span>}
          </div>

          <div className="form-navigation">
            <ProcessOrderButton 
              onClick={handleNext} 
              title={isLoading ? "Registering..." : "Next"}
              disabled={isLoading || !storedData}
            />
            <button 
              type="button" 
              onClick={handlePrevious}
              className="previous-btn"
              disabled={isLoading}
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;