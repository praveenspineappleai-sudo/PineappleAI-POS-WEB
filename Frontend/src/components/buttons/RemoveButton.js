//path: src/components/buttons/RemoveButton.js
import React from "react";
import removeButton from "../../assets/images/remove-button.png"; 
import "../../styles/buttons.css";

export default function RemoveButton({ onClick }) {
  return <img src={removeButton} alt="Remove" onClick={onClick} className="icon-btn" />;
}
