import React, { useState } from "react";
import "../styles/addbarcode.css";
// This component is a popup for adding a barcode to a product variant when a duplicate variant is detected without a barcode.
const AddBarcode = ({ isOpen, onClose, onSave, pendingProduct }) => {
  const [barcodeNumber, setBarcodeNumber] = useState("");

  if (!isOpen) return null;

  const handleSave = () => {
    if (barcodeNumber.trim()) {
      onSave(barcodeNumber);
      onClose();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSave();
    }
  };

  return (
    <div className="addbarcode-popup-overlay">
      <div className="addbarcode-popup-container">
        {/* Close button */}
        <button className="addbarcode-popup-close" onClick={onClose}>
          ✕
        </button>

        {/* Popup content */}
        <div className="addbarcode-popup-content">
          <h3 className="addbarcode-popup-title">
            Add Barcode to Product Variant
          </h3>
          <p className="addbarcode-popup-subtitle">
            A product with identical attributes already exists, but no barcode has been assigned for this variant. To proceed, please enter a new, unique barcode.
          </p>

          {/* Barcode Number Input */}
          <div className="addbarcode-input-group">
            <label className="addbarcode-label">Barcode Number</label>
            <input
              type="text"
              className="addbarcode-input"
              placeholder="Enter barcode"
              value={barcodeNumber}
              onChange={(e) => setBarcodeNumber(e.target.value)}
              onKeyPress={handleKeyPress}
              autoFocus
            />
          </div>

          {/* Save Button */}
          <button className="addbarcode-save-button" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddBarcode;