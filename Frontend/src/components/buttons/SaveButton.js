//path: src/components/buttons/SaveButton.js
import React from "react";
import "../../styles/buttons.css";

export default function SaveButton({ onClick, title = "Save" }) {
  return (
    <button onClick={onClick} className="btn btn-save">
      {title}
    </button>
  );
}
