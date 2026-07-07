//path: src/components/buttons/CheckBalanceButton.js
import React, { forwardRef } from "react";
import "../../styles/buttons.css";

const CheckBalanceButton = forwardRef(({ onClick, title = "Check Balance" }, ref) => {
  return (
    <button
      ref={ref}                          // ⭐ REF ENABLED
      onClick={onClick}
      className="btn btn-green btn-check-balance"
    >
      {title}
    </button>
  );
});

export default CheckBalanceButton;
