// SelectPopup.js - Updated for Selection
import React, { useState, useEffect } from 'react';
import '../styles/selectpopup.css';

const SelectPopup = ({ 
  isOpen, 
  onClose, 
  onSave, 
  title, 
  existingOptions = [],
  type = 'select'
}) => {
  const [selectedOption, setSelectedOption] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelectedOption('');
    }
  }, [isOpen]);

  const handleOptionSelect = (option) => {
    onSave(option);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="selection-popup-overlay" onClick={onClose}>
      <div className="selection-popup-content" onClick={(e) => e.stopPropagation()}>
        <div className="selection-popup-header">
          <h3 className="selection-popup-title">{title}</h3>
          <button 
            className="selection-popup-close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="selection-popup-body">
          <div className="selection-options-container">
            <div className="selection-options-list">
              {existingOptions.map((option, index) => (
                <div
                  key={index}
                  className="selection-option"
                  onClick={() => handleOptionSelect(option)}
                >
                  {option}
                </div>
              ))}
            </div>
            {existingOptions.length === 0 && (
              <div className="selection-no-options">
                No options available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectPopup;