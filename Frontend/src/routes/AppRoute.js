// AppRoute.js - Centralized Routing Configuration
import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { isAuthenticated, getUserData } from '../integration/AuthAPI';

// Public Components
import Login from '../pages/Login/Login';
import Signup3 from '../pages/Login/Signup3'; // Account credentials (Step 1)
import Signup4 from '../pages/Login/Signup4'; // Email verification (Step 2)
import Signup1 from '../pages/Login/Signup1'; // Owner's details (Step 3)
import Signup2 from '../pages/Login/Signup2'; // Phone number verification (Step 4)
import Signup from '../pages/Login/Signup';   // Business details (Step 5)
import AccountCreated from '../pages/Login/AccountCreated'; // Account created (Step 6)
import FAQ from '../pages/Login/FAQ'; // FAQ (Step 7)
import NeedHelp from '../pages/Login/NeedHelp'; // Need Help (Step 8)
import AccessKey from '../pages/Login/Accesskey'; // Access key (Step 9)

// Protected Components
import Dashboard from '../pages/ProductManagement/Dashboard';
import ProductManagement from '../pages/ProductManagement/ProductManagement';
import AddProduct from '../pages/ProductManagement/AddProduct';
import SalesManagement from '../pages/SalesManagement/SalesManagement';
import OrderListPage from '../pages/Cashier/Orederlistpage';

/**
 * Get role-based redirect path
 * @returns {string} Redirect path based on user role
 */
export const getRoleBasedRedirect = () => {
  const userData = getUserData();
  const role = (userData?.role || '').toLowerCase();
  if (role === 'cashier') {
    return '/order-list';
  }
  return '/dashboard';
};

/**
 * Check if current route is accessible for user role
 * @param {string} pathname - Current route path
 * @param {string} userRole - User role
 * @returns {boolean} Whether route is accessible
 */
export const isRouteAccessible = (pathname, userRole) => {
  const normalizedRole = (userRole || '').toLowerCase();
  const adminRoutes = ['/dashboard', '/product-management', '/sales-management', '/add-product'];
  const cashierRoutes = ['/order-list'];
  
  if (normalizedRole === 'cashier' && adminRoutes.includes(pathname)) {
    return false;
  }
  
  if (['admin', 'owner', 'superadmin', 'super_admin', 'super admin'].includes(normalizedRole) && cashierRoutes.includes(pathname)) {
    // Admin can access cashier routes too, but we'll redirect to dashboard
    return false;
  }
  
  return true;
};

/**
 * Protected Route Component
 * Redirects to login if not authenticated
 * Redirects to role-based page if trying to access unauthorized route
 */
const ProtectedRoute = ({ children }) => {
  const userData = getUserData();
  const currentPath = window.location.pathname;
  
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  
  // Check if current route is accessible for user role
  if (userData && !isRouteAccessible(currentPath, userData.role)) {
    const redirectPath = getRoleBasedRedirect();
    return <Navigate to={redirectPath} replace />;
  }
  
  return children;
};

/**
 * Public Route Component
 * Redirects to appropriate dashboard if already authenticated
 */
const PublicRoute = ({ children }) => {
  if (isAuthenticated()) {
    const redirectPath = getRoleBasedRedirect();
    return <Navigate to={redirectPath} replace />;
  }
  return children;
};

/**
 * Simple History Blocker integrated into routes
 */
const HistoryBlockerWrapper = ({ children }) => {
  const navigate = useNavigate();

  React.useEffect(() => {
    const handlePopState = (event) => {
      const userData = getUserData();
      const currentPath = window.location.pathname;
      
      if (!isAuthenticated()) {
        // If not authenticated and trying to go back to protected routes, redirect to login
        if (currentPath !== '/login') {
          navigate('/login', { replace: true });
        }
      } else {
        // If authenticated but trying to access route not permitted for role, redirect appropriately
        if (userData && !isRouteAccessible(currentPath, userData.role)) {
          const redirectPath = getRoleBasedRedirect();
          navigate(redirectPath, { replace: true });
        }
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate]);

  return children;
};

/**
 * Main App Routes Component
 */
const AppRoutes = () => {
  return (
    <HistoryBlockerWrapper>
      <Routes>
        {/* Public Routes - Only accessible when not authenticated */}
        <Route 
          path="/" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />

        {/* Signup Process Routes - Correct Flow */}
        {/* Step 1: Account credentials */}
        <Route 
          path="/signup" 
          element={
            <PublicRoute>
              <Signup3 />
            </PublicRoute>
          } 
        />
        
        {/* Step 2: Email verification */}
        <Route 
          path="/signup1" 
          element={
            <PublicRoute>
              <Signup4 />
            </PublicRoute>
          } 
        />
        
        {/* Step 3: Owner's details */}
        <Route 
          path="/signup2" 
          element={
            <PublicRoute>
              <Signup1 />
            </PublicRoute>
          } 
        />
        
        {/* Step 4: Phone number verification */}
        <Route 
          path="/signup3" 
          element={
            <PublicRoute>
              <Signup2 />
            </PublicRoute>
          } 
        />
        
        {/* Step 5: Business details */}
        <Route 
          path="/signup4" 
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          } 
        />
        
        {/* Step 6: Account created */}
        <Route 
          path="/account-created" 
          element={
            <PublicRoute>
              <AccountCreated />
            </PublicRoute>
          } 
        />
        
        {/* Step 7: FAQ */}
        <Route 
          path="/faq" 
          element={
            <PublicRoute>
              <FAQ />
            </PublicRoute>
          } 
        />
        
        {/* Step 8: Need Help */}
        <Route 
          path="/need-help" 
          element={
            <PublicRoute>
              <NeedHelp />
            </PublicRoute>
          } 
        />
        
        {/* Step 9: Access key */}
        <Route 
          path="/access-key" 
          element={
            <PublicRoute>
              <AccessKey />
            </PublicRoute>
          } 
        />

        {/* Protected Routes - Require authentication */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/product-management" 
          element={
            <ProtectedRoute>
              <ProductManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/add-product" 
          element={
            <ProtectedRoute>
              <AddProduct />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/sales-management" 
          element={
            <ProtectedRoute>
              <SalesManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/order-list" 
          element={
            <ProtectedRoute>
              <OrderListPage />
            </ProtectedRoute>
          } 
        />

        {/* Catch all route - redirect based on authentication status */}
        <Route 
          path="*" 
          element={
            isAuthenticated() ? 
              <Navigate to={getRoleBasedRedirect()} replace /> : 
              <Navigate to="/login" replace />
          } 
        />
      </Routes>
    </HistoryBlockerWrapper>
  );
};

export default AppRoutes;