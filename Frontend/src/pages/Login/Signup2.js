// Phone number verification (Step 4) 
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/signup2.css';
import SignupStepper from '../../components/stepper/SignupStepper';
import ProcessOrderButton from '../../components/buttons/ProceedOrderButton';
import eyeIcon from '../../assets/icons/eye.png';
import { verifyPhoneOTP, getTempPhone, sendPhoneOTP, validatePhoneNumber, getSignupData } from '../../integration/SignupAPI';

const Signup2 = () => {
  const navigate = useNavigate();
  const [currentStep] = useState(4); 
  const [formData, setFormData] = useState({
    verificationCode: ''
  });
  const [timeLeft, setTimeLeft] = useState(259); 
  const [showVerificationCode, setShowVerificationCode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    // Get phone from temp storage or signup data
    const tempPhone = getTempPhone();
    const signupData = getSignupData();
    
    const phoneToUse = tempPhone || signupData?.phone_number;
    
    if (phoneToUse) {
      console.log('Phone for verification:', phoneToUse);
      setPhone(phoneToUse);
    } else {
      console.error('No phone found for verification');
      setError('Phone number not found. Redirecting to previous step...');
      setTimeout(() => {
        navigate('/signup2');
      }, 2000);
    }
  }, [navigate]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Allow only numbers and limit to 6 digits
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    setFormData(prev => ({
      ...prev,
      [name]: numericValue
    }));
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleVerifyPhone = async () => {
    // Validate OTP
    if (!formData.verificationCode.trim()) {
      setError('Verification code is required');
      return;
    }
    
    if (formData.verificationCode.length !== 6) {
      setError('Verification code must be 6 digits');
      return;
    }
    
    if (!phone) {
      setError('Phone number not found. Please go back and try again.');
      return;
    }
    
    // Validate phone format
    const phoneValidation = validatePhoneNumber(phone);
    if (!phoneValidation.isValid) {
      setError(phoneValidation.message);
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      console.log('Verifying phone OTP:', {
        phone: phoneValidation.formatted || phone,
        otp: formData.verificationCode
      });
      
      // Call phone OTP verification API
      const result = await verifyPhoneOTP(phoneValidation.formatted || phone, formData.verificationCode);
      
      if (result.success) {
        console.log('Phone verified successfully:', result.data);
        
        // Navigate to Business details page (Step 5)
        console.log('Navigating to business details page...');
        navigate('/signup4');
      } else {
        setError(result.error || 'Invalid verification code. Please try again.');
      }
    } catch (error) {
      console.error('Error in handleVerifyPhone:', error);
      setError(error.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevious = () => {
    navigate('/signup2');
  };

  const handleResend = async () => {
    if (!phone) {
      setError('Phone number not found. Please go back and try again.');
      return;
    }
    
    // Validate phone format
    const phoneValidation = validatePhoneNumber(phone);
    if (!phoneValidation.isValid) {
      setError(phoneValidation.message);
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const result = await sendPhoneOTP(phoneValidation.formatted || phone);
      
      if (result.success) {
        console.log('Phone OTP resent successfully');
        setTimeLeft(259); // Reset timer to 2:59
        setFormData({ verificationCode: '' });
        setError('New verification code sent to your phone.');
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setError('');
        }, 3000);
      } else {
        setError(result.error || 'Failed to resend OTP. Please try again.');
      }
    } catch (error) {
      console.error('Error in handleResend:', error);
      setError(error.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVerificationCodeVisibility = () => {
    setShowVerificationCode(!showVerificationCode);
  };

  return (
    <div className="signup2-container">
      {/* Stepper */}
      <div className="signup2-stepper">
        <SignupStepper currentStep={currentStep} />
      </div>

      {/* Form Content - Step 4: Phone number verification */}
      <div className="signup2-form">
        <div className="form-card2">
          <div className="verification-content">
            <p className="verification-description">
              Verification code is sent to the registered phone number for authentication
            </p> 
            
            <div className="input-group2">
              <label className="input-label2">
                Phone number verification code
              </label>
              <div className="verification-input-wrapper">
                <input
                  type={showVerificationCode ? 'text' : 'password'}
                  name="verificationCode"
                  value={formData.verificationCode}
                  onChange={handleInputChange}
                  placeholder="Enter 6-digit code"
                  className={`input-field2 verification-input ${error ? 'error' : ''}`}
                  maxLength={6}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={toggleVerificationCodeVisibility}
                  className="verification-toggle"
                  aria-label={showVerificationCode ? 'Hide verification code' : 'Show verification code'}
                  disabled={isLoading}
                >
                  <img 
                    src={eyeIcon} 
                    alt="Toggle verification code visibility"
                    className={`eye-icon ${showVerificationCode ? 'eye-open' : 'eye-closed'}`}
                  />
                </button>
              </div>
            </div>

            {error && (
              <div className={`error-message ${error.includes('sent') ? 'success' : ''}`}>
                {error}
              </div>
            )}

            <div className="timer-section">
              <p className="timer-text">
                Code expires in: <span className="timer-countdown">{formatTime(timeLeft)}</span>
              </p>
              <p className="resend-text">
                Didn't receive the code? 
                <button 
                  type="button" 
                  className="resend-link"
                  onClick={handleResend}
                  disabled={timeLeft > 0 || isLoading}
                >
                  Resend
                </button>
              </p>
            </div>

            <div className="form-navigation2">
              <ProcessOrderButton 
                onClick={handleVerifyPhone} 
                title={isLoading ? "Verifying..." : "Verify Phone Number"}
                disabled={isLoading || formData.verificationCode.length !== 6}
              />
              <button 
                type="button" 
                onClick={handlePrevious}
                className="previous-btn2"
                disabled={isLoading}
              >
                Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup2;