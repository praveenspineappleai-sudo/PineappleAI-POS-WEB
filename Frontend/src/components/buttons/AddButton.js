//path: src/components/buttons/AddButton.js
import React from "react";
import addButton from "../../assets/images/add-button.png";
import "../../styles/buttons.css";

export default function AddButton({ onClick }) {
  return <img src={addButton} alt="Add" onClick={onClick} className="icon-btn" />;
}
