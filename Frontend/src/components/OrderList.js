// src/components/OrderList.js
import React from 'react';
import '../styles/orderlist.css';
import ProcessOrderButton from './buttons/ProceedOrderButton';
import DownloadIcon from '../assets/icons/download.png';

const OrderList = ({ orders = [], loading = false }) => {

  // 🔥 CSV DOWNLOAD FIX (ADDED)
  const handleDownloadCSV = () => {
    if (!orders || orders.length === 0) {
      alert('No orders to download');
      return;
    }
    // Define CSV headers and rows based on the orders data
    const headers = [
      'Order ID',
      'Date',
      'Total Items',
      'Total Amount'
    ];
    // Map orders to CSV rows, handling different possible field names for consistency
    const rows = orders.map(order => [
      order.order_no || order.order_id || order.id || '',
      fmtDate(order),
      order.total_quantity || order.total_items || order.items_count || 0,
      order.discounted_price ?? order.total_amount ?? 0
    ]);
    // Create CSV content as a string
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    // Create a Blob from the CSV content and trigger a download
    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;'
    });
    // Create a temporary link to trigger the download
    const url = URL.createObjectURL(blob);
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = url;
    link.download = `order_details_${new Date().toISOString().slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  // Utility function to format date for display, handling various possible date fields in the order data
  const fmtDate = (val) => {
    if (!val) return '—';
    const possible =
      val.created_at ||
      val.date ||
      val.order_date ||
      val.createdAt ||
      val.date_time;
  // Use the first valid date value found, or fallback to the original value if none are valid
    const d = possible || val;

    try {
      const dt = new Date(d);
      if (isNaN(dt.getTime())) return '—';
      return dt.toLocaleString();
    } catch {
      return '—';
    }
  };

  return (
    <div className="order-details">
      <div className="order-details-header">
        <h3>Order details</h3>
      </div>

      <div className="table-container">
        <table className="orders-table">
          <thead>
            <tr className="table-header-row">
              <th className="column-gap">Order ID</th>
              <th className="column-gap">Date</th>
              <th className="column-gap">Total items</th>
              <th>Total amount</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr className="loading-row">
                <td colSpan="4">Loading...</td>
              </tr>
            ) : orders.length === 0 ? (
              <tr className="no-orders-row">
                <td colSpan="4">No orders found</td>
              </tr>
            ) : (
              orders.map((order, index) => (
                <tr
                  key={order.order_no || order.order_id || order.id || index}
                  className="table-data-row"
                >
                  <td>{order.order_no || order.order_id || order.id || '—'}</td>
                  <td>{fmtDate(order)}</td>
                  <td>{order.total_quantity || order.total_items || order.items_count || 0}</td>
                  <td>
                    Rs {order.discounted_price ?? order.total_amount ?? '0'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <ProcessOrderButton
          onClick={handleDownloadCSV}
          title={
            <span className="download-btn-content">
              <img
                src={DownloadIcon}
                alt="Download"
                className="download-btn-icon"
              />
              Download CSV
            </span>
          }
        />
      </div>
    </div>
  );
};

export default OrderList;