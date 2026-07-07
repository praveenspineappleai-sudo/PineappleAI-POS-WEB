// src/models/CustomerDetails.js
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Search from '../components/Search';
import ProcessOrderButton from '../components/buttons/ProceedOrderButton';
import AddCustomer from './AddCustomer';
import Discount from './Discount';
import '../styles/customerdetails.css';
import customerIcon from '../assets/icons/customer.png';
import { useToast } from '../contexts/ToastContext';


const CustomerDetails = ({ 
  isOpen, 
  onClose, 
  totalAmount = 0, 
  onProceedOrder, 
  onCustomerSelect, 
  selectedCustomer 
}) => {

  const [searchTerm, setSearchTerm] = useState('');// State for the search input
  const { showModal } = useToast();// Toast context for showing messages

  const [localSelectedCustomer, setLocalSelectedCustomer] = useState(selectedCustomer);// Local state to manage selected customer within this component
  const [showAddCustomer, setShowAddCustomer] = useState(false);// State to control visibility of AddCustomer modal
  const [showDiscount, setShowDiscount] = useState(false);// State to control visibility of Discount modal

  const [searchResults, setSearchResults] = useState([]);// State to hold search results from the API
  const [loading, setLoading] = useState(false);// State to indicate if search is in progress

  // keyboard/navigation state
  const [searchFocused, setSearchFocused] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);
  // Refs for debouncing search and managing focus
  const debounceRef = useRef(null);
  const mountedRef = useRef(false);
  const searchInputRef = useRef(null);
  const resultsRef = useRef(null); // <-- container ref for auto-scroll
  // Sync local selected customer with prop changes
  useEffect(() => {
    setLocalSelectedCustomer(selectedCustomer);
    if (selectedCustomer) {
      const n = normalizeCustomer(selectedCustomer);
      setSearchTerm(n?.phoneNumber || '');
    }
  }, [selectedCustomer]);
  // Track mounted state to prevent updates on unmounted component
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);
   // Normalize customer data from various possible API response formats
  const normalizeCustomer = (c) => {
    if (!c) return null;
    const id = c.id ?? c.customer_id ?? c.customerId ?? c._id ?? null;
    const customerName = c.customerName || `${c.first_name || ''} ${c.last_name || ''}`.trim() || c.name || c.fullName || '';
    const phoneNumber = c.phoneNumber || c.phone || c.contact || c.mobile || '';
    return {
      ...c,
      id,
      customer_id: id,
      customerName,
      phoneNumber,
    };
  };
  // Fetch customers based on search term (phone number)
  const fetchCustomers = async (term) => {
    const phoneTerm = (term || '').replace(/\D/g, '');
    if (!phoneTerm) {
      setSearchResults([]);
      setHighlightIndex(0);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(
        `http://192.168.0.123
:5000/api/searchcustomers/customers/search?query=${encodeURIComponent(phoneTerm)}`,);

      let data = [];
      if (response.data && Array.isArray(response.data)) {
        data = response.data;
      } else if (response.data && response.data.customers && Array.isArray(response.data.customers)) {
        data = response.data.customers;
      }

      const mapped = data.map(c => normalizeCustomer(c));
      setSearchResults(mapped);
      setHighlightIndex(mapped.length > 0 ? 0 : -1);
    } catch (err) {
      console.error("Customer search failed:", err);
      setSearchResults([]);
      setHighlightIndex(0);
    } finally {
      setLoading(false);
    }
  };
  // Handle search input changes with debouncing
  const handleSearch = (term) => {
    setSearchTerm(term);
    const digitsOnly = (term || '').replace(/\D/g, '');
    if (digitsOnly.length < 3) {
      setSearchResults([]);
      setHighlightIndex(-1);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchCustomers(term), 250);
  };
  // Handle customer selection from search results
  const handleCustomerSelect = (customer) => {
    const norm = normalizeCustomer(customer);
    setLocalSelectedCustomer(norm);
    onCustomerSelect?.(norm);
    setSearchTerm(norm.phoneNumber || '');
    setSearchResults([]);
    setHighlightIndex(0);
  };
  // Handle add customer icon click
  const handleCustomerIconClick = () => setShowAddCustomer(true);
  // Proceed order -> show discount modal
  const handleProceedOrder = () => setShowDiscount(true);


  // Handle proceeding order from add customer modal
 const handleAddCustomerProceed = (createdCustomer) => {
    if (!createdCustomer) {
      setShowAddCustomer(false);
      return;
    }
   // Normalize and select the newly created customer, then show discount modal
    const norm = normalizeCustomer(createdCustomer);
    setLocalSelectedCustomer(norm);
    onCustomerSelect?.(norm);
    setSearchTerm(norm.phoneNumber || '');
    setSearchResults(prev => {
      const filtered = prev.filter(c => c.id !== norm.id);
      return [norm, ...filtered];
    });
    setShowAddCustomer(false);
    setShowDiscount(true);
    setTimeout(() => { setSearchResults([]); }, 800);
  };
  // Handle closing add customer modal and refocusing search input
  const handleAddCustomerClose = () => {
    setShowAddCustomer(false);
    setTimeout(() => {
      const input = document.getElementById('customerSearchInput');
      if (input) input.focus();
    }, 50);
  };
  // Handle closing discount modal
  const handleDiscountClose = () => setShowDiscount(false);
  const handleDiscountProceedOrder = (customer, discountPercentage, finalAmount) => {
    const payload = {};
    if (customer?.customer_id || customer?.id) payload.customer_id = customer.customer_id || customer.id;
    onProceedOrder?.(payload, discountPercentage, finalAmount);
    handleClose();
  };
  // Handle closing the entire modal and resetting state
  const handleClose = () => {
    setSearchTerm('');
    setSearchResults([]);
    setLocalSelectedCustomer(null);
    setHighlightIndex(0);
    onClose?.();
  };

  // ESC key handler
  const handleEscKey = (e) => {
    if (e.key === 'Escape') {
      const modalElement = document.querySelector('.customer-modal');
      if (modalElement && modalElement.contains(document.activeElement)) {
        e.preventDefault();
        handleClose();
      }
    }
  };
  // Handle arrow keys and page up/down for navigating search results
  const moveSelection = (key) => {
    if (!searchResults || searchResults.length === 0) return;
    if (key === 'ArrowDown') setHighlightIndex(prev => (prev === -1 ? 0 : Math.min(prev + 1, searchResults.length - 1)));
    else if (key === 'ArrowUp') setHighlightIndex(prev => (prev === -1 ? searchResults.length - 1 : Math.max(prev - 1, 0)));
    else if (key === 'PageDown') setHighlightIndex(searchResults.length - 1);
    else if (key === 'PageUp') setHighlightIndex(0);
  };

  useEffect(() => {
    if (isOpen && !showAddCustomer && !showDiscount) {
      setTimeout(() => {
        const input = document.getElementById('customerSearchInput');
        if (input) {
          input.focus();
          searchInputRef.current = input;
          setSearchFocused(true);
        }
      }, 50);
    } else { setSearchFocused(false); }
  }, [isOpen, showAddCustomer, showDiscount]);

  useEffect(() => {
    if (!isOpen || showAddCustomer || showDiscount) return;

    const handleKeyDown = (e) => {
      const activeElement = document.activeElement;
      const isTextInput = activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.isContentEditable);
      if (isTextInput && activeElement.id !== 'customerSearchInput') return;

      handleEscKey(e);

      const key = e.key;
      if (key === 'Delete' && searchFocused) { e.preventDefault(); handleClose(); return; }
      if (key === 'ArrowRight' && searchFocused) { e.preventDefault(); setShowAddCustomer(true); return; }
      if (['ArrowDown','ArrowUp','PageDown','PageUp'].includes(key)) { e.preventDefault(); moveSelection(key); setSearchFocused(false); return; }
      if (key === 'Enter') {
        e.preventDefault();
        if (searchResults.length > 0 && highlightIndex >= 0) {
          const candidate = searchResults[highlightIndex];
          if (candidate) { handleCustomerSelect(candidate); setSearchFocused(false); return; }
        }
        // Always proceed
         handleProceedOrder(); return; 
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showAddCustomer, showDiscount, searchFocused, searchResults, highlightIndex, localSelectedCustomer]);

  useEffect(() => {
    if (!searchResults || searchResults.length === 0) setHighlightIndex(-1);
    else setHighlightIndex(prev => (prev < 0 ? 0 : Math.min(prev, searchResults.length - 1)));
  }, [searchResults]);

  useEffect(() => {
    try {
      if (resultsRef.current && highlightIndex >= 0) {
        const container = resultsRef.current;
        const item = container.children[highlightIndex];
        if (item) item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    } catch (err) {}
  }, [highlightIndex, searchResults]);

  if (!isOpen && !showAddCustomer && !showDiscount) return null;

  return (
    <>
      {isOpen && !showAddCustomer && !showDiscount && (
        <div className="modal-overlay" onClick={handleClose}>
          <div className="customer-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Customer details</h2>
              <button className="close-btn" onClick={handleClose}>×</button>
            </div>
            <div className="modal-body">
              <div className="customer-search-section">
                <div className="customer-search-input-container">
                  <Search
                    value={searchTerm}
                    onSearch={(t) => { setSearchTerm(t); handleSearch(t); }}
                    inputId="customerSearchInput"
                    onFocus={() => setSearchFocused(true)}
                    placeholder="Search by mobile number (without leading 0 [e.g: 7X XXXXXX])"
                  />
                </div>
                <div className="customer-icon-wrapper" onClick={handleCustomerIconClick} role="button" tabIndex={0}
                     onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCustomerIconClick(); }}>
                  <img src={customerIcon} alt="Customer" className="customer-icon" />
                </div>
              </div>
              {loading && <div className="search-loading">Searching...</div>}
              {!loading && searchResults.length > 0 && (
                <div className="search-results-dropdown search-results-dropdown-scrollable" role="list" aria-label="Customer search results" ref={resultsRef}>
                  {searchResults.map((customer, index) => (
                    <div key={customer.id ?? index} className={`search-result-item search-result-item-default ${highlightIndex===index?'search-result-item-highlight':''}`} onClick={()=>handleCustomerSelect(customer)} onMouseEnter={()=>setHighlightIndex(index)} role="listitem" tabIndex={-1}>
                      <div className="customer-info">
                        <div className="customer-name">{customer.customerName || customer.name}</div>
                        <div className="customer-details">{customer.phoneNumber || customer.phone}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {localSelectedCustomer && (
                <div className="selected-customer">
                  <div className="customer-card">
                    <div className="customer-name-large">{localSelectedCustomer.customerName || localSelectedCustomer.name}</div>
                    <div className="customer-contact"><span>{localSelectedCustomer.phoneNumber || localSelectedCustomer.phone}</span></div>
                  </div>
                </div>
              )}
              <div className="total-amount-section">
                <span className="total-label">Total amount</span>
                <span className="total-amount">Rs {Number(totalAmount||0).toLocaleString()}.00</span>
              </div>
            </div>
            <div className="modal-footer">
              <ProcessOrderButton onClick={handleProceedOrder} title="Proceed order"/>
            </div>
          </div>
        </div>
      )}

      <AddCustomer
        isOpen={showAddCustomer}
        onClose={handleAddCustomerClose}
        totalAmount={totalAmount}
        onProceedOrder={handleAddCustomerProceed}
      />

      <Discount
        isOpen={showDiscount}
        onClose={handleDiscountClose}
        totalAmount={totalAmount}
        customer={localSelectedCustomer}
        onProceedOrder={handleDiscountProceedOrder}
      />

    



    </>
  );
};

export default CustomerDetails;
