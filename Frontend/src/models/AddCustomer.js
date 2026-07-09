//path: src/models/AddCustomer.js
// **ADD CUSTOMER COMPONENT**
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Search from "../components/Search";
import SaveButton from "../components/buttons/SaveButton";
import ProcessOrderButton from "../components/buttons/ProceedOrderButton";
import Discount from "./Discount";
import "../styles/addcustomer.css";
import customerIcon from "../assets/icons/customer.png";
import axios from "axios";
import { useToast } from "../contexts/ToastContext";

import { API_BASE_URL as BASE_URL } from '../config/apiConfig';

const API_BASE_URL = `${BASE_URL}/api/customers/create`;

const AddCustomer = ({ isOpen, onClose, totalAmount, onProceedOrder }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [customerData, setCustomerData] = useState({
    name: "",
    phone: "",
    email: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDiscount, setShowDiscount] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const [customers] = useState([]);
  const [searchResults, setSearchResults] = useState([]);

  // INPUT REFS
  const nameRef = useRef(null);
  const phoneRef = useRef(null);
  const emailRef = useRef(null);
  const saveBtnRef = useRef(null);

  // AUTO FOCUS
  useEffect(() => {
    if (isOpen && nameRef.current) {
      setTimeout(() => nameRef.current.focus(), 150);
    }
  }, [isOpen]);

  // KEYBOARD NAVIGATION
  useEffect(() => {
    if (!isOpen) return;

    const handleKey = (e) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();

        if (document.activeElement === nameRef.current) {
          phoneRef.current?.focus();
        } else if (document.activeElement === phoneRef.current) {
          emailRef.current?.focus();
        } else if (document.activeElement === emailRef.current) {
          handleSave();
        }
        return;
      }

      if (e.ctrlKey && e.key === "Enter") {
        handleProceedOrder();
        return;
      }

      if (e.key === "PageUp") {
        if (document.activeElement === phoneRef.current) nameRef.current?.focus();
        else if (document.activeElement === emailRef.current)
          phoneRef.current?.focus();
        return;
      }

      if (e.key === "PageDown") {
        if (document.activeElement === nameRef.current) phoneRef.current?.focus();
        else if (document.activeElement === phoneRef.current)
          emailRef.current?.focus();
        return;
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, customerData, selectedCustomer]);

  // EMAIL VALIDATION
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  // **SEARCH FUNCTIONALITY**
  const handleSearch = (term) => {
    setSearchTerm(term);
    if (term.trim() === "") {
      setSearchResults([]);
      return;
    }
    
    const filtered = customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(term.toLowerCase()) ||
        customer.phone.includes(term) ||
        customer.email.toLowerCase().includes(term.toLowerCase())
    );
    setSearchResults(filtered);
  };
  // **HANDLE CUSTOMER SELECTION**
  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    setSearchTerm(customer.name);
    setSearchResults([]);
    setErrors({});
    setCustomerData({ name: "", phone: "", email: "" });
  };
  // **RESET FORM ON ICON CLICK**
  const handleCustomerIconClick = () => {
    setCustomerData({ name: "", phone: "", email: "" });
    setSearchTerm("");
    setSearchResults([]);
    setSelectedCustomer(null);
    setErrors({});
    setShowDiscount(false);

    setTimeout(() => nameRef.current?.focus(), 120);
  };
  // **HANDLE INPUT CHANGE**
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (selectedCustomer) {
      setSelectedCustomer(null);
      setSearchTerm("");
    }
  };

  // **UPDATED VALIDATION**
  const validateForm = () => {
    const newErrors = {};
    if (!customerData.name.trim()) newErrors.name = "Name is required";
    if (!customerData.phone.trim())
      newErrors.phone = "Contact number is required";

    // ✔ EMAIL OPTIONAL
    if (customerData.email.trim() && !validateEmail(customerData.email)) {
      newErrors.email = "Enter valid email";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // SAVE CUSTOMER API
  const handleSave = async () => {
  if (selectedCustomer) {
    showToast(
      "Warning",
      "Cannot save - an existing customer is already selected",
      "info",
      3000
    );
    return;
  }

  if (!validateForm()) return;

  try {
    setIsSaving(true);

    // ✔ SEND EMAIL ONLY IF NOT EMPTY
    const payload = {
      name: customerData.name,
      phone_no: customerData.phone,
    };

    if (customerData.email.trim() !== "") {
      payload.email = customerData.email;
    }

    const response = await axios.post(API_BASE_URL, payload);

    showToast("Success", "Customer created successfully", "success", 3000);
    // CREATE A NEW CUSTOMER OBJECT TO PASS TO THE ORDER SUMMARY
    const newCustomer = {
      id: response.data.id || Date.now(),
      ...response.data,
      customerName: response.data.name,
      phoneNumber: response.data.phone_no,
      lastPurchaseAmount: 0,
    };

    setSelectedCustomer(newCustomer);

    if (onProceedOrder) {
      onProceedOrder(newCustomer);
    }
  } catch (error) {
    console.error("❌ Error creating customer:", error);
    showToast(
      "Error",
      "Failed to create customer. Please try again.",
      "error",
      3000
    );
  } finally {
    setIsSaving(false);
  }
};


  // PROCEED ORDER
  const handleProceedOrder = () => {
    const customerToUse = selectedCustomer || { id: Date.now(), ...customerData, lastPurchaseAmount: 0 };
    if (!selectedCustomer && !validateForm()) return;
    if (onProceedOrder) {
      onProceedOrder(customerToUse);
    }
    setShowDiscount(true);
  };

 
  // DISCOUNT MODAL HANDLERS
  const handleDiscountClose = () => {
    setShowDiscount(false);
    handleClose();
  };
  // PROCEED ORDER FROM DISCOUNT MODAL
  const handleDiscountProceedOrder = (
    customer,
    discountPercentage,
    finalAmount
  ) => {
    if (onProceedOrder) {
      onProceedOrder(customer, discountPercentage, finalAmount);
    }
    handleClose();
  };
  // CLOSE MODAL AND RESET STATE
  const handleClose = () => {
    setCustomerData({ name: "", phone: "", email: "" });
    setSearchTerm("");
    setSearchResults([]);
    setSelectedCustomer(null);
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="addcustomer-overlay" onClick={handleClose}>
        <div className="addcustomer-modal" onClick={(e) => e.stopPropagation()}>
          <div className="addcustomer-header">
            <h2 className="addcustomer-title">Customer details</h2>
            <button className="addcustomer-close-btn" onClick={handleClose}>
              ×
            </button>
          </div>

          <div className="addcustomer-body">
            <div className="addcustomer-search-section">
              <div
                className="addcustomer-icon-wrapper"
                onClick={handleCustomerIconClick}
              >
                <img
                  src={customerIcon}
                  alt="Customer"
                  className="addcustomer-icon"
                />
              </div>
              <Search onSearch={handleSearch} />
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="addcustomer-search-results">
                {searchResults.map((customer) => (
                  <div
                    key={customer.id}
                    className={`addcustomer-search-result ${
                      selectedCustomer?.id === customer.id ? "selected" : ""
                    }`}
                    onClick={() => handleCustomerSelect(customer)}
                  >
                    <div className="addcustomer-info">
                      <div className="addcustomer-name">{customer.name}</div>
                      <div className="addcustomer-details">
                        {customer.phone}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* FORM FIELDS */}
            <div className="addcustomer-form">
              <div className="addcustomer-form-group">
                <label className="addcustomer-label">Name</label>
                <input
                  ref={nameRef}
                  type="text"
                  name="name"
                  value={customerData.name}
                  onChange={handleInputChange}
                  className={`addcustomer-input ${
                    errors.name ? "addcustomer-input-error" : ""
                  }`}
                  placeholder="Enter customer name"
                  disabled={selectedCustomer}
                />
                {errors.name && (
                  <div className="addcustomer-error-message">{errors.name}</div>
                )}
              </div>

              <div className="addcustomer-form-group">
                <label className="addcustomer-label">Contact number</label>
                <input
                  ref={phoneRef}
                  type="tel"
                  name="phone"
                  value={customerData.phone}
                  onChange={handleInputChange}
                  className={`addcustomer-input ${
                    errors.phone ? "addcustomer-input-error" : ""
                  }`}
                  placeholder="Enter contact number (without leading 0 [e.g:71XXXXXXX])"
                  disabled={selectedCustomer}
                />
                {errors.phone && (
                  <div className="addcustomer-error-message">
                    {errors.phone}
                  </div>
                )}
              </div>

              <div className="addcustomer-form-group">
                <label className="addcustomer-label">
                Email <span className="optional-text">(Optional)</span></label>
                <input
                  ref={emailRef}
                  type="email"
                  name="email"
                  value={customerData.email}
                  onChange={handleInputChange}
                  className={`addcustomer-input ${
                    errors.email ? "addcustomer-input-error" : ""
                  }`}
                  placeholder="example@gmail.com"
                  disabled={selectedCustomer}
                />
                {errors.email && (
                  <div className="addcustomer-error-message">
                    {errors.email}
                  </div>
                )}
              </div>

              {!selectedCustomer && (
                <div className="addcustomer-save-section">
                  <SaveButton
                    onClick={handleSave}
                    title={isSaving ? "Saving..." : "Save"}
                  />
                </div>
              )}
            </div>

            {selectedCustomer && (
              <div className="addcustomer-selected">
                <div className="addcustomer-card">
                  <div className="addcustomer-name-large">
                    {selectedCustomer.name}
                  </div>
                  <div className="addcustomer-contact">
                    <span>{selectedCustomer.phone}</span>
                    {selectedCustomer.email && (
                      <span>{selectedCustomer.email}</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="addcustomer-total-section">
              <span className="addcustomer-total-label">Total amount</span>
              <span className="addcustomer-total-amount">
                Rs {totalAmount.toLocaleString()}.00
              </span>
            </div>
          </div>

          <div className="addcustomer-footer">
            <ProcessOrderButton
              onClick={handleProceedOrder}
              title="Proceed order"
            />
          </div>
        </div>
      </div>

      <Discount
        isOpen={showDiscount}
        onClose={handleDiscountClose}
        totalAmount={totalAmount}
        customer={selectedCustomer}
        onProceedOrder={handleDiscountProceedOrder}
      />
    </>
  );
};

export default AddCustomer;
