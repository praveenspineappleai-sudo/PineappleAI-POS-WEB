// src/pages/sales/SalesManagement.js
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config/apiConfig';

import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';
import DateRangeSelector from '../../components/DateRangeSelector';
import StatsCards from '../../components/StatsCards';
import OrderList from '../../components/OrderList';
import Pagination from '../../components/Pagination';
import CustomerDetails from '../../models/CustomerDetails';
import { getOrdersList } from '../../integration/OrderAPI';

import '../../styles/salesmanagement.css';

const SalesManagement = () => {
  const navigate = useNavigate();

  // AUTO DEFAULT TAB → TODAY
  const [selectedRange, setSelectedRange] = useState("today");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  //------------------------------------------

  const [currentPage, setCurrentPage] = useState(1);
  const [orders, setOrders] = useState([]);
  const [totalEntries, setTotalEntries] = useState(0);
  const entriesPerPage = 5;

  const [statsData, setStatsData] = useState({
    totalSales: 0,
    totalOrders: 0,
    newCustomers: 0,
    totalProfit: 0,
    currency: 'Rs'
  });

  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const businessName = localStorage.getItem('business_name') || 'PAI';

  //------------------------------------------
  // BUILD URL
  //------------------------------------------

  //------------------------------------------
  // BUILD URL
  //------------------------------------------

  const buildSalesStatsUrl = useCallback(() => {
    const base = `${API_BASE_URL}/api/sales/stats`;
    const qp = new URLSearchParams();

    if (selectedRange === 'today') {
      qp.append('period', 'today');
      if (typeof selectedDate === 'string') {
        qp.append('startDate', selectedDate);
        qp.append('endDate', selectedDate);
      }
    } else if (selectedRange === 'weekly' && selectedDate?.startDate && selectedDate?.endDate) {
      qp.append('period', 'weekly');
      qp.append('startDate', selectedDate.startDate);
      qp.append('endDate', selectedDate.endDate);
    } else if (selectedRange === 'monthly') {
      qp.append('period', 'monthly');
      if (typeof selectedDate === 'string' && selectedDate.includes('-')) {
        qp.append('month', selectedDate);
      }
    } else {
      qp.append('period', selectedRange);
    }

    qp.append('business_name', businessName);

    return `${base}?${qp.toString()}`;
  }, [selectedRange, selectedDate, businessName]);

  //------------------------------------------
  // MAIN FETCH FUNCTION
  //------------------------------------------

  const fetchSalesStats = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const url = buildSalesStatsUrl();
      const res = await fetch(url, { method: 'GET', headers: { Accept: 'application/json' } });

      if (res.ok) {
        const statsJson = await res.json();

        setStatsData({
          totalSales: statsJson.totalSales ?? 0,
          totalOrders: statsJson.totalOrders ?? 0,
          newCustomers: statsJson.newCustomers ?? 0,
          totalProfit: statsJson.totalProfit ?? 0,
          currency: 'Rs'
        });

        const fetchedOrders = Array.isArray(statsJson.orderDetails)
          ? statsJson.orderDetails
          : Array.isArray(statsJson.orders)
          ? statsJson.orders
          : [];

        setOrders(fetchedOrders);
      } else {
        const errJson = await res.json().catch(() => ({}));
        setError(errJson.message || 'Failed to fetch sales statistics');
        setOrders([]);
      }
    } catch (err) {
      setError(err.message || 'Error connecting to server');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [buildSalesStatsUrl]);

  //------------------------------------------
  // AUTO REFRESH
  //------------------------------------------

  useEffect(() => {
    fetchSalesStats();
    setCurrentPage(1);
  }, [selectedRange, selectedDate, fetchSalesStats]);

  //------------------------------------------

  const visibleOrders = orders.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  const totalPages = Math.max(1, Math.ceil(orders.length / entriesPerPage));

  const handleRangeChange = (range, date) => {
    setSelectedRange(range);
    setSelectedDate(date);
  };

  //------------------------------------------
  // UI
  //------------------------------------------

  return (
    <div className="sales-management-page">
      <Sidebar
        activeItem="sales"
        onDashboardClick={() => navigate('/dashboard')}
        onProductClick={() => navigate('/product-management')}
        onSalesClick={() => navigate('/sales-management')}
        onLogoClick={() => navigate('/dashboard')}
      />

      <Header title="Sales management" subtitle="Track and analyze sales with ease." />

      <div className="sales-content">
        <DateRangeSelector
          selectedRange={selectedRange}
          selectedDate={selectedDate}
          onRangeChange={handleRangeChange}
        />

        <StatsCards
          selectedRange={selectedRange}
          stats={{
            monthlySales: statsData.totalSales,
            monthlyOrders: statsData.totalOrders,
            newCustomers: statsData.newCustomers,
            monthlyProfit: statsData.totalProfit,
            currency: statsData.currency,
            loading
          }}
        />

        <OrderList orders={visibleOrders} loading={loading} />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalEntries={orders.length}
          entriesPerPage={entriesPerPage}
          onPageChange={setCurrentPage}
          showPrevNext
          maxVisiblePages={5}
        />

        <CustomerDetails
          isOpen={false}
          onClose={() => {}}
          totalAmount={0}
        />
      </div>
    </div>
  );
};

export default SalesManagement;