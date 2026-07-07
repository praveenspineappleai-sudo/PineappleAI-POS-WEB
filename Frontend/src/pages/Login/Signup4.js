// Email verification (Step 2) 
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/signup4.css';
import SignupStepper from '../../components/stepper/SignupStepper';
import ProcessOrderButton from '../../components/buttons/ProceedOrderButton';
import eyeIcon from '../../assets/icons/eye.png';
import { verifyEmailOTP, getTempEmail, sendEmailOTP, getSignupData } from '../../integration/SignupAPI';

const Signup4 = () => {
  const navigate = useNavigate();
  const [currentStep] = useState(2);
  const [showVerificationCode, setShowVerificationCode] = useState(false);
  const [formData, setFormData] = useState({
    emailVerificationCode: ''
  });
  const [timeLeft, setTimeLeft] = useState(259);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    // Get email from temp storage or signup data
    console.log('Checking for email in storage...');
    const tempEmail = getTempEmail();
    console.log('Temp email:', tempEmail);
    
    const signupData = getSignupData();
    console.log('Signup data:', signupData);
    
    const emailToUse = tempEmail || signupData?.email;

    if (emailToUse) {
      console.log('Email for verification found:', emailToUse);
      setEmail(emailToUse);
    } else {
      console.error('No email found for verification');
      console.log('localStorage temp_email:', localStorage.getItem('temp_email'));
      console.log('localStorage signup_data:', localStorage.getItem('signup_data'));
      setError('Email not found. Redirecting to previous step...');
      setTimeout(() => {
        navigate('/signup');
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

  const handleBack = () => {
    // Navigate back to account credentials page (Step 1)
    navigate('/signup');
  };

  const handleVerifyEmail = async () => {
    // Validate OTP
    if (!formData.emailVerificationCode.trim()) {
      setError('Verification code is required');
      return;
    }

    if (formData.emailVerificationCode.length !== 6) {
      setError('Verification code must be 6 digits');
      return;
    }

    if (!email) {
      setError('Email not found. Please go back and try again.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('Verifying email OTP:', {
        email: email,
        otp: formData.emailVerificationCode
      });

      // Call OTP verification API
      const result = await verifyEmailOTP(email, formData.emailVerificationCode);

      if (result.success) {
        console.log('Email verified successfully:', result.data);

        // Get signup data to pass to next step
        const signupData = getSignupData();
        console.log('Signup data before navigation:', signupData);
        
        if (!signupData || !signupData.email || !signupData.username || !signupData.password) {
          console.error('Critical: Signup data missing after email verification!');
          setError('Session data lost. Please start from the beginning.');
          setTimeout(() => {
            navigate('/signup');
          }, 2000);
          return;
        }
        
        // Navigate to Owner's details page (Step 3) with data in URL as backup
        console.log('Navigating to owner details with data...');
        navigate(`/signup2?email=${encodeURIComponent(signupData.email)}&username=${encodeURIComponent(signupData.username)}&password=${encodeURIComponent(signupData.password)}`);
      } else {
        setError(result.error || 'Invalid verification code. Please try again.');
      }
    } catch (error) {
      console.error('Error in handleVerifyEmail:', error);
      setError(error.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError('Email not found. Please go back and try again.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await sendEmailOTP(email);

      if (result.success) {
        console.log('OTP resent successfully');
        setTimeLeft(259); // Reset timer to 2:59
        setFormData({ emailVerificationCode: '' });
        setError('New verification code sent to your email.');

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
    <div className="signup4-container">
      {/* Stepper */}
      <div className="signup4-stepper">
        <SignupStepper currentStep={currentStep} />
      </div>

      {/* Form Content - Step 2: Email verification */}
      <div className="signup4-form">
        <div className="form-card4">
          <div className="verification-content4">
            <p className="verification-description4">
              Verification code is sent to the registered email for authentication
            </p>

            <div className="input-group4">
              <label className="input-label4">
                Email verification code
              </label>
              <div className="verification-input-wrapper">
                <input
                  type={showVerificationCode ? "text" : "password"}
                  name="emailVerificationCode"
                  value={formData.emailVerificationCode}
                  onChange={handleInputChange}
                  placeholder="Enter verification code"
                  className={`input-field4 verification-input ${error ? 'error' : ''}`}
                  maxLength={6}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="verification-toggle"
                  onClick={toggleVerificationCodeVisibility}
                  disabled={isLoading}
                >
                  <img src={eyeIcon} alt="Toggle verification code visibility" className="eye-icon4" />
                </button>
              </div>
            </div>

            {error && (
              <div className={`error-message ${error.includes('sent') ? 'success' : ''}`}>
                {error}
              </div>
            )}

            <div className="timer-section4">
              <p className="timer-text4">
                Code expires in: <span className="timer-countdown4">{formatTime(timeLeft)}</span>
              </p>
              <p className="resend-text4">
                Didn't receive the code?
                <button
                  type="button"
                  className="resend-link4"
                  onClick={handleResend}
                  disabled={timeLeft > 0 || isLoading}
                >
                  Resend
                </button>
              </p>
            </div>

            <div className="form-navigation4">
              <ProcessOrderButton
                onClick={handleVerifyEmail}
                title={isLoading ? "Verifying..." : "Verify email"}
                disabled={isLoading || formData.emailVerificationCode.length !== 6}
              />
              <button
                type="button"
                className="previous-btn4"
                onClick={handleBack}
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

export default Signup4;