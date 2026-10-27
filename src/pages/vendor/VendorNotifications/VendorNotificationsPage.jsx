import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortalBase } from '@/utils/usePortalBase';
import { useStoreNotifications } from '@/hooks/useStoreNotifications';
import NotificationsHeader from '@/components/vendor/notifications/NotificationsHeader';
import NotificationsFilterTabs from '@/components/vendor/notifications/NotificationsFilterTabs';
import NotificationCardItem from '@/components/vendor/notifications/NotificationCardItem';
import NotificationSettingsModal from '@/components/vendor/notifications/NotificationSettingsModal';
import { BellIcon } from '@/icons';

const formatTimeAgo = (dateStr) => {
  if (!dateStr) return 'Just now';
  const diffMs = Date.now() - new Date(dateStr).getTime();
  if (diffMs < 0) return 'Just now';
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
};

export const VendorNotificationsPage = () => {
  const navigate = useNavigate();
  const { getRoute } = usePortalBase();
  const [activeTab, setActiveTab] = useState('all');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Live REST API & Socket.IO Hook
  const {
    notifications: apiNotifications,
    unreadCount,
    isLoading,
    refetch,
    markAllAsRead,
    markAsRead,
    clearAll,
    deleteNotification,
  } = useStoreNotifications();

  // Normalize API notifications to card items
  const normalizedNotifications = useMemo(() => {
    if (apiNotifications && Array.isArray(apiNotifications) && apiNotifications.length > 0) {
      return apiNotifications.map((item) => {
        const isOrderDelivered = item.type === 'vendor.order.delivered';

        let cardType = 'order';
        if (isOrderDelivered) cardType = 'delivery';
        else if (item.category === 'payouts') cardType = 'payout';
        else if (item.category === 'stock') cardType = 'low_stock';
        else if (item.category === 'support') cardType = 'suspended';

        return {
          id: item.id,
          type: cardType,
          category: item.category || 'orders',
          title: item.title,
          message: item.body || '',
          time: formatTimeAgo(item.createdAt),
          unread: !item.isRead,
          hasDetails: Boolean(item.data?.orderId || item.data?.cleanId),
          orderId: item.data?.orderId,
          orderNumber: item.data?.orderNumber,
          route: item.data?.orderId ? `/orders/${item.data.orderId}` : null,
          status: item.data?.orderNumber || (isOrderDelivered ? 'Delivered' : null),
          statusColor: isOrderDelivered ? 'emerald' : 'amber',
          rawItem: item,
        };
      });
    }
    return [];
  }, [apiNotifications]);

  // Compute tabs dynamically from live notifications
  const displayedTabs = useMemo(() => {
    const allCount = normalizedNotifications.length;
    const ordersCount = normalizedNotifications.filter((n) => n.category === 'orders').length;
    const unreadCountLocal = normalizedNotifications.filter((n) => n.unread).length;

    return [
      { id: 'all', label: 'All', count: allCount },
      { id: 'orders', label: 'Orders', count: ordersCount },
      { id: 'unread', label: 'Unread', count: unreadCountLocal },
    ];
  }, [normalizedNotifications]);

  // Filter based on active tab
  const filteredNotifications = useMemo(() => {
    if (activeTab === 'all') return normalizedNotifications;
    if (activeTab === 'unread') return normalizedNotifications.filter((n) => n.unread);
    return normalizedNotifications.filter((n) => n.category === activeTab);
  }, [normalizedNotifications, activeTab]);

  const handleViewDetails = (item) => {
    if (item.unread) {
      markAsRead(item.id);
    }
    if (item.orderId) {
      navigate(getRoute(`/orders/${item.orderId}`));
    } else if (item.route) {
      const sub = item.route.replace(/^\/vendor/, '');
      navigate(getRoute(sub));
    }
  };

  const handleMarkSingleAsRead = (id) => {
    markAsRead(id);
  };

  return (
    <div className="space-y-4 sm:space-y-5 w-full">
      <NotificationsHeader onOpenSettings={() => setIsSettingsModalOpen(true)} />

      <NotificationsFilterTabs
        tabs={displayedTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onMarkAllAsRead={markAllAsRead}
        onClearAll={normalizedNotifications.length > 0 ? clearAll : null}
      />

      {isLoading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
          <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Loading notifications...</span>
        </div>
      ) : filteredNotifications.length > 0 ? (
        <div className="space-y-3 sm:space-y-3.5">
          {filteredNotifications.map((item) => (
            <NotificationCardItem
              key={item.id}
              item={item}
              onViewDetails={handleViewDetails}
              onDelete={deleteNotification}
              onMarkAsRead={handleMarkSingleAsRead}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-10 border border-slate-200/80 text-center shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center mx-auto mb-3 shadow-2xs">
            <BellIcon size={24} />
          </div>
          <h3 className="text-base font-semibold text-slate-800">No notifications</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {activeTab === 'unread'
              ? "You've read all your notifications!"
              : "You're all caught up! You'll receive real-time alerts when new orders arrive or are delivered."}
          </p>
        </div>
      )}

      {normalizedNotifications.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs text-slate-500 font-medium">
          <span>
            Showing {filteredNotifications.length} of {normalizedNotifications.length} notifications
          </span>

          <button
            type="button"
            onClick={() => refetch()}
            className="px-4 py-2 bg-white border border-slate-200/90 rounded-xl font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer self-start sm:self-auto"
          >
            Refresh notifications
          </button>
        </div>
      )}

      <NotificationSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onSave={() => {
          setIsSettingsModalOpen(false);
        }}
      />
    </div>
  );
};

export default VendorNotificationsPage;
