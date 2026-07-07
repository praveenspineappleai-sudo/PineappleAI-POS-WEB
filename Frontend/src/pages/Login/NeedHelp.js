// NeedHelp.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/needhelp.css';

// Import icons
import phoneIcon from '../../assets/icons/phone_number.png';
import emailIcon from '../../assets/icons/email.png';
import websiteIcon from '../../assets/icons/website.png';

const NeedHelp = () => {
  const [iconsLoaded, setIconsLoaded] = useState({
    phone: false,
    email: false,
    website: false
  });
  const navigate = useNavigate();

  const handleBack = () => {
    // Navigate back to AccountCreated page
    navigate('/account-created');
  };

  const handlePhoneContact = () => {
    window.location.href = 'tel:0774412568';
  };

  const handleEmailContact = () => {
    window.location.href = 'mailto:example@gmail.com';
  };

  const handleWebsiteVisit = () => {
    window.open('https://asasdasdasdasda', '_blank');
  };

  const handleImageLoad = (iconType) => {
    setIconsLoaded(prev => ({ ...prev, [iconType]: true }));
  };

  const handleImageError = (iconType) => {
    console.error(`Failed to load ${iconType} icon`);
    setIconsLoaded(prev => ({ ...prev, [iconType]: false }));
  };

  return (
    <div className="need-help-container">
      <div className="need-help-content">
        <div className="contact-card">
          <div className="contact-header">
            <button className="back-button" onClick={handleBack}>
              <span className="back-arrow">&lt;</span>
            </button>
            <h2 className="contact-title">Contact us</h2>
          </div>

          <div className="contact-items">
            {/* Phone */}
            <div className="contact-item" onClick={handlePhoneContact}>
              <div className={`contact-icon-wrapper ${!iconsLoaded.phone ? 'fallback-phone' : ''}`}>
                <img 
                  src={phoneIcon} 
                  alt="Phone" 
                  className="contact-icon"
                  onLoad={() => handleImageLoad('phone')}
                  onError={() => handleImageError('phone')}
                  style={{ display: iconsLoaded.phone ? 'block' : 'none' }}
                />
              </div>
              <div className="contact-details">
                <h3 className="contact-label">Phone number</h3>
                <p className="contact-value">0774412568</p>
              </div>
            </div>

            {/* Email */}
            <div className="contact-item" onClick={handleEmailContact}>
              <div className={`contact-icon-wrapper ${!iconsLoaded.email ? 'fallback-email' : ''}`}>
                <img 
                  src={emailIcon} 
                  alt="Email" 
                  className="contact-icon"
                  onLoad={() => handleImageLoad('email')}
                  onError={() => handleImageError('email')}
                  style={{ display: iconsLoaded.email ? 'block' : 'none' }}
                />
              </div>
              <div className="contact-details">
                <h3 className="contact-label">Email</h3>
                <p className="contact-value">example@gmail.com</p>
              </div>
            </div>

            {/* Website */}
            <div className="contact-item" onClick={handleWebsiteVisit}>
              <div className={`contact-icon-wrapper ${!iconsLoaded.website ? 'fallback-website' : ''}`}>
                <img 
                  src={websiteIcon} 
                  alt="Website" 
                  className="contact-icon"
                  onLoad={() => handleImageLoad('website')}
                  onError={() => handleImageError('website')}
                  style={{ display: iconsLoaded.website ? 'block' : 'none' }}
                />
              </div>
              <div className="contact-details">
                <h3 className="contact-label">Website</h3>
                <p className="contact-value">asasdasdasdasda</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NeedHelp;