// DeleteConfirmation.js
import React, { useState, useEffect, useRef } from "react";
import "../styles/confirmation.css";

const DeleteConfirmationPopup = ({ isOpen, onClose, onConfirm }) => {
  const [selected, setSelected] = useState("yes"); // yes/no selection
  const yesRef = useRef(null);
  const noRef = useRef(null);

  // Focus first button when popup opens
  useEffect(() => {
    if (isOpen) {
      setSelected("yes"); // default selection
      setTimeout(() => {
        if (yesRef.current) yesRef.current.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle arrow keys and enter ONLY when popup is open
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      // Prevent background actions (like changing product count)
      e.stopPropagation();

      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        setSelected((prev) => {
          const next = prev === "yes" ? "no" : "yes";
          if (next === "yes" && yesRef.current) yesRef.current.focus();
          if (next === "no" && noRef.current) noRef.current.focus();
          return next;
        });
      }

      if (e.key === "Enter") {
        if (selected === "yes") {
          onConfirm();
        }
        onClose();
      }

      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown, true); // use capture to stop background events
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [isOpen, selected, onClose, onConfirm]);

  if (!isOpen) return null;

  return (
    <div className="confirmation-overlay" onClick={onClose}>
      <div className="confirmation-container" onClick={(e) => e.stopPropagation()}>
        <div className="confirmation-header">
          <h2>Confirm Deletion</h2>
          <button className="confirmation-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="confirmation-body">
          Click "Yes" to delete the product.
        </div>

        <div className="confirmation-actions">
          <button
            ref={yesRef}
            className={`btn-process-order btn-yes delete-yes ${selected === "yes" ? "highlight" : ""}`}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Yes
          </button>

          <button
            ref={noRef}
            className={`confirmation-cancel-btn btn-no ${selected === "no" ? "highlight" : ""}`}
            onClick={onClose}
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationPopup;
