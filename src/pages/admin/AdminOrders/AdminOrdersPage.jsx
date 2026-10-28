import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { fadeIn } from '@/animation/animations';
import {
  ORDER_STATS,
  PRIMARY_ORDERS,
  VENDOR_ORDERS_SUMMARY,
} from '@/mock/admin/orders.mock';
import OrderStatCards from '@/components/admin/orders/OrderStatCards';
import VendorOrdersTable from '@/components/admin/orders/VendorOrdersTable';
import MarketplaceOrdersTable from '@/components/admin/orders/MarketplaceOrdersTable';
import OrderDetailModal from '@/components/admin/orders/OrderDetailModal';
import AdminOrdersTabs from './components/AdminOrdersTabs';
import AdminOrdersVendorToolbar from './components/AdminOrdersVendorToolbar';
import AdminOrdersMarketplaceFilters from './components/AdminOrdersMarketplaceFilters';
import { useDebounce } from '@/hooks';

export const AdminOrdersPage = () => {
  const [activeTab, setActiveTab] = useState('by-vendor');
  const [vendorSearch, setVendorSearch] = useState('');
  const debouncedVendorSearch = useDebounce(vendorSearch, 300);
  const [vendorFilterStatus, setVendorFilterStatus] = useState('all');

  const totalInProgressVendorOrders = useMemo(() => {
    return VENDOR_ORDERS_SUMMARY.reduce((acc, v) => acc + (v.activeOrders || 0), 0);
  }, []);

  const [orderSearch, setOrderSearch] = useState('');
  const debouncedOrderSearch = useDebounce(orderSearch, 300);
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [selectedVendorFilter, setSelectedVendorFilter] = useState('All Vendors');
  const [selectedRiderFilter, setSelectedRiderFilter] = useState('All Riders');
  const [ordersPage, setOrdersPage] = useState(1);
  const pageSize = 10;

  const [selectedOrder, setSelectedOrder] = useState(null);

  const filteredVendors = useMemo(() => {
    return VENDOR_ORDERS_SUMMARY.filter((v) => {
      if (vendorFilterStatus === 'in-progress' && !(v.activeOrders > 0)) {
        return false;
      }
      if (!debouncedVendorSearch.trim()) return true;
      const q = debouncedVendorSearch.toLowerCase();
      return (
        v.vendorName.toLowerCase().includes(q) ||
        v.vendorCode.toLowerCase().includes(q) ||
        v.location.toLowerCase().includes(q)
      );
    });
  }, [debouncedVendorSearch, vendorFilterStatus]);

  const tabCounts = useMemo(() => {
    return { allCount: 24, newCount: 5, completedCount: 18, cancelledCount: 2 };
  }, []);

  const filteredOrders = useMemo(() => {
    return PRIMARY_ORDERS.filter((order) => {
      if (activeTab === 'new' && order.status !== 'Pending' && order.status !== 'Processing') return false;
      if (activeTab === 'completed' && order.status !== 'Completed') return false;
      if (activeTab === 'cancelled' && order.status !== 'Cancelled') return false;
      if (selectedStatus !== 'All Status' && order.status !== selectedStatus) return false;
      if (selectedVendorFilter !== 'All Vendors' && order.vendor?.name !== selectedVendorFilter) return false;
      if (selectedRiderFilter !== 'All Riders' && order.rider?.name !== selectedRiderFilter) return false;

      if (debouncedOrderSearch.trim()) {
        const q = debouncedOrderSearch.toLowerCase();
        const matchesId = order.id.toLowerCase().includes(q) || order.orderId?.toLowerCase().includes(q);
        const matchesCustomer = order.customer?.name.toLowerCase().includes(q);
        const matchesVendor = order.vendor?.name.toLowerCase().includes(q);
        const matchesRider = order.rider?.name.toLowerCase().includes(q);
        if (!matchesId && !matchesCustomer && !matchesVendor && !matchesRider) return false;
      }
      return true;
    });
  }, [activeTab, selectedStatus, selectedVendorFilter, selectedRiderFilter, debouncedOrderSearch]);

  const paginatedOrders = useMemo(() => {
    const start = (ordersPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, ordersPage, pageSize]);

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-12"
    >
      {/* Top Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Orders Management
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
          View, track and manage all marketplace orders.
        </p>
      </div>

      {/* 5 Stat Cards */}
      <OrderStatCards stats={ORDER_STATS} />

      {/* Tabs */}
      <AdminOrdersTabs
        activeTab={activeTab}
        onTabChange={(tabId) => {
          setActiveTab(tabId);
          setOrdersPage(1);
        }}
        vendorsCount={VENDOR_ORDERS_SUMMARY.length}
        tabCounts={tabCounts}
      />

      {/* Content */}
      {activeTab === 'by-vendor' ? (
        <div className="space-y-4">
          <AdminOrdersVendorToolbar
            vendorSearch={vendorSearch}
            onSearchChange={setVendorSearch}
            vendorFilterStatus={vendorFilterStatus}
            onFilterStatusChange={setVendorFilterStatus}
            totalInProgress={totalInProgressVendorOrders}
          />
          <VendorOrdersTable vendors={filteredVendors} />
        </div>
      ) : (
        <div className="space-y-4">
          <AdminOrdersMarketplaceFilters
            orderSearch={orderSearch}
            onSearchChange={(v) => {
              setOrderSearch(v);
              setOrdersPage(1);
            }}
            selectedStatus={selectedStatus}
            onStatusChange={(v) => {
              setSelectedStatus(v);
              setOrdersPage(1);
            }}
            selectedVendorFilter={selectedVendorFilter}
            onVendorFilterChange={(v) => {
              setSelectedVendorFilter(v);
              setOrdersPage(1);
            }}
            selectedRiderFilter={selectedRiderFilter}
            onRiderFilterChange={(v) => {
              setSelectedRiderFilter(v);
              setOrdersPage(1);
            }}
          />
          <MarketplaceOrdersTable
            orders={paginatedOrders}
            currentPage={ordersPage}
            pageSize={pageSize}
            totalOrders={filteredOrders.length}
            onPageChange={setOrdersPage}
            onViewOrder={setSelectedOrder}
          />
        </div>
      )}

      {/* Order Detail Modal */}
      <OrderDetailModal
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
      />
    </motion.div>
  );
};

export default AdminOrdersPage;
