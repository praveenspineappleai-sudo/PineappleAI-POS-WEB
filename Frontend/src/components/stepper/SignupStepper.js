// src/components/stepper/SignupStepper.js
import React from 'react';
import '../../styles/stepper.css';
// SignupStepper component to visually represent the multi-step signup process
const SignupStepper = ({ currentStep = 1, steps = [] }) => {
  // Updated steps order to match the correct flow
  const defaultSteps = [
    {
      title: "Account credentials",
      subtitle: "Login details for account access"
    },
    {
      title: "Email verification",
      subtitle: "Security step to validate email ownership"
    },
    {
      title: "Owner's details",
      subtitle: "Share the owner's personal details"
    },
    {
      title: "Phone number verification",
      subtitle: "Security step to validate phone number ownership"
    },
    {
      title: "Business details",
      subtitle: "Enter key information about the business ownership"
    }
  ];

  const stepData = steps.length > 0 ? steps : defaultSteps;

  return (
    <div className="stepper-container">
      {/* Mobile/Tablet Design */}
      <div className="stepper-mobile">
        <div className="mobile-step-indicator">
          <div className="mobile-step-circle">
            <div className="mobile-step-progress" style={{
              background: `conic-gradient(#2F7A3F 0deg ${((currentStep - 1) / stepData.length) * 360}deg, #e0e0e0 ${((currentStep - 1) / stepData.length) * 360}deg 360deg)`
            }}>
              <div className="mobile-step-inner">
                <span className="mobile-step-text">{currentStep} of {stepData.length}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="mobile-step-content">
          <h3 className="mobile-step-title">{stepData[currentStep - 1]?.title}</h3>
          <p className="mobile-step-subtitle">{stepData[currentStep - 1]?.subtitle}</p>
        </div>
      </div>

      {/* Desktop Design */}
      <div className="stepper-steps">
        {stepData.map((step, index) => (
          <React.Fragment key={index}>
            <div 
              className={`stepper-step ${index + 1 === currentStep ? 'active' : ''} ${index + 1 < currentStep ? 'completed' : ''}`}
            >
              <div className="step-number-container">
                <div className="step-connector step-connector-left" />
                <div className="step-number">
                  {index + 1 < currentStep ? (
                    <span className="step-checkmark">✓</span>
                  ) : (
                    <span className="step-digit">{index + 1}</span>
                  )}
                </div>
                <div className="step-connector step-connector-right" />
              </div>
              <div className="step-content">
                <h3 className="step-title">{step.title}</h3>
                <p className="step-subtitle">{step.subtitle}</p>
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default SignupStepper;