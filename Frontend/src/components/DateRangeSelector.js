//src\components\DateRangeSelector.js
import React, { useState } from 'react';
import '../styles/daterangeselector.css';
// DateRangeSelector component with tabs for Today, Weekly, and Monthly selections
const DateRangeSelector = ({ selectedRange, selectedDate, onRangeChange }) => {
  // Get current date in YYYY-MM-DD format
  const getCurrentDate = () => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  };

  // Get current month in YYYY-MM format
  const getCurrentMonth = () => {
    const now = new Date();
    return now.toISOString().substring(0, 7);
  };

  // Calculate one week from now for the end date
  const getOneWeekFromNow = () => {
    const now = new Date();
    const oneWeekLater = new Date(now);
    oneWeekLater.setDate(now.getDate() + 7);
    return oneWeekLater.toISOString().split('T')[0];
  };
  /// State management for active tab and date selections
  const [activeTab, setActiveTab] = useState('Today');
  // Initialize date states based on current date and month
  const [currentDate, setCurrentDate] = useState(getCurrentDate());
  // For weekly range, we maintain separate states for start and end dates
  const [startDate, setStartDate] = useState(getCurrentDate());
  // For weekly range, we set the end date to one week from now by default
  const [endDate, setEndDate] = useState(getOneWeekFromNow());
  // For monthly selection, we maintain a state for the selected month
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  // Define the available tabs for selection
  const tabs = ['Today', 'Weekly', 'Monthly'];
  // Handler for tab changes - updates active tab and triggers range change callback
  const handleTabChange = (tab) => {
    setActiveTab(tab);

    if (!onRangeChange) return;

    if (tab === 'Today') {
      onRangeChange('today', currentDate);
    }

    if (tab === 'Weekly') {
      onRangeChange('weekly', {
        startDate,
        endDate
      });
    }

    if (tab === 'Monthly') {
      onRangeChange('monthly', selectedMonth);
    }
  };


  const handleDateChange = (value, type) => {
    // eslint-disable-next-line default-case
    switch (type) {
      case 'single':
        setCurrentDate(value);
        if (onRangeChange) {
          onRangeChange(activeTab.toLowerCase(), value);
        }
        break;
      case 'start':
        setStartDate(value);
        if (onRangeChange && activeTab === 'Weekly') {
          onRangeChange('weekly', { startDate: value, endDate });
        }
        break;
      case 'end':
        setEndDate(value);
        if (onRangeChange && activeTab === 'Weekly') {
          onRangeChange('weekly', { startDate, endDate: value });
        }
        break;
      case 'month':
        setSelectedMonth(value);
        if (onRangeChange) {
          onRangeChange(activeTab.toLowerCase(), value);
        }
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