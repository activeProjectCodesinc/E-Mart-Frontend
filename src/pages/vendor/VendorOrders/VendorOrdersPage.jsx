import { useState, useMemo } from 'react';
import { INITIAL_ORDERS } from '@/mock/vendor/vendorOrders.mock';
import OrdersHeader from '@/components/vendor/orders/OrdersHeader';
import OrdersFilterBar from '@/components/vendor/orders/OrdersFilterBar';
import OrdersTable from '@/components/vendor/orders/OrdersTable';
import AcceptOrderModal from '@/components/vendor/orders/AcceptOrderModal';
import RejectOrderModal from '@/components/vendor/orders/RejectOrderModal';
import { useAdminOrders, useUpdateOrderStatus, useCancelOrder } from '@/hooks';

export const VendorOrdersPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('Date Range');
  const [acceptModal, setAcceptModal] = useState({ isOpen: false, order: null });
  const [rejectModal, setRejectModal] = useState({ isOpen: false, order: null });

  const apiFilters = useMemo(() => {
    const f = { page: 1, pageSize: 20 };
    if (activeTab !== 'all') f.tab = activeTab;
    if (searchQuery.trim()) f.q = searchQuery.trim();
    return f;
  }, [activeTab, searchQuery]);

  const { orders: apiOrders, counts: apiCounts, isLoading } = useAdminOrders(apiFilters);
  const { mutate: updateOrderStatus } = useUpdateOrderStatus();
  const { mutate: cancelOrder } = useCancelOrder();

  const ordersList = useMemo(() => {
    if (apiOrders && Array.isArray(apiOrders)) {
      return apiOrders.map((o) => ({
        id: o.orderNumber || o.id,
        cleanId: o.id,
        customer: typeof o.customer === 'object' ? o.customer.fullName : (o.customer || 'Customer'),
        phone: typeof o.customer === 'object' ? o.customer.phone : '',
        itemsCount: o.itemsCount || 1,
        total: String(o.total).startsWith('PKR') ? o.total : `PKR ${o.total}`,
        status: o.status === 'new' ? 'New Order' : o.status ? o.status.charAt(0).toUpperCase() + o.status.slice(1).replace('_', ' ') : 'New Order',
        placedAt: o.placedAt ? new Date(o.placedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Today',
      }));
    }
    return INITIAL_ORDERS;
  }, [apiOrders]);

  const counts = useMemo(
    () => ({
      all: apiCounts?.all ?? ordersList.length,
      new: apiCounts?.new ?? ordersList.filter((o) => o.status === 'New Order').length,
      completed: apiCounts?.completed ?? ordersList.filter((o) => o.status === 'Completed').length,
      cancelled: apiCounts?.cancelled ?? ordersList.filter((o) => o.status === 'Cancelled').length,
    }),
    [apiCounts, ordersList]
  );

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
        onTabChange={setActiveTab}
        counts={counts}
      />

      <OrdersFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        totalOrders={ordersList.length}
      />

      <OrdersTable
        orders={ordersList}
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
