//path: src/models/Discount.js
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/apiConfig';
import Search from '../components/Search';
import ProcessOrderButton from '../components/buttons/ProceedOrderButton';
import AddCustomer from './AddCustomer';
import { useToast } from '../contexts/ToastContext';
import '../styles/discount.css';
import customerIcon from '../assets/icons/customer.png';

const Discount = ({ isOpen, onClose, totalAmount, customer, onProceedOrder }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(customer);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [discountPercentage, setDiscountPercentage] = useState(0);

  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showModal } = useToast();
  const sliderRef = useRef(null);   // ⭐ Discount Slider Focus
  const proceedBtnRef = useRef(null); // ⭐ Proceed Button Focus

  // Sync customer prop → local state
  useEffect(() => {
    setSelectedCustomer(customer);
  }, [customer]);

  // AUTO FOCUS DISCOUNT SLIDER WHEN PAGE OPEN
 useEffect(() => {
  if (!isOpen) return;

  const handleKeys = (e) => {

    // ESC → Close popup
    if (e.key === "Escape") {
      onClose();
      return;
    }

    // LEFT ARROW → Discount -1
    if (e.key === "," || e.key === "ArrowLeft") {
      setDiscountPercentage((prev) => {
        const val = Number(prev);
        return val > 0 ? val - 1 : 0;
      });
      return;
    }

    // RIGHT ARROW → Discount +1
    if (e.key === "." || e.key === "ArrowRight") {
      setDiscountPercentage((prev) => {
        const val = Number(prev);
        return val < 10 ? val + 1 : 10;
      });
      return;
    }

    // ENTER → Proceed order
    if (e.key === "Enter") {
      if (proceedBtnRef.current) {
        e.preventDefault(); // avoid form submission / search focus issues
        proceedBtnRef.current.click();
      }
    }
  };

  window.addEventListener("keydown", handleKeys);
  return () => window.removeEventListener("keydown", handleKeys);
}, [isOpen]);

  // ====== BACKEND CUSTOMER SEARCH ====== //
  const fetchCustomers = async (term) => {
    if (!term || term.trim() === '') {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);

      const response = await axios.get(`${API_BASE_URL}/api/searchcustomers/customers/search?query=${encodeURIComponent(term)}`);

      if (response.data && Array.isArray(response.data)) {
        setSearchResults(response.data);
      } else if (response.data.customers) {
        setSearchResults(response.data.customers);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  let searchDelay;
  // Handle search input with debounce
  const handleSearch = (term) => {
    setSearchTerm(term);

    if (searchDelay) clearTimeout(searchDelay);

    searchDelay = setTimeout(() => {
      fetchCustomers(term);
    }, 500);
  };
  // Handle selecting a customer from search results
  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    setSearchTerm(customer.customerName || customer.name);
    setSearchResults([]);
  };

  // Add customer modal open
  const handleCustomerIconClick = () => {
    setShowAddCustomer(true);
  };
 // Handle discount slider change
  const handleDiscountChange = (e) => {
    setDiscountPercentage(parseInt(e.target.value));
  };
  // Handle proceeding order with discount
  const discountAmount = (totalAmount * discountPercentage) / 100;
  const finalAmount = totalAmount - discountAmount;
  // When proceeding order, send selected customer ID (if any), discount percentage, and final amount to parent
  const handleProceed = () => {
  const payload = {};

  // Send customer_id ONLY if customer is selected
  if (selectedCustomer?.id) {
    payload.customer_id = selectedCustomer.id;
  }

  onProceedOrder(
    payload,
    discountPercentage,
    finalAmount
  );

  handleClose();
  };

  // Handle proceeding order from add customer modal
  const handleAddCustomerProceed = (customer) => {
    const formatted = {
      ...customer,
      lastPurchaseAmount: 0,
    };

    setSelectedCustomer(formatted);
    setShowAddCustomer(false);
  };
  // Handle closing add customer modal and refocusing search input
  const handleAddCustomerClose = () => {
    setShowAddCustomer(false);
  };
  // Handle closing discount modal
  const handleClose = () => {
    setSearchTerm('');
    setSearchResults([]);
    setDiscountPercentage(0);
    onClose();
  };

  if (!isOpen && !showAddCustomer) return null;

  return (
    <>
      {isOpen && (
        <div className="discount-overlay" onClick={handleClose}>
          <div className="discount-modal" onClick={(e) => e.stopPropagation()}>
            <div className="discount-header">
              <h2 className="discount-title">Customer Details</h2>
              <button className="discount-close-btn" onClick={handleClose}>×</button>
            </div>

            <div className="discount-body">

              {/* SEARCH BAR */}
              <div className="discount-search-section">
                <div className="discount-search-input-container">
                  <Search
                    onSearch={handleSearch}
                    placeholder="Search customer"
                  />
                </div>

                <div className="discount-customer-icon-wrapper" onClick={handleCustomerIconClick}>
                  <img src={customerIcon} alt="Add Customer" className="discount-customer-icon" />
                </div>
              </div>

              {/* Loading */}
              {loading && <div className="discount-loading">Searching...</div>}

              {/* SEARCH RESULTS */}
              {!loading && searchResults.length > 0 && (
                <div className="discount-search-results">
                  {searchResults.map((cus, idx) => (
                    <div
                      key={idx}
                      className={`discount-search-result ${selectedCustomer?.id === cus.id ? 'selected' : ''}`}
                      onClick={() => handleCustomerSelect(cus)}
                    >
                      <div className="discount-customer-info">
                        <div className="discount-customer-name">{cus.customerName || cus.name}</div>
                        <div className="discount-customer-details">{cus.phoneNumber || cus.phone}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* SELECTED CUSTOMER */}
              {selectedCustomer && (
                <div className="discount-selected-customer">
                  <div className="discount-customer-card">
                    <div className="discount-customer-name-large">
                      {selectedCustomer.customerName || selectedCustomer.name}
                    </div>

                    <div className="discount-customer-contact">
                      <span>{selectedCustomer.phoneNumber || selectedCustomer.phone}</span>
                    </div>

                    {selectedCustomer.lastPurchaseAmount && (
                      <div className="discount-last-purchase">
                        Last purchase: Rs {(selectedCustomer.lastPurchaseAmount).toLocaleString()}.00
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* AMOUNTS */}
              <div className="discount-amount-sections">
                <div className="discount-amount-row">
                  <span className="discount-amount-label">Initial amount</span>
                  <span className="discount-amount-value">Rs {totalAmount.toLocaleString()}.00</span>
                </div>

                {/* DISCOUNT SLIDER */}
                <div className="discount-slider-section">
                  <div className="discount-slider-header">
                    <span className="discount-amount-label">Discount</span>
                    <span className="discount-percentage-value">{discountPercentage}%</span>
                  </div>

                  <input
                    ref={sliderRef}
                    type="range"
                    min="0"
                    max="10"
                    value={discountPercentage}
                    onChange={handleDiscountChange}
                    className="discount-slider"
                  />

                  {discountPercentage > 0 && (
                    <div className="discount-amount-display">
                      <span className="discount-amount-label">Discount amount:</span>
                      <span className="discount-amount-value">- Rs {discountAmount.toLocaleString()}.00</span>
                    </div>
                  )}
                </div>

                <div className="discount-amount-row discount-total-row">
                  <span className="discount-amount-label">Total amount</span>
                  <span className="discount-amount-value">Rs {finalAmount.toLocaleString()}.00</span>
                </div>
              </div>
            </div>

            <div className="discount-footer">
              <ProcessOrderButton
                ref={proceedBtnRef}
                onClick={handleProceed}
                title="Proceed order"
              />
            </div>
          </div>
        </div>
      )}

      {/* ADD CUSTOMER */}
      <AddCustomer
        isOpen={showAddCustomer}
        onClose={handleAddCustomerClose}
        totalAmount={totalAmount}
        onProceedOrder={handleAddCustomerProceed}
      />
    </>
  );
};

export default Discount;
