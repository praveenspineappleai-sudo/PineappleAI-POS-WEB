//src\models\ConfirmationPopup.js
import React, { useEffect, useRef, useState } from "react";
import "../styles/confirmation.css";

// This component is a reusable confirmation popup that can be used for various actions like account deletion, order cancellation, etc. It supports keyboard navigation and accessibility features.
const ConfirmationPopup = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Yes",
  cancelText = "No",
}) => {
  const [selectedOption, setSelectedOption] = useState("yes");

  const yesBtnRef = useRef(null);
  const noBtnRef = useRef(null);

  // Auto focus Yes button when popup opens
  useEffect(() => {
    if (isOpen) {
      setSelectedOption("yes");
      setTimeout(() => yesBtnRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Keyboard navigation (focus trap)
  useEffect(() => {
    if (!isOpen) return;

    const handleKey = (e) => {
      e.stopPropagation(); // ⭐ prevent background handlers
      e.preventDefault();  // ⭐ prevent default scroll / action

      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        setSelectedOption((prev) => (prev === "yes" ? "no" : "yes"));
        setTimeout(() => {
          if (selectedOption === "yes") noBtnRef.current?.focus();
          else yesBtnRef.current?.focus();
        }, 10);
      }

      if (e.key === "Enter") {
        if (selectedOption === "yes") onConfirm();
        else onClose();
      }

      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKey, true); // ⭐ use capture phase

    return () => window.removeEventListener("keydown", handleKey, true);
  }, [isOpen, selectedOption, onConfirm, onClose]);

  if (!isOpen) return null;

  return (
    <div className="confirmation-overlay" onClick={onClose}>
      <div className="confirmation-container" onClick={(e) => e.stopPropagation()}>
        <div className="confirmation-header">
          <h2>{title}</h2>
          <button className="confirmation-close" onClick={onClose}>×</button>
        </div>
        <div className="confirmation-body">{message}</div>
        <div className="confirmation-actions">
          <button
           type="button"   // ✅ ADD THIS
           ref={yesBtnRef}
           className={`btn-process-order ${selectedOption === "yes" ? "highlight" : ""}`}
           onClick={onConfirm}
          >
          {confirmText}
          </button>

          <button
           type="button"   // ✅ ADD THIS
           ref={noBtnRef}
           className={`confirmation-cancel-btn ${selectedOption === "no" ? "highlight" : ""}`}
           onClick={onClose}
          >
          {cancelText}
          </button>

            
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPopup;