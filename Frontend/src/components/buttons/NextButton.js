//path: src/components/buttons/NextButton.js
import React from "react";
import "../../styles/buttons.css";

export default function NextButton({ onClick, title = "Next" }) {
  return (
    <button onClick={onClick} className="btn btn-green btn-next">
      {title}
    </button>
  );
}
