// InvoicePopup.js
//path:src/components/InvoicePopup.js
// This component is responsible for displaying the invoice popup after an order is saved.
//  It receives order data, business data, and cashier name as props from the OrderListPage.

import React, { useRef, useEffect } from "react";// ✅ Added useEffect for keyboard controls
import html2pdf from "html2pdf.js";// ✅ Library for PDF generation
import "../styles/InvoicePopup.css";/// ✅ CSS for styling the invoice popup

// The InvoicePopup component displays a detailed invoice based on the order data and business information. 
const InvoicePopup = ({
  orderData,
  businessData,
  cashierName,
  onClose,
}) => {
  const invoiceRef = useRef();

  /* ---------------- Helper Functions ---------------- */

  const formatPrice = (price) => {
    const num = Number(price) || 0;
    return num.toFixed(2);
  };

  const formatDate = () => {
    return new Date().toLocaleDateString();
  };

  const formatTime = () => {
    return new Date().toLocaleTimeString();
  };

  /* ---------------- Calculations ---------------- */

const subTotal = Number(orderData?.totalAmount) || 0;
const netTotal = Number(orderData?.discounted_price) || subTotal;

const discount =
  subTotal > netTotal ? subTotal - netTotal : 0;

const cashAmount = Number(orderData?.cash_amount) || 0;



// ✅ Use balance from OrderListPage
const balance = Number(orderData?.balance) || 0;


  /* ---------------- PDF Download ---------------- */

  const handleDownloadPDF = () => {
    const element = invoiceRef.current;

    html2pdf()
      .set({
        margin: 5,
        filename: `Invoice_${orderData?.order_no}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(element)
      .save();
  };

  /* ---------------- Keyboard Controls ---------------- */

useEffect(() => {
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleDownloadPDF();
    }

    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  window.addEventListener("keydown", handleKeyDown);

  return () => {
    window.removeEventListener("keydown", handleKeyDown);
  };
}, [onClose]);


  return (
    <div className="invoice-overlay">
      <div className="invoice-popup">

        {/* -------- Scrollable Receipt Area -------- */}
        <div className="invoice-content">
          <div ref={invoiceRef} className="receipt">

            <div className="receipt-center receipt-title">
              {businessData?.business_name || businessData?.name || 'Foodcity'}
            </div>

            <div className="receipt-center">
              {businessData?.business_address || businessData?.address || ''}
            </div>

            <div className="receipt-center">
              {businessData?.owner_phone || businessData?.ownerPhone || ''}
            </div>

            <div className="receipt-divider" />

            <div className="receipt-row">
              <span>{formatDate()}</span>
              <span>{formatTime()}</span>
            </div>

            <div className="cashier-bill-row">
              <span>Cashier: {cashierName}</span>
              <span>No: {orderData?.order_no?.split('-ORD-').pop() || orderData?.order_no}</span>
            </div>

            <div className="receipt-divider" />

            <table className="receipt-table">
              <thead>
                <tr>
                  <th>ITEM</th>
                  <th>QTY</th>
                  <th>PRICE</th>
                  <th>AMOUNT</th>
                </tr>
              </thead>
              <tbody>
               {orderData?.products?.map((item, index) => (
               <React.Fragment key={index}>
      
               {/* 🔹 Item Name Full Width */}
                 <tr>
                    <td colSpan="4" className="item-name">
                       {item.name}
                    </td>
                </tr>

               {/* 🔹 Quantity / Price / Amount Row */}
                 <tr className="item-values">
                  <td></td>
                  <td>{item.quantity}</td>
                  <td>{formatPrice(item.price)}</td>
                  <td>
                     {formatPrice(item.price * item.quantity)}
                  </td>
                </tr>

               </React.Fragment>
               ))}
            </tbody>

            </table>

            <div className="receipt-divider" />

            <div className="receipt-row">
              <span>Sub Total</span>
              <span>{formatPrice(subTotal)}</span>
            </div>

            {discount > 0 && (
              <div className="receipt-row">
                <span>Discount</span>
                <span> {formatPrice(discount)}</span>
              </div>
            )}

            <div className="receipt-row receipt-net">
              <span>Net Total</span>
              <span>{formatPrice(netTotal)}</span>
            </div>

            <div className="receipt-divider" />

            <div className="receipt-row">
              <span>Cash</span>
              <span>{formatPrice(cashAmount)}</span>
            </div>

            {cashAmount >= netTotal ? (
              <div className="receipt-row">
                <span>Balance</span>
                <span>{formatPrice(balance)}</span>
              </div>
              ) : (
              <div className="receipt-row">
                <span>Balance</span>
                <span>{formatPrice(netTotal - cashAmount)}</span>
              </div>
              )}


            <div className="receipt-divider" />

            <div className="receipt-center receipt-footer">
              Thank you for shopping with us!
            </div>

          </div>
        </div>

        {/* --------  Bottom Buttons -------- */}
        <div className="invoice-footer">
          <button
            onClick={handleDownloadPDF}
            className="print-btn"
          >
            Download PDF
          </button>

          <button
            onClick={onClose}
            className="close-btn1"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

export default InvoicePopup;
