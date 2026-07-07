//path: src/components/buttons/DeleteButton.js
import React from "react";
import deleteButton from "../../assets/images/delete-button.png";
import "../../styles/buttons.css";

export default function DeleteButton({ onClick }) {
  return <img src={deleteButton} alt="Delete" onClick={onClick} className="icon-btn" />;
}
