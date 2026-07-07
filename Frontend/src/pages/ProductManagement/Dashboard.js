// Dashboard.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';
import '../../styles/dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-container">
      <Sidebar 
        activeItem="dashboard"
        onDashboardClick={() => navigate('/dashboard')}
        onProductClick={() => navigate('/product-management')}
        onSalesClick={() => navigate('/sales-management')}
        onLogoClick={() => navigate('/dashboard')}
      />
      
      <Header 
        title="Dashboard"
        subtitle="Quick insights into your business performance."
      />
      
      <main className="page-content">
        {/* Dashboard content area */}
      </main>
    </div>
  );
};

export default Dashboard;