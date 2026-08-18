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
    // Define CSV headers and rows based on orders DB table attributes
    const headers = [
      'ID',
      'Order No',
      'Price ID',
      'Customer ID',
      'Date',
      'Ordered Quantity',
      'Ordered Total Price',
      'Discounted Price',
      'Profit',
      'Created At'
    ];
    
    const rows = orders.map(order => [
      order.id ?? '',
      order.order_no || order.full_order_no || '',
      order.price_id ?? '',
      order.customer_id ?? '',
      order.date || order.order_date || '',
      order.ordered_quantity ?? order.total_quantity ?? 0,
      order.ordered_total_price ?? order.total_price ?? 0,
      order.discounted_price ?? 0,
      order.profit ?? 0,
      order.created_at || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `orders_export_${new Date().toISOString().slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  // Utility function to format date for display, handling various possible date fields in the order data
  const fmtDate = (val) => {
    if (!val) return '—';
    const possible =
      val.order_date ||
      val.created_at ||
      val.createdAt ||
      val.date_time ||
      val.date;
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