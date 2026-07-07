// src/components/StatsCards.js
import React from 'react';
import '../styles/statscards.css';
// A reusable component that displays key statistics in a card format, such as monthly sales, orders, new customers, and profit.
const StatsCards = ({ stats = {} }) => {
  const {
    monthlySales = 0,
    monthlyOrders = 0,
    newCustomers = 0,
    monthlyProfit = 0,
    currency = 'Rs'
  } = stats;
  // Utility function to format currency values with the specified currency symbol and thousands separators
  const formatCurrency = (amount) => {
    return `${currency} ${amount.toLocaleString()}`;
  };
  // Utility function to format numbers with thousands separators for better readability
  const formatNumber = (number) => {
    return number.toLocaleString();
  };

  return (
    <div className="stats-cards-container">
      <div className="stats-card">
        <div className="stats-card-content">
          <h3 className="stats-title">Monthly sales</h3>
          <p className="stats-value">{formatCurrency(monthlySales)}</p>
        </div>
      </div>

      <div className="stats-card">
        <div className="stats-card-content">
          <h3 className="stats-title">Monthly orders</h3>
          <p className="stats-value">{formatNumber(monthlyOrders)}</p>
        </div>
      </div>

      <div className="stats-card">
        <div className="stats-card-content">
          <h3 className="stats-title">New customers</h3>
          <p className="stats-value">{formatNumber(newCustomers)}</p>
        </div>
      </div>

      <div className="stats-card">
        <div className="stats-card-content">
          <h3 className="stats-title">Monthly profit</h3>
          <p className="stats-value">{formatCurrency(monthlyProfit)}</p>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;