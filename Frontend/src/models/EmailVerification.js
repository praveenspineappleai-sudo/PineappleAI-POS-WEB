// EmailVerification.js
import React, { useState, useEffect } from "react";
import "../styles/emailverification.css";
import ProceedOrderButton from "../components/buttons/ProceedOrderButton";
import EyeIcon from "../assets/icons/eye.png";
import CreateNewPassword from "./CreateNewPassword";
import { 
  sendPasswordResetOTP, 
  verifyOTP, 
  storeOTPData 
} from "../integration/ForgotPasswordAPI";

export default function EmailVerification({
  isOpen,
  onClose,
  userEmail,
  onVerificationSuccess
}) {
  const [verificationCode, setVerificationCode] = useState("");
  const [timeLeft, setTimeLeft] = useState(180);
  const [showCode, setShowCode] = useState(false);
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [email, setEmail] = useState(userEmail || "");
  const [otpSent, setOtpSent] = useState(false);

  // Update email when userEmail prop changes
  useEffect(() => {
    if (userEmail) {
      setEmail(userEmail);
    }
  }, [userEmail]);

  // Auto-send OTP when popup opens
  useEffect(() => {
    if (isOpen && email && !otpSent) {
      handleSendOTP();
    }
  }, [isOpen, email]);

  useEffect(() => {
    if (timeLeft <= 0) {
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft]);

  // Reset states when the popup is closed
  useEffect(() => {
    if (!isOpen) {
      setVerificationCode("");
      setTimeLeft(180);
      setShowCode(false);
      setShowCreatePassword(false);
      setErrorMessage("");
      setIsLoading(false);
      setOtpSent(false);
    }
  }, [isOpen]);

  // Format time in MM:SS format
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle sending OTP to email
  const handleSendOTP = async () => {
    if (!email || !email.trim()) {
      setErrorMessage("Email is required");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    
    console.log('Sending OTP to email:', email);
    const result = await sendPasswordResetOTP(email.trim());
    
    setIsLoading(false);
    
    if (result.success) {
      setTimeLeft(180);
      setOtpSent(true);
      console.log('OTP sent successfully');
    } else {
      setErrorMessage(result.error || "Failed to send OTP");
      console.error('Failed to send OTP:', result.error);
    }
  };
  // Handle resend code action
  const handleResendCode = async () => {
    if (timeLeft > 0 && timeLeft < 180) {
      if (180 - timeLeft < 30) {
        setErrorMessage("Please wait before requesting a new code");
        return;
      }
    }
    
    setOtpSent(false);
    await handleSendOTP();
  };

  // Handle verify code action
  const handleVerify = async () => {
    // Trim and validate
    const trimmedCode = verificationCode.replace(/\s/g, '').trim();
    const trimmedEmail = email.trim();
    
    console.log('=== Verification Details ===');
    console.log('Original code:', verificationCode);
    console.log('Trimmed code:', trimmedCode);
    console.log('Code length:', trimmedCode.length);
    console.log('Email:', trimmedEmail);
    console.log('Email length:', trimmedEmail.length);
    
    // Validate code is exactly 6 digits
    if (!trimmedCode || trimmedCode.length !== 6) {
      setErrorMessage("Please enter a valid 6-digit code");
      console.error('Invalid code length:', trimmedCode.length);
      return;
    }
    
    // Validate code contains only digits
    if (!/^\d{6}$/.test(trimmedCode)) {
      setErrorMessage("Code must contain only numbers");
      console.error('Invalid code format:', trimmedCode);
      return;
    }

    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setErrorMessage("Valid email is required");
      console.error('Invalid email:', trimmedEmail);
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    
    console.log('Calling verifyOTP with:', { email: trimmedEmail, code: trimmedCode });
    const result = await verifyOTP(trimmedEmail, trimmedCode);
    
    setIsLoading(false);
    
    if (result.success) {
      console.log('✓ Code verified successfully');
      storeOTPData(trimmedEmail, trimmedCode);
      setShowCreatePassword(true);
    } else {
      console.error('✗ Code verification failed:', result.error);
      setErrorMessage(result.error || "Invalid verification code. Please try again.");
    }
  };

  /// Handle password creation success
  const handlePasswordSuccess = () => {
    setShowCreatePassword(false);
    setVerificationCode("");
    setTimeLeft(180);
    setShowCode(false);
    setErrorMessage("");
    setOtpSent(false);
    
    if (onVerificationSuccess) {
      onVerificationSuccess();
    }
  };

  // Reset states when the popup is closed
  const handleCloseCreatePassword = () => {
    setShowCreatePassword(false);
  };

  // Reset states when the popup is closed
  const handleCloseEmailVerification = () => {
    setVerificationCode("");
    setTimeLeft(180);
    setShowCode(false);
    setShowCreatePassword(false);
    setErrorMessage("");
    setOtpSent(false);
    if (onClose) {
      onClose();
    }
  };
  
  // Toggle visibility of the verification code input
  const toggleShowCode = () => {
    setShowCode(!showCode);
  };
 
  // Handle changes in the verification code input
  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setVerificationCode(value);
    if (errorMessage) {
      setErrorMessage("");
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {!showCreatePassword && (
        <div className="email-verification-overlay">
          <div className="email-verification-container">
            <div className="email-verification-header">
              <h2>Forgot password</h2>
              <button 
                className="email-verification-close" 
                onClick={handleCloseEmailVerification}
                disabled={isLoading}
              >
                ×
              </button>
            </div>

            <div className="email-verification-content">
              <p>
                A verification code has been sent to your email{" "}
                <span className="email-highlight">{email}</span>.{" "}
                Please enter the code below to complete the verification process.
              </p>

              <div className="verification-input-group">
                <label htmlFor="verificationCode">Email verification code</label>
                <div className="code-input-container">
                  <input
                    type={showCode ? "text" : "password"}
                    id="verificationCode"
                    value={verificationCode}
                    onChange={handleCodeChange}
                    placeholder="Enter 6-digit code"
                    maxLength="6"
                    disabled={isLoading}
                  />
                  <img
                    src={EyeIcon}
                    alt="Toggle visibility"
                    className="eye-icon"
                    onClick={toggleShowCode}
                  />
                </div>
                {errorMessage && (
                  <div className="error-message">
                    {errorMessage}
                  </div>
                )}
              </div>

              <div className="verification-footer">
                <div className="timer-section">
                  <p className="timer">
                    Code expires in: <strong>{formatTime(timeLeft)}</strong>
                  </p>
                  <p className="resend-link">
                    Didn't receive the code?{" "}
                    <button 
                      onClick={handleResendCode} 
                      className="resend-button"
                      disabled={isLoading || timeLeft > 150}
                    >
                      <strong>Resend</strong>
                    </button>
                  </p>
                </div>
              </div>
            </div>

            <div className="verification-action">
              <div className={`verify-button-wrapper ${!verificationCode || verificationCode.length !== 6 || isLoading ? 'disabled' : ''}`}>
                <ProceedOrderButton
                  onClick={(!verificationCode || verificationCode.length !== 6 || isLoading) ? null : handleVerify}
                  title={isLoading ? "Verifying..." : "Verify email"}
                  disabled={isLoading || !verificationCode || verificationCode.length !== 6}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <CreateNewPassword
        isOpen={showCreatePassword}
        onClose={handleCloseCreatePassword}
        onPasswordSuccess={handlePasswordSuccess}
        userEmail={email}
        otpCode={verificationCode}
      />
    </>
  );
}