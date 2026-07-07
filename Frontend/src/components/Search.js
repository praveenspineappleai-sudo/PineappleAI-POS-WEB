// src/components/Search.js
import React, { useState, useEffect } from 'react';
import '../styles/search.css';
import searchIcon from '../assets/icons/search.png';

const Search = ({ onSearch, value = '', placeholder = 'Search', onKeyNavigation, inputId = 'searchInput', onFocus }) => {
  const [searchTerm, setSearchTerm] = useState(value);

  // Update local state when value prop changes
  useEffect(() => {
    setSearchTerm(value);
  }, [value]);
  // Handler for input change - updates local state and calls onSearch callback with the new value
  const handleSearch = (e) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);

    if (onSearch) {
      onSearch(newValue);
    }
  };
  // Handler for key down events - checks for specific keys and calls onKeyNavigation callback with the corresponding action
  const handleKeyDown = (e) => {
    if (onKeyNavigation) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        onKeyNavigation("DOWN");
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        onKeyNavigation("UP");
      } else if (e.key === "Enter") {
        e.preventDefault();
        onKeyNavigation("ENTER");
      } else if (e.key === "PageDown") {
        e.preventDefault();
        onKeyNavigation("PAGEDOWN");
      } else if (e.key === "PageUp") {
        e.preventDefault();
        onKeyNavigation("PAGEUP");
      }
    }
  };

  return (
    <div className="search-input-container">
      <img src={searchIcon} alt="Search" className="search-icon" />
      <input
        id={inputId}
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={handleSearch}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        className="search-input"
        autoComplete="off"
      />
    </div>
  );
};

export default Search;
