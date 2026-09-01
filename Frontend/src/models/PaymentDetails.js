//path: src/models/PaymentDetails.js
import React, { useState, useEffect, useRef } from 'react';
import CheckBalanceButton from '../components/buttons/CheckBalanceButton';
import ConfirmationPopup from './ConfirmationPopup';
import '../styles/paymentdetails.css';

const PaymentDetails = ({ 
  isOpen, 
  onClose, 
  onBackToDiscount,   // ⭐ NEW PROP
  totalAmount, 
  customer, 
  discountPercentage, 
  onOrderComplete 
}) => {

  const [paidAmount, setPaidAmount] = useState('');
  const [balance, setBalance] = useState(null);
  const [isBalanceChecked, setIsBalanceChecked] = useState(false);
  const [error, setError] = useState('');
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [paymentData, setPaymentData] = useState(null);

  const amountInputRef = useRef(null);
  const checkBtnRef = useRef(null);

  // AUTO FOCUS amount field when modal opens
  useEffect(() => {
    if (isOpen && amountInputRef.current) {
      setTimeout(() => amountInputRef.current.focus(), 150);
    }
  }, [isOpen]);

  // ENTER → Check Balance / Confirm Payment
  useEffect(() => {
    if (!isOpen || isConfirmationOpen) return;

    const handleEnterKey = (e) => {
      if (e.key === "Enter") {
        if (checkBtnRef.current) {
          checkBtnRef.current.click();
        }
      }
    };

    window.addEventListener("keydown", handleEnterKey);
    return () => window.removeEventListener("keydown", handleEnterKey);
  }, [isOpen, isConfirmationOpen, balance]);

  // ⭐ ESC → BACK ONLY TO DISCOUNT POPUP (not main)
  useEffect(() => {
    if (!isOpen || isConfirmationOpen) return;

    const handleEscKey = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        e.preventDefault();

        if (onBackToDiscount) {
          onBackToDiscount();   // ⭐ Go back to discount popup only
        }
      }
    };

    window.addEventListener("keydown", handleEscKey);
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [isOpen, isConfirmationOpen]);

  // Paid amount change
  const handlePaidAmountChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setPaidAmount(value);
      setBalance(null);
      setIsBalanceChecked(false);
      setError('');
    }
  };

  // Check balance
  const handleCheckBalance = () => {
    if (!paidAmount || paidAmount === '0') {
      setError('Please enter a valid paid amount');
      return;
    }

    const paid = parseFloat(paidAmount);
    const calculatedBalance = paid - totalAmount;
    setBalance(calculatedBalance);
    setIsBalanceChecked(true);
    setError('');
  };

  // Confirm payment
  const handleConfirmPayment = () => {
    if (!paidAmount || paidAmount === '0') {
      setError('Please enter a valid paid amount');
      return;
    }

    if (!isBalanceChecked) {
      setError('Please check balance first');
      return;
    }

    const data = {
      customer,
      totalAmount,
      paidAmount: parseFloat(paidAmount),
      balance,
      discountPercentage
    };

    setPaymentData(data);
    setIsConfirmationOpen(true);
  };

  // Final yes confirm
  const handleFinalConfirm = () => {
    console.log('Payment confirmed:', paymentData);

    setIsConfirmationOpen(false);
    setPaidAmount('');
    setBalance(null);
    setIsBalanceChecked(false);
    setError('');
    setPaymentData(null);

    onClose();

    if (onOrderComplete) {
      onOrderComplete(parseFloat(paidAmount));
    }
  };

  const handleConfirmationCancel = () => {
    setIsConfirmationOpen(false);
  };

  const handleClose = () => {
    setPaidAmount('');
    setBalance(null);
    setIsBalanceChecked(false);
    setError('');
    setIsConfirmationOpen(false);
    setPaymentData(null);
    onClose();
  };

  if (!isOpen) return null;

  const getButtonTitle = () => {
    if (balance !== null) return 'Confirm payment';
    return 'Check balance';
  };

  const handleButtonClick = () => {
    if (balance !== null) {
      handleConfirmPayment();
    } else {
      handleCheckBalance();
    }
  };

  const displayBalance = balance !== null ? balance : 0;
  const enteredAmount = paidAmount === '' ? null : Number(paidAmount);
  const isBelowTotal = enteredAmount !== null && enteredAmount > 0 && enteredAmount < totalAmount;
  const isConfirmDisabled = enteredAmount === null || enteredAmount <= 0 || isBelowTotal || (balance !== null && balance < 0);

  return (
    <>
      {!isConfirmationOpen && (
        <div className="payment-overlay" onClick={handleClose}>
          <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
            <div className="payment-header">
              <h2 className="payment-title">Payment details</h2>
              <button className="payment-close-btn" onClick={handleClose}>
                ×
              </button>
            </div>

            <div className="payment-body">
              <div className="payment-amount-row">
                <span className="payment-amount-label">Total amount</span>
                <span className="payment-amount-value">
                  RS {totalAmount.toLocaleString()}.00
                </span>
              </div>

              <div className="payment-input-section">
                <label className="payment-input-label">Paid amount</label>
                <input
                  ref={amountInputRef}
                  type="text"
                  className={`payment-input ${error ? 'payment-input-error' : ''}`}
                  placeholder="Enter amount"
                  value={paidAmount}
                  onChange={handlePaidAmountChange}
                />
                {error && <div className="payment-error-message">{error}</div>}
              </div>

              <div className="payment-balance-row">
                <span className="payment-balance-label">Balance</span>
                <span className={`payment-balance-value ${balance < 0 ? 'negative' : ''}`}>
                  Rs {Math.abs(displayBalance).toLocaleString()}.00
                </span>
              </div>
            </div>

            <div className={`payment-footer ${balance !== null ? 'confirm-mode' : ''}`}>
              <CheckBalanceButton
                ref={checkBtnRef}
                onClick={handleButtonClick}
                title={getButtonTitle()}
                disabled={isConfirmDisabled}
              />
            </div>
          </div>
        </div>
      )}

      <ConfirmationPopup
        isOpen={isConfirmationOpen}
        onClose={handleConfirmationCancel}
        onConfirm={handleFinalConfirm}
        title="Confirm payment"
        message="Confirm the order by clicking yes."
        confirmText="Yes"
        cancelText="No"
      />
    </>
  );
};

export default PaymentDetails;
