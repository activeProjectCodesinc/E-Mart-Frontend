import { useState, useMemo } from 'react';
import { INITIAL_ORDERS } from '@/mock/vendor/vendorOrders.mock';
import OrdersHeader from '@/components/vendor/orders/OrdersHeader';
import OrdersFilterBar from '@/components/vendor/orders/OrdersFilterBar';
import OrdersTable from '@/components/vendor/orders/OrdersTable';
import AcceptOrderModal from '@/components/vendor/orders/AcceptOrderModal';
import RejectOrderModal from '@/components/vendor/orders/RejectOrderModal';
import { useAdminOrders, useUpdateOrderStatus, useCancelOrder } from '@/hooks';

const normalizeStatus = (rawStatus, deliveryType) => {
  if (!rawStatus) return 'New Order';
  const lower = String(rawStatus).toLowerCase();
  if (lower === 'new' || lower === 'pending') return 'New Order';
  if (lower === 'processing') return 'Processing';
  if (lower === 'ready' || lower === 'ready_for_pickup') return 'Ready for Pickup';
  if (lower === 'out_for_delivery') return 'Out for Delivery';
  if (lower === 'delivered' || lower === 'completed') {
    return deliveryType === 'take_away' ? 'Completed' : 'Delivered';
  }
  if (lower === 'cancelled' || lower === 'rejected') return 'Cancelled';
  return lower.charAt(0).toUpperCase() + lower.slice(1).replace('_', ' ');
};

const formatDate = (isoString) => {
  if (!isoString) return 'Today';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return String(isoString);
  const datePart = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const timePart = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  return `${datePart}, ${timePart}`;
};

const getCustomerName = (cust) => {
  if (!cust) return 'Walk-in Customer';
  if (typeof cust === 'string') return cust;
  return (
    cust.name ||
    cust.fullName ||
    `${cust.firstName || ''} ${cust.lastName || ''}`.trim() ||
    'Walk-in Customer'
  );
};

const getCustomerPhone = (cust) => {
  if (!cust || typeof cust !== 'object') return '';
  return cust.phone && cust.phone !== '—' && cust.phone !== '+92 300 0000000' ? cust.phone : '';
};

export const VendorOrdersPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('Date Range');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const [acceptModal, setAcceptModal] = useState({ isOpen: false, order: null });
  const [rejectModal, setRejectModal] = useState({ isOpen: false, order: null });

  const apiFilters = useMemo(() => {
    const f = { page: currentPage, pageSize };
    if (activeTab !== 'all') f.tab = activeTab;
    if (searchQuery.trim()) f.q = searchQuery.trim();
    return f;
  }, [activeTab, searchQuery, currentPage, pageSize]);

  const {
    orders: apiOrders,
    counts: apiCounts,
    meta,
    isLoading,
  } = useAdminOrders(apiFilters);

  const { mutate: updateOrderStatus } = useUpdateOrderStatus();
  const { mutate: cancelOrder } = useCancelOrder();

  const ordersList = useMemo(() => {
    if (apiOrders && Array.isArray(apiOrders)) {
      return apiOrders.map((o) => ({
        id: o.orderNumber ? `#${o.orderNumber}` : (o.id ? `#${o.id.slice(0, 8)}` : '#EM'),
        cleanId: o.id,
        orderNumber: o.orderNumber || o.id,
        customer: getCustomerName(o.customer),
        phone: getCustomerPhone(o.customer) || o.phone || '',
        itemsCount: o.itemsCount || (Array.isArray(o.items) ? o.items.length : 1),
        total: String(o.total).startsWith('PKR') ? o.total : `PKR ${Number(o.total || 0).toFixed(2)}`,
        status: normalizeStatus(o.status, o.deliveryType || o.delivery_type),
        rawStatus: o.status,
        date: formatDate(o.placedAt || o.createdAt || o.date),
        placedAt: o.placedAt || o.createdAt || o.date,
        deliveryType: o.deliveryType || 'take_away',
      }));
    }
    return INITIAL_ORDERS;
  }, [apiOrders]);

  const totalOrders = meta?.total ?? ordersList.length;
  const totalPages = Math.max(1, Math.ceil(totalOrders / pageSize));

  const counts = useMemo(
    () => ({
      all: apiCounts?.all ?? totalOrders,
      new: apiCounts?.new ?? ordersList.filter((o) => o.status === 'New Order').length,
      completed: apiCounts?.completed ?? ordersList.filter((o) => o.status === 'Delivered' || o.status === 'Completed').length,
      cancelled: apiCounts?.cancelled ?? ordersList.filter((o) => o.status === 'Cancelled').length,
    }),
    [apiCounts, totalOrders, ordersList]
  );

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleConfirmAccept = ({ orderId, prepTime }) => {
    const target = ordersList.find((o) => o.id === orderId || o.cleanId === orderId);
    updateOrderStatus({
      id: target?.cleanId || orderId,
      status: 'preparing',
    });
    setAcceptModal({ isOpen: false, order: null });
  };

  const handleConfirmReject = ({ orderId, reason, note }) => {
    const target = ordersList.find((o) => o.id === orderId || o.cleanId === orderId);
    cancelOrder({
      id: target?.cleanId || orderId,
      reason: reason || note || 'Customer requested cancellation before preparation.',
    });
    setRejectModal({ isOpen: false, order: null });
  };

  return (
    <div className={`space-y-5 transition-opacity ${isLoading ? 'opacity-80' : 'opacity-100'}`}>
      <OrdersHeader
        activeTab={activeTab}
        onTabChange={handleTabChange}
        counts={counts}
      />

      <OrdersFilterBar
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        totalOrders={totalOrders}
      />

      <OrdersTable
        orders={ordersList}
        currentPage={currentPage}
        totalPages={totalPages}
        totalOrders={totalOrders}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onAccept={(order) => setAcceptModal({ isOpen: true, order })}
        onReject={(order) => setRejectModal({ isOpen: true, order })}
      />

      <AcceptOrderModal
        isOpen={acceptModal.isOpen}
        order={acceptModal.order}
        onClose={() => setAcceptModal({ isOpen: false, order: null })}
        onConfirm={handleConfirmAccept}
      />

      <RejectOrderModal
        isOpen={rejectModal.isOpen}
        order={rejectModal.order}
        onClose={() => setRejectModal({ isOpen: false, order: null })}
        onConfirm={handleConfirmReject}
      />
    </div>
  );
};

export default VendorOrdersPage;
