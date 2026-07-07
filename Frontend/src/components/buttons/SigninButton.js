//path: src/components/buttons/SigninButton.js
import React from "react";
import "../../styles/buttons.css";

export default function SigninButton({ onClick, title = "Sign In" }) {
  return (
    <button onClick={onClick} className="btn btn-green btn-signin">
      {title}
    </button>
  );
}
