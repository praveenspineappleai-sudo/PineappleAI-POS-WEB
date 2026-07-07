// src/models/NeedHelp.js
import React from "react";
import "../styles/contact.css";

// Import icons
import phoneIcon from "../assets/icons/phone_number.png";
import emailIcon from "../assets/icons/email.png";
import websiteIcon from "../assets/icons/website.png";

// This component is a popup that provides contact information for users who need help.
export default function NeedHelp({ isOpen, onClose }) {
    if (!isOpen) return null;

    const phoneNumber = "0774412558";
    const email = "example@gmail.com";
    const website = "assadasdasdasdasda";

    const handlePhoneClick = () => {
        window.open(`tel:${phoneNumber}`);
    };

    const handleEmailClick = () => {
        window.open(`mailto:${email}`);
    };

    const handleWebsiteClick = () => {
        window.open(`https://${website}`, "_blank");
    };

    return (
        <div className="contact-popup-overlay">
            <div className="contact-popup-container">
                {/* Header with Close button */}
                <div className="contact-popup-header">
                    <h2>Contact us</h2>
                    <div className="contact-header-actions">
                        <button className="contact-popup-close" onClick={onClose}>
                            ×
                        </button>
                    </div>
                </div>

                {/* Contact Options */}
                <div className="contact-options">
                    {/* Phone Number */}
                    <div className="contact-item" onClick={handlePhoneClick}>
                        <div className="contact-icon">
                            <img src={phoneIcon} alt="Phone" />
                        </div>
                        <div className="contact-content">
                            <span className="contact-title">Phone number</span>
                            <span className="contact-value">{phoneNumber}</span>
                        </div>
                    </div>

                    {/* Email */}
                    <div className="contact-item" onClick={handleEmailClick}>
                        <div className="contact-icon">
                            <img src={emailIcon} alt="Email" />
                        </div>
                        <div className="contact-content">
                            <span className="contact-title">Email</span>
                            <span className="contact-value">{email}</span>
                        </div>
                    </div>

                    {/* Website */}
                    <div className="contact-item" onClick={handleWebsiteClick}>
                        <div className="contact-icon">
                            <img src={websiteIcon} alt="Website" />
                        </div>
                        <div className="contact-content">
                            <span className="contact-title">Website</span>
                            <span className="contact-value">{website}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}