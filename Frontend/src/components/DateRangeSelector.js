//src\components\DateRangeSelector.js
import React, { useState } from 'react';
import '../styles/daterangeselector.css';
// DateRangeSelector component with tabs for Today, Weekly, and Monthly selections
const DateRangeSelector = ({ selectedRange = 'today', selectedDate, onRangeChange }) => {
  const getFormattedDate = (d = new Date()) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getFormattedMonth = (d = new Date()) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  const getSevenDaysAgoDate = () => {
    const now = new Date();
    const past = new Date(now);
    past.setDate(now.getDate() - 6);
    return getFormattedDate(past);
  };

  const [activeTab, setActiveTab] = useState(
    selectedRange ? selectedRange.charAt(0).toUpperCase() + selectedRange.slice(1) : 'Today'
  );

  const [currentDate, setCurrentDate] = useState(getFormattedDate());
  const [startDate, setStartDate] = useState(getSevenDaysAgoDate());
  const [endDate, setEndDate] = useState(getFormattedDate());
  const [selectedMonth, setSelectedMonth] = useState(getFormattedMonth());

  const tabs = ['Today', 'Weekly', 'Monthly'];

  const handleTabChange = (tab) => {
    setActiveTab(tab);

    if (!onRangeChange) return;

    if (tab === 'Today') {
      onRangeChange('today', currentDate);
    } else if (tab === 'Weekly') {
      onRangeChange('weekly', {
        startDate,
        endDate
      });
    } else if (tab === 'Monthly') {
      onRangeChange('monthly', selectedMonth);
    }
  };

  const handleDateChange = (value, type) => {
    switch (type) {
      case 'single':
        setCurrentDate(value);
        if (onRangeChange) {
          onRangeChange('today', value);
        }
        break;
      case 'start':
        setStartDate(value);
        if (onRangeChange) {
          onRangeChange('weekly', { startDate: value, endDate });
        }
        break;
      case 'end':
        setEndDate(value);
        if (onRangeChange) {
          onRangeChange('weekly', { startDate, endDate: value });
        }
        break;
      case 'month':
        setSelectedMonth(value);
        if (onRangeChange) {
          onRangeChange('monthly', value);
        }
        break;
      default:
        break;
    }
  };
  // Utility functions to format dates for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  // Utility function to format month for display
  const formatMonth = (monthString) => {
    const [year, month] = monthString.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };
  // Function to render the appropriate date input fields based on the active tab

  const renderDateInput = () => {
    switch (activeTab) {
      case 'Today':
        return (
          <div className="date-input-container">
            <div className="selected-date-display">
              Select Date
            </div>
            <div className="date-input-wrapper">
              <input
                type="date"
                value={currentDate}
                onChange={(e) => handleDateChange(e.target.value, 'single')}
                className="date-input-field"
              />
            </div>
          </div>
        );

      case 'Weekly':
        return (
          <div className="date-input-container">
            <div className="selected-date-display">
              Select Range
            </div>
            <div className="date-range-inputs">
              <div className="date-input-wrapper">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => handleDateChange(e.target.value, 'start')}
                  className="date-input-field"
                  placeholder="Start date"
                />
              </div>
              <span className="date-range-separator">to</span>
              <div className="date-input-wrapper">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => handleDateChange(e.target.value, 'end')}
                  className="date-input-field"
                  placeholder="End date"
                />
              </div>
            </div>
          </div>
        );

      case 'Monthly':
        return (
          <div className="date-input-container">
            <div className="selected-date-display">
              Select Month
            </div>
            <div className="date-input-wrapper">
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => handleDateChange(e.target.value, 'month')}
                className="date-input-field"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="modern-date-range-selector" style={{ minWidth: 'auto' }}>
      {/* Tab Navigation */}
      <div className="tab-navigation">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`tab-btn ${activeTab === tab ? 'active-tab' : ''}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Date Input Section */}
      <div className="date-input-section">
        {renderDateInput()}
      </div>
    </div>
  );
};

export default DateRangeSelector;