//src/models/CreateNewPassword.js
import React, { useState } from "react";
import "../styles/emailverification.css";
import ProceedOrderButton from "../components/buttons/ProceedOrderButton";
import EyeIcon from "../assets/icons/eye.png";
import SuggestIcon from "../assets/icons/suggest.png";
import CopyIcon from "../assets/icons/copy.png";
import Successful from "./Successful";
import { 
  resetPasswordWithOTP, 
  getOTPData, 
  clearOTPData 
} from "../integration/ForgotPasswordAPI";
// This component is a popup for creating a new password during the password reset flow. It includes features like password visibility toggle, password suggestion, and copy to clipboard functionality.
export default function CreateNewPassword({
  isOpen,
  onClose,
  onPasswordSuccess,
  userEmail,
  otpCode
}) {
  const [password, setPassword] = useState("");// State to hold the new password input
  const [showPassword, setShowPassword] = useState(false);// State to toggle password visibility
  const [copied, setCopied] = useState(false);// State to show "Password copied!" message
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);// State to control visibility of success popup
  const [isLoading, setIsLoading] = useState(false);/// State to indicate if password reset is in progress
  const [errorMessage, setErrorMessage] = useState("");/// State to hold any error messages during password reset

  // Toggle password visibility
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // Generate a random strong password
  const generateRandomPassword = () => {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';/// Lowercase letters
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';/// Uppercase letters
    const numbers = '0123456789';/// Numbers
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';/// Symbols

    const allChars = lowercase + uppercase + numbers + symbols;// All characters combined for random selection
    let password = '';

    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];

    for (let i = 4; i < 12; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    return password.split('').sort(() => Math.random() - 0.5).join('');
  };

  // Handle close action
  const handleSuggestPassword = () => {
    const suggestedPassword = generateRandomPassword();
    setPassword(suggestedPassword);
  };

  /// Handle copy to clipboard action
  const handleCopyPassword = async () => {
    if (password) {
      try {
        await navigator.clipboard.writeText(password);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy password:", err);
      }
    }
  };

  // Handle submit action to reset password
  const handleSubmit = async () => {
    if (!password || password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const otpData = getOTPData();
      const emailToUse = userEmail || otpData.email;
      const otpToUse = otpCode || otpData.otp;

      if (!emailToUse || !otpToUse) {
        throw new Error("Verification data missing. Please restart the process.");
      }

      const result = await resetPasswordWithOTP(emailToUse, otpToUse, password);
      
      setIsLoading(false);
      
      if (result.success) {
        clearOTPData();
        setShowSuccessPopup(true);
      } else {
        setErrorMessage(result.error || "Failed to reset password");
      }
    } catch (error) {
      setIsLoading(false);
      setErrorMessage(error.message || "An error occurred");
    }
  };

  // Handle success popup close action
  const handleSuccessClose = () => {
    setShowSuccessPopup(false);
    if (onPasswordSuccess) {
      onPasswordSuccess(password);
    }
    setPassword("");
    setErrorMessage("");
    setIsLoading(false);
    if (onClose) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {!showSuccessPopup && (
        <div className="create-password-overlay">
          <div className="create-password-container">
            <div className="create-password-header">
              <h2>Create new password</h2>
              <button 
                className="create-password-close" 
                onClick={onClose}
                disabled={isLoading}
              >
                ×
              </button>
            </div>

            <div className="create-password-content">
              <p>
                Your new password must be different from previous used passwords.
              </p>

              <div className="password-input-group">
                <label htmlFor="password">Password</label>
                <div className="password-input-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMessage) {
                        setErrorMessage("");
                      }
                    }}
                    placeholder="Enter new password (min. 6 characters)"
                    disabled={isLoading}
                  />
                  <img
                    src={EyeIcon}
                    alt="Toggle visibility"
                    className="eye-icon"
                    onClick={toggleShowPassword}
                  />
                </div>
                {errorMessage && (
                  <div className="error-message">
                    {errorMessage}
                  </div>
                )}
              </div>

              <div className="password-actions">
                <div className="password-action-buttons">
                  <button 
                    type="button" 
                    className="suggest-password-btn" 
                    onClick={handleSuggestPassword}
                    disabled={isLoading}
                  >
                    <img src={SuggestIcon} alt="Suggest password" className="action-icon" />
                    <span>Suggest password</span>
                  </button>

                  <div className="copy-password-container">
                    <button 
                      type="button" 
                      className="copy-password-btn" 
                      onClick={handleCopyPassword} 
                      disabled={!password || isLoading}
                    >
                      <img src={CopyIcon} alt="Copy password" className="action-icon" />
                      <span>Copy password</span>
                    </button>
                    {copied && (
                      <div className="password-copied-message">
                        Password copied!
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="create-password-action">
              <div className={`create-password-button-wrapper ${!password || password.length < 6 || isLoading ? 'disabled' : ''}`}>
                <ProceedOrderButton
                  onClick={(!password || password.length < 6 || isLoading) ? null : handleSubmit}
                  title={isLoading ? "Resetting..." : "Reset password"}
                  disabled={!password || password.length < 6 || isLoading}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <Successful
        isOpen={showSuccessPopup}
        title="Password reset is successful!"
        message="Your password has been successfully reset"
        onClose={handleSuccessClose}
      />
    </>
  );
}