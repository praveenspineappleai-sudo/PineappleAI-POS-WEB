// src/components/StatsCards2.js
import React from 'react';
import '../styles/statscards2.css';
/// A reusable component that displays key inventory statistics in a card format, such as total products, low stock items, out of stock items, and categories.
const StatsCards2 = ({ stats = {} }) => {
  const {
    totalProducts = 0,
    lowStock = 0,
    outOfStock = 0,
    categories = 0
  } = stats;

  const formatNumber = (number) => {
    return number.toLocaleString();
  };

  return (
    <div className="stats-cards-container-2">
      <div className="stats-card-2">
        <div className="stats-card-content-2">
          <h3 className="stats-title-2">Total products</h3>
          <p className="stats-value-2">{formatNumber(totalProducts)}</p>
        </div>
      </div>

      <div className="stats-card-2">
        <div className="stats-card-content-2">
          <h3 className="stats-title-2">Low stock</h3>
          <p className="stats-value-2">{formatNumber(lowStock)}</p>
        </div>
      </div>

      <div className="stats-card-2">
        <div className="stats-card-content-2">
          <h3 className="stats-title-2">Out of stock</h3>
          <p className="stats-value-2">{formatNumber(outOfStock)}</p>
        </div>
      </div>

      <div className="stats-card-2">
        <div className="stats-card-content-2">
          <h3 className="stats-title-2">Category</h3>
          <p className="stats-value-2">{formatNumber(categories)}</p>
        </div>
      </div>
    </div>
  );
};

export default StatsCards2;