// src/components/Pagination.js
import React from 'react';
import '../styles/pagination.css';
// A reusable pagination component that can be used across different pages of the application
const Pagination = ({ 
  currentPage = 1, 
  totalPages = 5,
  totalEntries = 50,
  entriesPerPage = 10,
  onPageChange = () => {},
  showPrevNext = true,
  maxVisiblePages = 5
}) => {
  
  // If no totalPages provided or invalid, show a default pagination
  if (!totalPages || totalPages <= 0) {
    return null;
  }

  // Calculate the range of entries being shown
  const startEntry = Math.min((currentPage - 1) * entriesPerPage + 1, totalEntries);
  const endEntry = Math.min(currentPage * entriesPerPage, totalEntries);

  // Generate array of page numbers to display
  const getVisiblePages = () => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const half = Math.floor(maxVisiblePages / 2);
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + maxVisiblePages - 1);

    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };
  // Get the array of visible page numbers based on the current page and total pages
  const visiblePages = getVisiblePages();
  // Handler for when a page number is clicked - triggers the onPageChange callback with the new page number
  const handlePageClick = (page) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };
  // Handlers for Previous and Next buttons - ensure they only trigger if not on the first or last page respectively
  const handlePrevClick = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };
   // Handler for Next button click - triggers onPageChange with the next page number if not on the last page
  const handleNextClick = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        Showing {startEntry} - {endEntry} of {totalEntries} entries
      </div>
      
      <div className="pagination-controls">
        {showPrevNext && (
          <button
            className={`pagination-nav ${currentPage === 1 ? 'pagination-nav--disabled' : ''}`}
            onClick={handlePrevClick}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            ‹
          </button>
        )}

        {visiblePages.map((page) => (
          <button
            key={page}
            className={`pagination-page ${page === currentPage ? 'pagination-page--active' : ''}`}
            onClick={() => handlePageClick(page)}
            aria-label={`Page ${page}`}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </button>
        ))}

        {showPrevNext && (
          <button
            className={`pagination-nav ${currentPage === totalPages ? 'pagination-nav--disabled' : ''}`}
            onClick={handleNextClick}
            disabled={currentPage === totalPages}
            aria-label="Next page"
          >
            ›
          </button>
        )}
      </div>
    </div>
  );
};

export default Pagination;