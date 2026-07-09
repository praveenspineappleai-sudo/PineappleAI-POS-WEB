///path src/components/layout/Header2.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config/apiConfig';
import '../../styles/header2.css';
import LogoutButton from '../buttons/LogoutButton';
import { logout } from '../../integration/LogoutAPI';
import { clearAllCookies } from '../../integration/AuthAPI';
// Header2 component with enhanced logout functionality and system info display
const Header2 = ({ 
  title = "", 
  subtitle = "", 
  loggedInUser = null
}) => {
  const navigate = useNavigate();
  const titleSlug = title.toLowerCase().replace(/\s+/g, '-');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [dbName, setDbName] = useState("");

  // Fetch system info when component mounts
  React.useEffect(() => {
    fetchSystemInfo();
  }, []);
  // Function to fetch system info (like database name) from backend
  const fetchSystemInfo = async () => {
    try {
      // Fetch from backend
      const response = await fetch(`${API_BASE_URL}/api/system-info`);
      const result = await response.json();
      if (result.success && result.data) {
        setDbName(result.data.dbName || "");
      }
    } catch (error) {
      console.error('Error fetching system info:', error);
    }
  };
 // Handler for logout action with comprehensive cleanup
  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      // Call the logout API
      const result = await logout();
      
      if (result.success) {
        console.log('Logout successful:', result.message);
        
        // Clear any remaining data
        clearAllCookies();
        
        // Force clear all storage
        localStorage.clear();
        sessionStorage.clear();
        
        // Clear browser cache and history by forcing a fresh navigation
        window.history.replaceState(null, '', '/login');
        
        // Navigate to login page with replace to prevent back navigation
        navigate('/login', { replace: true });
        
        // Force reload to clear any cached state and React components
        window.location.href = '/login';
      } else {
        console.error('Logout failed:', result.error);
        // Even if API fails, proceed with comprehensive local logout
        handleForceLogout();
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Proceed with comprehensive local logout even if there's an error
      handleForceLogout();
    } finally {
      setIsLoggingOut(false);
    }
  };
  // Comprehensive local logout function to ensure all session data is cleared
  const handleForceLogout = () => {
    clearAllCookies();
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear browser history state
    window.history.replaceState(null, '', '/login');
    
    // Navigate with replace and force reload
    navigate('/login', { replace: true });
    
    // Force reload to completely clear the session
    window.location.href = '/login';
  };

  return (
    <header className="header2">
      <div className="header2-left">
        <h1 data-title={titleSlug}>{title}</h1>
        <h3>{subtitle}</h3>
        {dbName && (
          <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px', textAlign: 'left' }}>
            DB: {dbName}
          </div>
        )}
      </div>
      <div className="header2-right">
        <LogoutButton 
          onClick={handleLogout} 
          title={isLoggingOut ? "Logging out..." : "Logout"}
          disabled={isLoggingOut}
        />
      </div>
    </header>
  );
};

export default Header2;