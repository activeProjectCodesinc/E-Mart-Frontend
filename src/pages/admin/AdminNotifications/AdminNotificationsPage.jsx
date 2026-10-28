import { useState, useMemo } from 'react';
import { CheckCheckIcon } from '@/icons';
import { useAnimatedIcon } from '@/utils/useAnimatedIcon';
import { INITIAL_NOTIFICATIONS } from '@/mock/admin/adminNotifications.mock';
import { NotificationStats } from '@/components/admin/notifications/NotificationStats';
import { NotificationFilters } from '@/components/admin/notifications/NotificationFilters';
import { NotificationGroup } from '@/components/admin/notifications/NotificationGroup';
import { NotificationDetailModal } from '@/components/admin/notifications/NotificationDetailModal';
import { useDebounce } from '@/hooks';

export const AdminNotificationsPage = () => {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'unread'
  const [activeCategory, setActiveCategory] = useState('All categories');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [btnIconRef, btnTrigger] = useAnimatedIcon();

  // Dynamic statistics
  const stats = useMemo(() => {
    const total = notifications.length;
    const unread = notifications.filter((n) => !n.isRead).length;
    const needsAttention = notifications.filter((n) => n.needsAttention).length;
    const receivedToday = notifications.filter((n) => n.groupDate.includes('Today')).length;
    return { total, unread, needsAttention, receivedToday };
  }, [notifications]);

  // Mark all notifications as read
  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
  };

  // Toggle single item read status
  const handleToggleRead = (id) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isRead: !item.isRead } : item))
    );
    if (selectedNotif && selectedNotif.id === id) {
      setSelectedNotif((prev) => (prev ? { ...prev, isRead: !prev.isRead } : null));
    }
  };

  // Filtered list
  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      if (activeTab === 'unread' && item.isRead) return false;
      if (activeCategory !== 'All categories' && item.category !== activeCategory) return false;
      if (debouncedSearchQuery.trim()) {
        const q = debouncedSearchQuery.toLowerCase();
        const matchesEntity = item.entityId.toLowerCase().includes(q);
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesCat = item.category.toLowerCase().includes(q);
        if (!matchesEntity && !matchesTitle && !matchesDesc && !matchesCat) return false;
      }
      return true;
    });
  }, [notifications, activeTab, activeCategory, debouncedSearchQuery]);

  // Group filtered notifications by date
  const groupedNotifications = useMemo(() => {
    const groups = {};
    filteredNotifications.forEach((item) => {
      if (!groups[item.groupDate]) {
        groups[item.groupDate] = [];
      }
      groups[item.groupDate].push(item);
    });
    return groups;
  }, [filteredNotifications]);

  const groupDates = Object.keys(groupedNotifications);
  const unreadFilteredCount = filteredNotifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Notifications
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Stay up to date with orders, payments, vendors and issues that need your attention.
          </p>
        </div>

        <button
          type="button"
          onClick={handleMarkAllAsRead}
          onMouseEnter={btnTrigger.onMouseEnter}
          onMouseLeave={btnTrigger.onMouseLeave}
          className="group inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold shadow-xs shadow-orange-500/25 active:scale-95 transition-all cursor-pointer self-start sm:self-auto"
        >
          <CheckCheckIcon ref={btnIconRef} size={16} animateOnHover={false} />
          <span>Mark all as read</span>
        </button>
      </div>

      {/* KPI Stats */}
      <NotificationStats stats={stats} />

      {/* Main Content Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-6 shadow-xs space-y-6">
        {/* Filters & Search */}
        <NotificationFilters
          activeTab={activeTab}
          onTabChange={setActiveTab}
          unreadCount={stats.unread}
          totalCount={stats.total}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />

        {/* Grouped Notifications List */}
        <div className="space-y-6 pt-2">
          {groupDates.length > 0 ? (
            groupDates.map((groupDate) => (
              <NotificationGroup
                key={groupDate}
                groupDate={groupDate}
                items={groupedNotifications[groupDate]}
                onViewDetail={setSelectedNotif}
                onToggleRead={handleToggleRead}
              />
            ))
          ) : (
            <div className="text-center py-12 px-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
              <p className="text-sm font-semibold text-slate-700">No notifications found</p>
              <p className="text-xs text-slate-400 mt-1">
                Try adjusting your search query or switching categories.
              </p>
            </div>
          )}
        </div>

        {/* Footer status bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-4 border-t border-slate-100 text-xs text-slate-400 font-medium">
          <div>
            Showing all {filteredNotifications.length} notification
            {filteredNotifications.length === 1 ? '' : 's'} · {unreadFilteredCount} unread
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            <span>Unread notification</span>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <NotificationDetailModal
        isOpen={Boolean(selectedNotif)}
        onClose={() => setSelectedNotif(null)}
        notification={selectedNotif}
        onToggleRead={handleToggleRead}
      />
    </div>
  );
};

export default AdminNotificationsPage;
