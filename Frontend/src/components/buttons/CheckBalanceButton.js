//path: src/components/buttons/CheckBalanceButton.js
import React, { forwardRef } from "react";
import "../../styles/buttons.css";

const CheckBalanceButton = forwardRef(({ onClick, title = "Check Balance", disabled = false }, ref) => {
  return (
    <button
      ref={ref}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className="btn btn-green btn-check-balance"
    >
      {title}
    </button>
  );
});

export default CheckBalanceButton;
