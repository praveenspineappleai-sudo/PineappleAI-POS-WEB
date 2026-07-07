//path: src/components/buttons/ProceedOrderButton.js
import React from "react";
import "../../styles/buttons.css";

// Ref forward pannina version
const ProcessOrderButton = React.forwardRef(({ onClick, title = "Process Order" }, ref) => {
  return (
    <button
      ref={ref} // ✅ ref forward pannittu Enter key work aagum
      onClick={onClick}
      className="btn btn-green btn-process-order"
    >
      {title}
    </button>
  );
});

export default ProcessOrderButton;
