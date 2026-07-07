/// src/pages/Login/AccountCreated.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/accountcreated.css';
import ProcessOrderButton from '../../components/buttons/ProceedOrderButton';

// Import icons
import atIcon from '../../assets/icons/at.png';
import tikIcon from '../../assets/icons/tik.png';
import guideIcon from '../../assets/icons/guide.png';
import faqIcon from '../../assets/icons/faq.png';
import helpIcon from '../../assets/icons/help.png';

const AccountCreated = () => {
  const navigate = useNavigate();

  const handleNext = () => {
    // Navigate to AccessKey page
    navigate('/access-key');
  };

  const handleViewGuide = () => {
    // Handle view online guide
    console.log('View online guide clicked');
  };

  const handleViewFAQ = () => {
    // Navigate to FAQ page
    navigate('/faq');
  };

  const handleNeedHelp = () => {
    // Navigate to Need Help page
    navigate('/need-help');
  };

  return (
    <div className="account-created-container">
      {/* Main Content */}
      <div className="account-created-content">
        <div className="success-card">
          <h2 className="success-title">Account successfully created</h2>
          <p className="success-description">
            Your account has been created. Please wait while we verify your details.
          </p>

          <div className="success-items">
            <div className="success-item">
              <img src={atIcon} alt="Email" className="success-icon" />
              <span>Once approved, an access key will be sent to your registered email.</span>
            </div>
            <div className="success-item">
              <img src={tikIcon} alt="Success" className="success-icon" />
              <span>Enjoy a seamless POS experience designed for luxury retail.</span>
            </div>
          </div>

          <div className="next-steps">
            <h3 className="next-steps-title">Next Steps:</h3>
            <div className="steps-list">
              <div className="step-item">
                <span className="step-number">1</span>
                <span className="step-text">Check your email for the access key once verification is complete.</span>
              </div>
              <div className="step-item">
                <span className="step-number">2</span>
                <span className="step-text">Enter the access key to activate your account.</span>
              </div>
              <div className="step-item">
                <span className="step-number">3</span>
                <span className="step-text">Login with your credentials after activation.</span>
              </div>
              <div className="step-item">
                <span className="step-number">4</span>
                <span className="step-text">Start managing inventory, processing sales, and monitoring reports.</span>
              </div>
            </div>

            <div className="guide-button-container">
              <button className="guide-button" onClick={handleViewGuide}>
                <img src={guideIcon} alt="Guide" className="guide-button-icon" />
                View online guide
              </button>
            </div>

            <div className="help-links">
              <button className="help-link" onClick={handleViewFAQ}>
                <img src={faqIcon} alt="FAQ" className="help-link-icon" />
                View FAQ
              </button>
              <button className="help-link" onClick={handleNeedHelp}>
                <img src={helpIcon} alt="Help" className="help-link-icon" />
                Need help
              </button>
            </div>
          </div>

          <p className="continue-text">
            Continue by tapping 'Next' and entering your access key.
          </p>

          <div className="form-navigation">
            <ProcessOrderButton onClick={handleNext} title="Next" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountCreated;