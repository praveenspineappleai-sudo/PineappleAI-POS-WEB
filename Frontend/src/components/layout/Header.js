//path: src/components/layout/Header.js
// Header.js
import React, { useState, useEffect } from 'react';
import '../../styles/layout.css';
import userIcon from '../../assets/icons/user.png';
import AdminUserSetting from '../../models/AdminUserSetting';
import { fetchUserProfile } from '../../integration/AccountManagementAPI';
import { API_BASE_URL } from '../../config/apiConfig';

const Header = ({
  title = "",
  subtitle = "",
  adminUser = {
    name: "Admin user",
    icon: userIcon
  }
}) => {
  const [showAdminPopup, setShowAdminPopup] = useState(false);// State to hold user profile data
  const [userName, setUserName] = useState("Admin User");// Default name until we fetch the actual profile
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);// State to track loading status of profile
  const [dbName, setDbName] = useState("");// State to hold database name

  const titleSlug = title.toLowerCase().replace(/\s+/g, '-');

  // Fetch user profile and system info when component mounts
  useEffect(() => {
    loadUserProfile();
    fetchSystemInfo();
  }, []);
  // Function to fetch system info (like database name) from backend
  const fetchSystemInfo = async () => {
    try {
      // Fetch from local backend
      const response = await fetch(`${API_BASE_URL}/api/system-info`);
      const result = await response.json();
      if (result.success && result.data) {
        setDbName(result.data.dbName || "");
      }
    } catch (error) {
      console.error('Error fetching system info:', error);
    }
  };
  // Function to load user profile from backend API
  const loadUserProfile = async () => {
    setIsLoadingProfile(true);
    try {
      const result = await fetchUserProfile();

      if (result.success && result.data) {
        // Set username from API response
        setUserName(result.data.username || "Admin User");
      } else {
        console.error('Failed to fetch profile:', result.error);
        // Keep default "Admin User" if fetch fails
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoadingProfile(false);
    }
  };
  // Handler for when admin user section is clicked
  const handleAdminClick = () => {
    setShowAdminPopup(true);
  };
  // Handler to close the admin popup
  const handleClosePopup = () => {
    setShowAdminPopup(false);
  };
  // Handler for adding a cashier - receives cashier data from the popup form
  const handleAddCashier = (cashierData) => {
    console.log('Add cashier clicked:', cashierData);
    // Add your logic here - you might want to call an API to save the cashier
    // The popup will automatically close after successful submission
  };
  // Handler for logout action
  const handleLogout = () => {
    console.log('Logout clicked');
    // Add your logout logic here
    // Clear user session, redirect to login, etc.
    setShowAdminPopup(false);
  };
  // Handler for delete account action - receives password from the popup form
  const handleDelete = (password) => {
    console.log('Delete account clicked with password:', password);
    // Add your delete logic here
    // Call API to delete account with provided password
    setShowAdminPopup(false);
  };

  return (
    <>
      <header className="header">
        <div className="header-left">
          <h1 data-title={titleSlug}>{title}</h1>
          <h3>{subtitle}</h3>
          {dbName && (
            <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px', textAlign: 'left' }}>
              DB: {dbName}
            </div>
          )}
        </div>
        <div className="header-right">
          <div className="admin-user" onClick={handleAdminClick} style={{ cursor: 'pointer' }}>
            <div className="user-icon-container">
              <img src={adminUser.icon} alt="Admin User" className="user-icon" />
            </div>
            <span>{isLoadingProfile ? "Loading..." : userName}</span>
          </div>
        </div>
      </header>

      <AdminUserSetting
        isOpen={showAdminPopup}//new prop to control popup visibility
        onClose={handleClosePopup}//new prop to handle popup close
        userName={userName}// Pass the fetched username to the popup
        userImage={adminUser.icon}// Pass user icon to the popup
        onAddCashier={handleAddCashier}//new prop to handle adding cashier
        onLogout={handleLogout}//new prop to handle logout
        onDelete={handleDelete}//new prop to handle account deletion
      />
    </>
  );
};

export default Header;