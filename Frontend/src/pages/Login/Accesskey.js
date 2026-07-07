// src/pages/Login/Accesskey.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import NextButton from "../../components/buttons/NextButton";
import accessKeyIllustration from "../../assets/images/Frame.png";
import arrowLeftIcon from "../../assets/icons/arrow-left.png";
import "../../styles/accesskey.css";

export default function AccessKey() {
    const [accessKey, setAccessKey] = useState("");
    const navigate = useNavigate();

    const handleAccessKeyChange = (e) => {
        setAccessKey(e.target.value);
    };

    const handleNext = () => {
        if (accessKey.trim()) {
            // Handle access key validation and next step
            console.log("Access key entered:", accessKey);
            // Navigate to Login page after successful validation
            navigate('/login');
        }
    };

    const handleBackClick = () => {
        // Handle back navigation
        console.log("Back button clicked");
        // Navigate back to AccountCreated page
        navigate('/account-created');
    };

    return (
        <div className="access-key-container">
            <div className="access-key-card">
                {/* Back Arrow */}
                <button className="back-arrow-btn" onClick={handleBackClick}>
                    <img
                        src={arrowLeftIcon}
                        alt="Back"
                        className="back-arrow-icon"
                    />
                </button>

                {/* Illustration */}
                <div className="illustration-container">
                    <img
                        src={accessKeyIllustration}
                        alt="Access Key Illustration"
                        className="access-key-illustration"
                    />
                </div>

                {/* Content */}
                <div className="content-section">
                    <p className="instruction-text">
                        Check your email for the access key and enter it to activate your account.
                    </p>

                    <div className="input-section">
                        <label htmlFor="accessKey" className="input-label">
                            Access key
                        </label>
                        <input
                            type="text"
                            id="accessKey"
                            value={accessKey}
                            onChange={handleAccessKeyChange}
                            placeholder="Enter your access key"
                            className="access-key-input"
                        />
                    </div>

                    <div className="next-button-container">
                        <NextButton onClick={handleNext} title="Next" />
                    </div>
                </div>
            </div>
        </div>
    );
}