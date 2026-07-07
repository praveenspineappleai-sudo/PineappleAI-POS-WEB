/// src/pages/Login/FAQ.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/faq.css';
import arrowDownIcon from '../../assets/icons/arrow-down.png';
import arrowUpIcon from '../../assets/icons/arrow-up.png';
import arrowLeftIcon from '../../assets/icons/arrow-left.png';

// This component displays a list of frequently asked questions (FAQs) related to account verification and access key issues.
const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const navigate = useNavigate();

  const faqItems = [
    {
      question: "How long does verification typically take?",
      answer: "Verification usually takes 1-2 business hours. You'll receive an email notification once completed."
    },
    {
      question: "What should I do if I don't receive the access key?",
      answer: "Check your spam folder first. If not found, click 'Resend Access Key' in your verification email or contact support."
    },
    {
      question: "Can I use multiple devices with one account?",
      answer: "Your account supports access on multiple devices while ensuring a smooth experience."
    },
    {
      question: "How do I reset my password?",
      answer: "Click 'Forgot Password' on the login screen and follow the instructions sent to your email."
    }
  ];

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const handleBack = () => {
    // Navigate back to AccountCreated page
    navigate('/account-created');
  };

  return (
    <div className="faq-container">
      {/* FAQ Content */}
      <div className="faq-content">
        <div className="faq-card">
          {/* Back Button inside card */}
          <div className="faq-back-button" onClick={handleBack}>
            <img src={arrowLeftIcon} alt="Back" className="faq-back-icon" />
          </div>
          
          <div className="faq-header">
            <h2 className="faq-title">Frequently asked questions</h2>
          </div>

          <div className="faq-items">
            {faqItems.map((item, index) => (
              <div key={index} className="faq-item">
                <div 
                  className="faq-question-header"
                  onClick={() => toggleFAQ(index)}
                >
                  <h3 className="faq-question">{item.question}</h3>
                  <img 
                    src={activeIndex === index ? arrowUpIcon : arrowDownIcon} 
                    alt={activeIndex === index ? "Collapse" : "Expand"} 
                    className="faq-arrow-icon"
                  />
                </div>
                {activeIndex === index && (
                  <div className="faq-answer-container">
                    <p className="faq-answer">{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;