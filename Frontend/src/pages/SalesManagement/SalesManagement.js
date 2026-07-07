// src/pages/sales/SalesManagement.js
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

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

  const businessName = localStorage.getItem('business_name') || 'Cargills';

  //------------------------------------------
  // BUILD URL
  //------------------------------------------

  const buildSalesStatsUrl = useCallback(() => {
    const base = 'http://192.168.0.123:5000/api/sales/stats';
    const qp = new URLSearchParams();

    if (selectedRange === 'today') {
      qp.append('startDate', selectedDate);
      qp.append('endDate', selectedDate);
    } else if (selectedRange === 'weekly' && selectedDate?.startDate && selectedDate?.endDate) {
      qp.append('startDate', selectedDate.startDate);
      qp.append('endDate', selectedDate.endDate);
    } else if (selectedRange === 'monthly') {
      qp.append('period', 'monthly');
    } else {
      qp.append('period', 'monthly');
    }

    qp.append('business_name', businessName);

    return `${base}?${qp.toString()}`;
  }, [selectedRange, selectedDate, businessName]);

  //------------------------------------------
  // Helpers
  //------------------------------------------

  const extractOrdersFromStats = (json) => {
    if (!json) return [];
    if (Array.isArray(json.orderDetails)) return json.orderDetails;
    if (Array.isArray(json.orders)) return json.orders;
    if (Array.isArray(json.data)) return json.data;
    return [];
  };

  const getOrderTimestamp = (o) => {
    const possible =
      o.order_date ||
      o.created_at ||
      o.date ||
      o.transaction_date ||
      o.createdAt ||
      o.created;
    if (!possible) return null;
    const t = Date.parse(possible);
    return Number.isNaN(t) ? null : t;
  };

  const mergeAndDedupeOrders = (arr1 = [], arr2 = []) => {
    const map = new Map();

    const pushWithSource = (item, source) => {
      const key =
        item.order_no ||
        item.order_id ||
        item.id ||
        item.bill_no ||
        JSON.stringify(item);
      const copy = { ...item, _source: source };
      if (!map.has(key)) map.set(key, copy);
      else {
        const existing = map.get(key);
        if (Object.keys(copy).length > Object.keys(existing).length) {
          map.set(key, copy);
        }
      }
    };

    (arr1 || []).forEach(o => pushWithSource(o, 'stats'));
    (arr2 || []).forEach(o => pushWithSource(o, 'orders_api'));

    const merged = Array.from(map.values());

    merged.sort((a, b) => {
      const ta = getOrderTimestamp(a) ?? 0;
      const tb = getOrderTimestamp(b) ?? 0;
      return tb - ta;
    });

    return merged;
  };

  //------------------------------------------
  // 🔥 FRONTEND FILTER HELPERS (ADDED)
  //------------------------------------------

  const isSameMonth = (date, month, year) => {
    const d = new Date(date);
    return d.getMonth() === month && d.getFullYear() === year;
  };

  const isBetweenDates = (date, start, end) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);

    const s = new Date(start);
    s.setHours(0, 0, 0, 0);

    const e = new Date(end);
    e.setHours(23, 59, 59, 999);

    return d >= s && d <= e;
  };

  //------------------------------------------
  // MAIN FETCH FUNCTION
  //------------------------------------------

  const fetchSalesStats = useCallback(async () => {
    setLoading(true);
    setError('');

    let statsJson = null;
    let ordersFromStats = [];
    let ordersFromList = [];

    try {
      const url = buildSalesStatsUrl();
      const res = await fetch(url, { method: 'GET', headers: { Accept: 'application/json' } });

      if (res.ok) {
        statsJson = await res.json();

        setStatsData({
          totalSales: statsJson.totalSales ?? statsJson.total_sales ?? 0,
          totalOrders: statsJson.totalOrders ?? statsJson.total_orders ?? 0,
          newCustomers: statsJson.newCustomers ?? statsJson.new_customers ?? 0,
          totalProfit: statsJson.totalProfit ?? statsJson.total_profit ?? 0,
          currency: 'Rs'
        });

        ordersFromStats = extractOrdersFromStats(statsJson);
      }
    } catch (err) {
      setError(err.message);
    }

    try {
      ordersFromList = await getOrdersList();
      if (!Array.isArray(ordersFromList)) ordersFromList = [];
    } catch {
      ordersFromList = [];
    }

    const merged = mergeAndDedupeOrders(ordersFromStats, ordersFromList);
    setOrders(merged);
    setLoading(false);
  }, [buildSalesStatsUrl]);

  //------------------------------------------
  // AUTO REFRESH
  //------------------------------------------

  useEffect(() => {
    fetchSalesStats();
    setCurrentPage(1);
  }, [selectedRange, selectedDate, fetchSalesStats]);

  //------------------------------------------
  //  FRONTEND FILTER APPLY (MAIN FIX)
  //------------------------------------------

  const filteredOrders = useMemo(() => {
    if (selectedRange === 'today') return orders;

    // MONTHLY FIX
    if (selectedRange === 'monthly') {
      const d = new Date(selectedDate);
      return orders.filter(o =>
        isSameMonth(getOrderTimestamp(o), d.getMonth(), d.getFullYear())
      );
    }

    // WEEKLY FIX
    if (selectedRange === 'weekly' && selectedDate?.startDate && selectedDate?.endDate) {
      return orders.filter(o =>
        isBetweenDates(
          getOrderTimestamp(o),
          selectedDate.startDate,
          selectedDate.endDate
        )
      );
    }

    return orders;
  }, [orders, selectedRange, selectedDate]);

  //------------------------------------------

  const visibleOrders = filteredOrders.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / entriesPerPage));

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
          totalEntries={filteredOrders.length}
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