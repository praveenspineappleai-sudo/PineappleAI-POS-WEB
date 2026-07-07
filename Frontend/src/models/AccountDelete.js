// src/components/AccountDelete.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/deletion.css";
import ProceedOrderButton from "../components/buttons/ProceedOrderButton";
import eyeIcon from "../assets/icons/eye.png";
import EmailVerification from "../models/EmailVerification";
import ConfirmationPopup from "./ConfirmationPopup";
import { useToast } from "../contexts/ToastContext";

export default function AccountDelete({
  isOpen,
  onClose,
  onDeleteAccount,
  userEmail
}) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [password, setPassword] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [shouldNavigate, setShouldNavigate] = useState(false);

  // Handle navigation after toast
  useEffect(() => {
    if (shouldNavigate) {
      // Navigate to login page after a short delay
      const timer = setTimeout(() => {
        navigate("/login");
      }, 2100); // Slightly longer than toast duration
      return () => clearTimeout(timer);
    }
  }, [shouldNavigate, navigate]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (isConfirmed && password) {
      setShowConfirmation(true); // open confirmation popup
    } else if (!password) {
      showToast("Error", "Please enter your password", "error");
    } else if (!isConfirmed) {
      showToast("Error", "Please confirm account deletion", "error");
    }
  };

  const handleConfirmDelete = () => {
    setShowConfirmation(false);

    // ✅ show toast using context
    showToast("Success", "Account successfully deleted", "success");

    // call parent delete handler
    if (onDeleteAccount) {
      onDeleteAccount(password);
    }

    // ✅ set flag to navigate after toast disappears
    setShouldNavigate(true);
  };
  // Cancel delete action
  const handleCancelDelete = () => {
    setShowConfirmation(false);
  };
  // Close popup and reset state
  const handleClose = () => {
    setPassword("");
    setIsConfirmed(false);
    setShowPassword(false);
    setShowEmailVerification(false);
    setShowConfirmation(false);
    setShouldNavigate(false);
    onClose();
  };
  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  // Handle forgot password link click
  const handleForgotPassword = (e) => {
    e.preventDefault();
    setShowEmailVerification(true);
  };
  // Handle email verification close
  const handleEmailVerificationClose = () => {
    setShowEmailVerification(false);
  };
  // Handle successful email verification
  const handleEmailVerificationSuccess = () => {
    setShowEmailVerification(false);
    console.log("Email verification successful");
  };

  return (
    <>
      {/* Account Delete Popup */}
      {!showEmailVerification && !showConfirmation && (
        <div className="admin-popup-overlay">
          <div className="account-delete-container">
            {/* Header */}
            <div className="admin-popup-header">
              <div className="admin-popup-header-delete">
                <h2>Delete account</h2>
              </div>
              <div className="admin-header-actions">
                <button className="admin-popup-close" onClick={handleClose}>
                  ×
                </button>
              </div>
            </div>

            {/* Warning */}
            <div className="delete-warning">
              <p>Delete your account</p>
              <p className="warning-text">
                Deleting your account is permanent and cannot be undone. Please enter your password to proceed.
              </p>
            </div>

            {/* Password Input */}
            <div className="delete-form">
              <div className="form-group">
                <label htmlFor="confirmPassword">Enter your Password</label>
                <div className="password-input-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="confirmPassword"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="* * * * * * * * *"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={togglePasswordVisibility}
                  >
                    <img src={eyeIcon} alt="Show password" className="icon" />
                  </button>
                </div>

                {/* Forgot Password */}
                <div className="forgot-password-link">
                  <a href="#forgot-password" onClick={handleForgotPassword}>
                    Forgot password
                  </a>
                </div>
              </div>

              {/* Confirmation Checkbox */}
              <div className="confirmation-checkbox">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={isConfirmed}
                    onChange={(e) => setIsConfirmed(e.target.checked)}
                    required
                  />
                  <span className="checkmark"></span>
                  I understand that this action is permanent and cannot be undone.
                </label>
              </div>

              {/* Delete Button */}
              <div className="delete-action-button">
                <div
                  className={`delete-button-wrapper ${!password || !isConfirmed ? "disabled" : ""
                    }`}
                >
                  <ProceedOrderButton
                    onClick={!password || !isConfirmed ? null : handleSubmit}
                    title="Delete account"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Verification */}
      <EmailVerification
        isOpen={showEmailVerification}
        onClose={handleEmailVerificationClose}
        userEmail={userEmail}
        onVerificationSuccess={handleEmailVerificationSuccess}
      />

      {/* Confirmation Popup */}
      <ConfirmationPopup
        isOpen={showConfirmation}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Confirm account deletion"
        message="Are you sure you want to delete your account? This action cannot be undone."
        confirmText="Yes"
        cancelText="No"
      />
    </>
  );
}