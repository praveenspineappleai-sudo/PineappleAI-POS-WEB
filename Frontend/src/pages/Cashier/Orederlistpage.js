// src/pages/orderlist/OrderListPage.js

import React, { useState, useEffect, useRef, useCallback } from 'react';// React imports for state management, lifecycle, and refs
import { useNavigate } from 'react-router-dom';// For navigation after order completion
import { API_BASE_URL } from '../../config/apiConfig';
import { getBusinessDetails } from "../../integration/BusinessAPI";// API call to fetch business details for invoice
import Header2 from '../../components/layout/Header2';// Custom header component for page title and subtitle
import Search from '../../components/Search';/// Custom search component for product search input
import AddButton from '../../components/buttons/AddButton';// Custom button component for adding products to order
import DeleteButton from '../../components/buttons/DeleteButton';// Custom button component for removing products from order
import RemoveButton from '../../components/buttons/RemoveButton';// Custom button component for decreasing product quantity in order
import ProcessOrderButton from '../../components/buttons/ProceedOrderButton';// Custom button component for proceeding to order completion
import CustomerDetails from '../../models/CustomerDetails';// Modal component for entering/selecting customer details during checkout
import PaymentDetails from '../../models/PaymentDetails';// Modal component for entering payment details and completing the order
import DeleteConfirmation from '../../models/DeleteConfirmation';// Modal component for confirming item deletion from order
import { useToast } from "../../contexts/ToastContext";// Custom hook for showing toast notifications to the user
import InvoicePopup from "../../components/InvoicePopup";// Component for displaying the invoice after order completion
import '../../styles/orderlistpage.css';// CSS styles specific to the OrderListPage
import { createOrder } from "../../integration/OrderAPI";// API call to create a new order in the backend

const OrderListPage = () => {
  const [isDuplicatePopupOpen, setIsDuplicatePopupOpen] = useState(false);
  const [duplicateItem, setDuplicateItem] = useState(null);

  const navigate = useNavigate();
  const { showToast } = useToast();

  const [cashPaid, setCashPaid] = useState(0);

  const [businessDetailsFromAPI, setBusinessDetailsFromAPI] = useState(null);
  const [cashierNameFromAPI, setCashierNameFromAPI] = useState("");

  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [orderList, setOrderList] = useState([]);

  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);


  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);

  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [finalAmount, setFinalAmount] = useState(0);

  const [searchSelectedIndex, setSearchSelectedIndex] = useState(0);
  const [orderSelectedIndex, setOrderSelectedIndex] = useState(0);

  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);


  const [activeSection, setActiveSection] = useState('search');

  const searchInputRef = useRef(null);
  const orderContainerRef = useRef(null);
  const mountedRef = useRef(false);

  const fetchProducts = async (term) => {
    if (!term || term.trim() === '') {
      setProducts([]);
      setSearchResults([]);
      return;
    }

    try {
      let cleanedTerm = term.replace(/\s+/g, '').trim(); // remove spaces
      const isNumericOnly = /^\d+$/.test(cleanedTerm); // Check if input is all digits (barcode)

      // 🔹 1. TRY BARCODE SEARCH ONLY IF INPUT IS ALL DIGITS AND LENGTH >= 3
      if (isNumericOnly && cleanedTerm.length >= 3) {
        try {
          const productId = cleanedTerm.slice(0, -2); // all except last 2 digits
          const sizeId = cleanedTerm.slice(-2, -1); // second last digit
          const colorId = cleanedTerm.slice(-1);     // last digit
          const formattedBarcode = `${productId} ${sizeId} ${colorId}`;

          const barcodeUrl = `${API_BASE_URL}/api/barcode-search/barcodes/search/${encodeURIComponent(formattedBarcode)}`;

          const barcodeRes = await fetch(barcodeUrl);

          if (barcodeRes.ok) {
            const barcodeData = await barcodeRes.json();

            if (barcodeData.product_name) {
              const formatted = [{
                sku: barcodeData.price_id,
                name: barcodeData.product_name,
                price: parseFloat(barcodeData.price),
                stock: barcodeData.quantity ?? "N/A"
              }];

              setProducts(formatted);
              setSearchResults(formatted);
              setSearchSelectedIndex(0);
              return; // ⛔ STOP — barcode success
            }

            if (barcodeData.message) {
              setProducts([]);
              setSearchResults([]);
              return; // ⛔ STOP — barcode checked but no product
            }
          }
        } catch (err) {
          console.log("Barcode search failed:", err.message);
        }
      }

      // 🔹 2. NAME SEARCH (TOKEN OPTIONAL)
      const token = localStorage.getItem("token");

      const headers = {
        "Content-Type": "application/json"
      };

      // token irundha mattum add pannrom
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const nameUrl = `${API_BASE_URL}/api/products?name=${encodeURIComponent(term)}`;

      const nameRes = await fetch(nameUrl, { headers });

      if (!nameRes.ok) {
        setProducts([]);
        setSearchResults([]);
        return;
      }

      const nameData = await nameRes.json();

      if (Array.isArray(nameData) && nameData.length > 0) {
        const formattedList = nameData.map(item => ({
          sku: item.price_id,
          name: item.product_name || item.name,
          price: parseFloat(item.price || item.selling_price),
          stock: item.quantity ?? "N/A"
        }));



        setProducts(formattedList);
        setSearchResults(formattedList);
        setSearchSelectedIndex(0);
        return;
      }

      // 🔹 NOTHING FOUND
      setProducts([]);
      setSearchResults([]);

    } catch (err) {
      console.error("Product Search Error:", err);
      setProducts([]);
      setSearchResults([]);
    }
  };


  const handleSearch = (term) => {
    setSearchTerm(term);
    fetchProducts(term);
    setActiveSection('search');
  };

  useEffect(() => {
    const input = document.getElementById("searchInput");
    if (input) {
      input.focus();
      searchInputRef.current = input;
    }
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const addToOrder = useCallback((product) => {
    if (!product) return;

    const exists = orderList.find(item => item.sku === product.sku);

    if (exists) {
      showToast("Warning", `${product.name} already in order. Quantity increased.`, "warning", 4000);

      setOrderList(prev =>
        prev.map(item =>
          item.sku === product.sku
            ? {
              ...item,
              quantity: item.quantity + 1,
              total: (item.quantity + 1) * item.price
            }
            : item
        )
      );

      const idx = orderList.findIndex(i => i.sku === product.sku);
      if (idx >= 0) {
        setOrderSelectedIndex(idx);
        setActiveSection('order');
        setTimeout(() => orderContainerRef.current?.focus?.(), 50);
      }
      return;
    }

    const newItem = {
      ...product,
      quantity: 1,
      total: product.price,
    };

    setOrderList(prev => {
      const next = [...prev, newItem];
      setOrderSelectedIndex(next.length - 1);
      return next;
    });

    setActiveSection('order');
    setTimeout(() => orderContainerRef.current?.focus?.(), 80);
  }, [orderList, showToast]);

  const increaseQuantity = (sku) => {
    if (!sku) return;
    setOrderList(prev => prev.map(item =>
      item.sku === sku
        ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
        : item
    ));
  };

  const decreaseQuantity = (sku) => {
    if (!sku) return;
    setOrderList(prev => prev.map(item =>
      item.sku === sku && item.quantity > 1
        ? { ...item, quantity: item.quantity - 1, total: (item.quantity - 1) * item.price }
        : item
    ));
  };

  const removeFromOrder = (sku) => {
    setItemToDelete(sku);
    setIsDeleteConfirmationOpen(true);
  };

  const handleDeleteConfirm = () => {
    setOrderList(prev => {
      const next = prev.filter(item => item.sku !== itemToDelete);

      setOrderSelectedIndex(prevIndex => {
        if (next.length === 0) return 0;
        return Math.min(prevIndex, next.length - 1);
      });

      return next;
    });
    setIsDeleteConfirmationOpen(false);
  };

  const handleDeleteCancel = () => setIsDeleteConfirmationOpen(false);

  const totalAmount = orderList.reduce((sum, item) => sum + item.total, 0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleProcessOrderClick = useCallback(() => {
    if (orderList.length === 0) {
      showToast("Warning", "Add items first", "warning", 3000);
      return;
    }
    setIsCustomerModalOpen(true);
  });

  const handleProceedFromCustomerDetails = (customer, discount = 0, finalAmt = totalAmount) => {
    setSelectedCustomer(customer);
    setDiscountPercentage(discount);
    setFinalAmount(finalAmt);
    setIsPaymentModalOpen(true);
  };

  const handleOrderComplete = async (cashAmount) => {
    const paidCash = Number(cashAmount) || 0;
    setCashPaid(paidCash);

    if (!selectedCustomer) {
      showToast("Warning", "Please select a customer", "warning", 3000);
      return;
    }



    const productPayload = orderList.map(item => ({
      price_id: item.sku,
      ordered_quantity: item.quantity
    }));

    //payload structure for order creation API
    const activeBusinessName = localStorage.getItem('business_name') || 'PAI FOOD CITY';
    const payload = {
      customer_id: selectedCustomer.customer_id || selectedCustomer.id,
      discounted_price: finalAmount,
      paid_amount: paidCash,
      business_name: activeBusinessName,
      send_email: true,
      products: productPayload
    };

    /// ✅ CALL CREATE ORDER API
    const result = await createOrder(payload);
    // ✅ HANDLE API RESPONSE
    if (result.success) {
      showToast("Success", "Order saved successfully!", "success", 3000);

      /// ✅ FETCH BUSINESS DETAILS FOR INVOICE
      const businessName = localStorage.getItem("business_name");

      const businessInfo = await getBusinessDetails(businessName);
      // ✅ SAFETY CHECK
      if (!businessInfo) {
        showToast("Error", "Failed to load business info", "error", 3000);
        return;
      }

      // ✅ CALCULATE BALANCE
      const balanceAmount = paidCash > finalAmount
        ? paidCash - finalAmount
        : 0;


      // Prepare invoice data
      const invoiceData = {
        order_no: result.data?.order_no || Date.now(),
        products: orderList.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: totalAmount,
        discounted_price: finalAmount,
        cash_amount: paidCash,
        balance: balanceAmount
      };

      // ✅ SHOW INVOICE POPUP
      setSelectedOrder(invoiceData);
      setShowInvoice(true);
      //
      const activeBusinessName = localStorage.getItem('business_name') || businessInfo?.business_name || 'Foodcity';
      setBusinessDetailsFromAPI({
        business_name: businessInfo?.business_name || activeBusinessName,
        business_address: businessInfo?.address || businessInfo?.business_address || '',
        owner_phone: businessInfo?.owner_phone || businessInfo?.ownerPhone || ''
      });
      // ✅ SET CASHIER NAME FOR INVOICE
      setCashierNameFromAPI(businessInfo.cashier_name);

      // Reset order state after completion
      window.dispatchEvent(new Event('orderCreated'));

      setOrderList([]);//// reset order list
      setSearchResults([]);// reset search results
      setSearchTerm("");// reset search term
      setSelectedCustomer(null);// reset selected customer
      setDiscountPercentage(0);// reset discount
      setFinalAmount(0);//reset final amount
      setIsPaymentModalOpen(false);// close payment modal

      setActiveSection('search');
      setTimeout(() => {
        const input = document.getElementById("searchInput");
        input?.focus?.();
      }, 80);
    } else {
      showToast(
        "Error",
        result.error || "Order failed. Please try again.",
        "error",
        3000
      );
    }
  };

  useEffect(() => {
    // GLOBAL KEYBOARD HANDLER
    const handleGlobalKey = (e) => {
      const activeElement = document.activeElement;
      const isTextInput =
        activeElement &&
        (activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          activeElement.isContentEditable);

      if (isTextInput && activeElement.id !== 'searchInput') return;

      const key = e.key;

      // ---------------- SEARCH SECTION ----------------
      if (activeSection === 'search') {
        if (searchResults.length > 0) {
          // NAVIGATION
          if (key === 'ArrowDown') {
            e.preventDefault();
            setSearchSelectedIndex(prev => Math.min(prev + 1, searchResults.length - 1));
            return;
          }
          if (key === 'ArrowUp') {
            e.preventDefault();
            setSearchSelectedIndex(prev => Math.max(prev - 1, 0));
            return;
          }
          if (key === 'PageDown') {
            e.preventDefault();
            setSearchSelectedIndex(prev => Math.min(prev + 5, searchResults.length - 1));
            return;
          }
          if (key === 'PageUp') {
            e.preventDefault();
            setSearchSelectedIndex(prev => Math.max(prev - 5, 0));
            return;
          }
          if (key === 'Enter') {
            e.preventDefault();
            const product = searchResults[searchSelectedIndex];
            if (product) addToOrder(product);
            return;
          }
        }
      }

      // ---------------- ORDER SECTION ----------------
      else if (activeSection === 'order') {
        if (orderList.length === 0) return;
        // NAVIGATION
        if (key === 'ArrowDown') {
          e.preventDefault();
          setOrderSelectedIndex(prev => Math.min(prev + 1, orderList.length - 1));
          return;
        }

        if (key === 'ArrowUp') {
          e.preventDefault();
          setOrderSelectedIndex(prev => Math.max(prev - 1, 0));
          return;
        }

        if (key === 'PageDown') {
          e.preventDefault();
          setOrderSelectedIndex(prev => Math.min(prev + 5, orderList.length - 1));
          return;
        }
        if (key === 'PageUp') {
          e.preventDefault();
          setOrderSelectedIndex(prev => Math.max(prev - 5, 0));
          return;
        }

        // ⛔ QUANTITY CONTROL ONLY WHEN NO MODAL IS OPEN
        const modalOpen =
          isCustomerModalOpen || isPaymentModalOpen || isDeleteConfirmationOpen;
        /// ✅ ARROW RIGHT → INCREASE QUANTITY
        if (key === 'ArrowRight') {
          if (modalOpen) return;
          e.preventDefault();
          const sku = orderList[orderSelectedIndex]?.sku;
          if (sku) increaseQuantity(sku);
          return;
        }
        /// ✅ ARROW LEFT → DECREASE QUANTITY
        if (key === 'ArrowLeft') {
          if (modalOpen) return;
          e.preventDefault();
          const sku = orderList[orderSelectedIndex]?.sku;
          if (sku) decreaseQuantity(sku);
          return;
        }

        // ESC → ONLY when inside order list
        if (key === "Escape") {
          // if ANY modal is open → DO NOT move to search
          if (isCustomerModalOpen || isPaymentModalOpen || isDeleteConfirmationOpen) {
            e.preventDefault();
            return;
          }
          // ESC valid only when order section active
          if (
            activeSection === "order" &&
            orderContainerRef.current?.contains(document.activeElement)
          ) {
            e.preventDefault();
            searchInputRef.current?.focus();
            setActiveSection("search");
          }
          return;
        }
        // DELETE → REMOVE ITEM
        if (key === 'Delete') {
          e.preventDefault();
          const sku = orderList[orderSelectedIndex]?.sku;
          if (sku) removeFromOrder(sku);
          return;
        }

        // ENTER → ONLY IF NO MODAL IS OPEN
        if (key === 'Enter') {
          e.preventDefault();
          if (!modalOpen) {
            handleProcessOrderClick();
          }
          return;
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [activeSection,
    searchResults,
    searchSelectedIndex,
    orderList,
    orderSelectedIndex,
    addToOrder,
    isCustomerModalOpen,
    isPaymentModalOpen,
    isDeleteConfirmationOpen,
    handleProcessOrderClick
  ]);

  useEffect(() => {
    setSearchSelectedIndex(prev => Math.min(prev, Math.max(0, searchResults.length - 1)));
  }, [searchResults]);

  useEffect(() => {
    setOrderSelectedIndex(prev => Math.min(prev, Math.max(0, orderList.length - 1)));
  }, [orderList]);

  const handleSearchFocus = () => setActiveSection('search');
  const handleOrderContainerFocus = () => setActiveSection('order');

  return (
    <div className="orderlist-page">
      <Header2 title="Cashier" subtitle="Scan barcodes, add products, and complete sales quickly." />

      <div className="orderlist-container">

        <div className="left-panel">
          <Search
            onSearch={handleSearch}
            value={searchTerm}
            placeholder="Search products or scan barcode..."
            inputId="searchInput"
            onFocus={handleSearchFocus}
          />

          {searchResults.length > 0 && (
            <div className="products-section" role="list" aria-label="Search results">
              <div className="products-table-container">
                <table className="products-table">
                  <thead>
                    <tr>
                      <th>SKU</th>
                      <th><span>Product</span></th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {searchResults.map((product, index) => (
                      <tr
                        key={product.sku}

                        className={`product-row ${searchSelectedIndex === index ? "highlight-row" : ""}`}
                        onMouseEnter={() => {
                          setSearchSelectedIndex(index);
                          setActiveSection('search');
                        }}
                        onClick={() => {
                          setSearchSelectedIndex(index);
                          setActiveSection('search');
                          const input = document.getElementById("searchInput");
                          if (input) input.focus();
                        }}

                      >
                        <td>{product.sku}</td>
                        <td>{product.name}</td>
                        <td>Rs {product.price}.00</td>
                        <td>{product.stock}</td>

                        <td>
                          <AddButton
                            onClick={(e) => {
                              if (e.stopPropagation) e.stopPropagation();
                              addToOrder(product);
                            }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>

                </table>
              </div>
            </div>
          )}
        </div>

        <div className="right-panel">

          <h3 className="order-title">Order list</h3>

          <div
            className="order-items-container no-outline"
            ref={orderContainerRef}
            tabIndex={0}
            onFocus={handleOrderContainerFocus}
            onMouseEnter={() => setActiveSection('order')}

            aria-label="Order items"
          >
            {orderList.length === 0 ? (
              <div className="no-items">No items in order</div>
            ) : (
              orderList.map((item, index) => (
                <div
                  key={item.sku}
                  className={`order-item order-item-flex ${orderSelectedIndex === index ? "highlight-order" : ""}`}
                  onMouseEnter={() => {
                    setOrderSelectedIndex(index);
                    setActiveSection('order');
                  }}
                  onClick={() => {
                    setOrderSelectedIndex(index);
                    setActiveSection('order');
                  }}

                >
                  <div className="item-details">
                    <div className="item-name">{item.name}</div>
                    <div className="item-price">Rs {item.price}.00</div>
                  </div>

                  <div className="quantity-controls">
                    <RemoveButton
                      onClick={(e) => {
                        if (e.stopPropagation) e.stopPropagation();
                        decreaseQuantity(item.sku);
                      }}
                    />
                    <span className="qty-display">{item.quantity}</span>
                    <AddButton
                      onClick={(e) => {
                        if (e.stopPropagation) e.stopPropagation();
                        increaseQuantity(item.sku);
                      }}
                    />
                  </div>

                  <div className="item-total-price">Rs {item.total}.00</div>

                  <DeleteButton
                    onClick={(e) => {
                      if (e.stopPropagation) e.stopPropagation();
                      removeFromOrder(item.sku);
                    }}
                  />
                </div>
              ))
            )}
          </div>

          <div className="order-footer">
            <div className="total-section">
              <div>Total amount</div>
              <div>Rs {totalAmount}.00</div>
            </div>
            <ProcessOrderButton onClick={handleProcessOrderClick} title="Proceed order" />
          </div>

        </div>
      </div>

      <CustomerDetails
        isOpen={isCustomerModalOpen}// state to control visibility of customer details popup
        onClose={() => setIsCustomerModalOpen(false)}// function to close customer details popup
        totalAmount={totalAmount}// pass total amount to customer details for display
        onProceedOrder={handleProceedFromCustomerDetails}// function to call when proceeding from customer details to payment details, passing selected customer and discount info
        onCustomerSelect={setSelectedCustomer}// function to set selected customer in state when a customer is selected in the customer details popup
        selectedCustomer={selectedCustomer}// pass selected customer to customer details popup for display and editing
      />

      <PaymentDetails
        isOpen={isPaymentModalOpen}// state to control visibility of payment details popup
        onClose={() => setIsPaymentModalOpen(false)}// function to close payment details popup
        onBackToDiscount={() => {
          setIsPaymentModalOpen(false);  // close payment
          setIsDiscountModalOpen(true);  // open discount popup — CHANGE THIS if your state name is different
        }}
        totalAmount={finalAmount}// pass the discounted price to payment details
        customer={selectedCustomer}// pass selected customer to payment details
        discountPercentage={discountPercentage}// pass discount percentage to payment details
        onOrderComplete={handleOrderComplete}// function to call when order is completed in payment details
      />

      <DeleteConfirmation
        isOpen={isDeleteConfirmationOpen}// state to control visibility of delete confirmation popup
        onClose={handleDeleteCancel}// function to close the delete confirmation popup without deleting
        onConfirm={handleDeleteConfirm}// function to confirm deletion and remove the item from the order list
        title="Confirm Deletion"//// title of the delete confirmation popup
        message='Click "Yes" to delete the product.'//// message displayed in the delete confirmation popup
      />

      {showInvoice && selectedOrder && businessDetailsFromAPI && (
        <InvoicePopup
          orderData={selectedOrder}// order details from this page
          businessData={businessDetailsFromAPI}// business details fetched from API
          cashierName={cashierNameFromAPI}// cashier name fetched from API
          onClose={() => setShowInvoice(false)}// function to close the invoice popup
        />
      )}



    </div>


  );
};

export default OrderListPage;
