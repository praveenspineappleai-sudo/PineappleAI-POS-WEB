//path: src/components/buttons/LogoutButton.js
import React from "react";
import logoutIcon from "../../assets/images/logout-button.png";
import "../../styles/buttons.css";

export default function LogoutButton({ onClick, title = "Logout" }) {
  return (
    <button onClick={onClick} className="btn btn-logout">
      <img src={logoutIcon} alt="logout" />
      {title}
    </button>
  );
}
