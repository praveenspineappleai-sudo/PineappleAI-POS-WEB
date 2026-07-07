// src/models/Successful.js
import React, { useEffect } from "react";
import "../styles/success.css";

export default function Successful({
    isOpen,
    title = "Password reset is successful!",
    message = "Your password has been successfully reset",
    onClose // ✅ add callback for closing
}) {
    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                if (onClose) onClose();
            }, 1000); // auto-close after 1s
            return () => clearTimeout(timer);
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="success-popup-overlay">
            <div className="success-popup-container">
                <div className="success-popup-content">
                    <h2 className="success-title">{title}   ✅ </h2>
                    <p className="success-message">{message}</p>
                </div>
            </div>
        </div>
    );
}
