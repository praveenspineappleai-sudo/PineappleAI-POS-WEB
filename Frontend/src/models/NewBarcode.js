// src/models/NewBarcode.js
import React, { useState, useRef } from "react";
import ProcessOrderButton from "../components/buttons/ProceedOrderButton";
import "../styles/newbarcode.css";


// This component is a popup that appears when a product does not have an assigned barcode. 
const NewBarcode = ({ isOpen, onClose, onAddBarcode, onGenerateBarcode, onOpenAddBarcode }) => {
  const [barcodeValue, setBarcodeValue] = useState("");
  const addBarcodeButtonRef = useRef(null);
  const generateBarcodeButtonRef = useRef(null);

  if (!isOpen) return null;

  const handleAddBarcode = () => {
    // Open AddBarcode popup
    onOpenAddBarcode();
  };

  const handleGenerateBarcode = () => {
    // Generate barcode and close popup
    onGenerateBarcode();
  };

  return (
    <div className="barcode-popup-overlay">
      <div className="barcode-popup-container">
        {/* Close button */}
        <button className="barcode-popup-close" onClick={onClose}>
          ✕
        </button>

        {/* Popup content */}
        <div className="barcode-popup-content">
          <p className="barcode-popup-message">
            Barcode not assigned. Enter or generate to continue.
          </p>

          {/* Action buttons */}
          <div className="barcode-popup-actions">
            <ProcessOrderButton
              ref={addBarcodeButtonRef}
              onClick={handleAddBarcode}
              title="Add Barcode"
            />
            <ProcessOrderButton
              ref={generateBarcodeButtonRef}
              onClick={handleGenerateBarcode}
              title="Generate Barcode"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewBarcode;