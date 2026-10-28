import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useApiMutation } from '@/hooks/useApiMutation';
import { apiRoutes } from '@/services/apiRoutes';
import { QUERY_KEYS } from '@/services/queryKeys';
import { post, del } from '@/services/apiServices';
import { getAccessToken } from '@/services/tokenService';
import { playNotificationSound } from '@/utils/sound';
import { toast } from '@/utils/toast';
import baseURL from '@/services/apiBaseURL';

/**
 * Socket URL resolution:
 * Resolves to VITE_SOCKET_URL, or derives from baseURL (e.g. https://emart.oneclickexperts.com)
 */
const getSocketUrl = (namespace = '/vendor') => {
  const envUrl = import.meta.env.VITE_SOCKET_URL;
  if (envUrl) {
    const clean = envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
    return `${clean}${namespace}`;
  }

  if (baseURL && typeof baseURL === 'string' && baseURL.startsWith('http')) {
    try {
      const parsed = new URL(baseURL);
      return `${parsed.origin}${namespace}`;
    } catch {
      // ignore parsing error
    }
  }

  return `https://emart.oneclickexperts.com${namespace}`;
};

export const useStoreNotifications = (filters = {}) => {
  const queryClient = useQueryClient();
  const socketRef = useRef(null);

  const queryParams = {
    category: filters.category && filters.category !== 'all' ? filters.category : undefined,
    unread: filters.unread !== undefined ? filters.unread : undefined,
    page: filters.page || 1,
    pageSize: filters.pageSize || 20,
  };

  const listKey = QUERY_KEYS.ADMIN?.STORE?.NOTIFICATIONS?.LIST(queryParams) || [
    'admin',
    'store',
    'notifications',
    'list',
    queryParams,
  ];

  const unreadCountKey = QUERY_KEYS.ADMIN?.STORE?.NOTIFICATIONS?.UNREAD_COUNT || [
    'admin',
    'store',
    'notifications',
    'unread-count',
  ];

  // 1. Fetch Notifications List
  const {
    data: listResponse,
    isLoading,
    refetch,
    isFetching,
  } = useApiQuery(listKey, apiRoutes.admin?.store?.notifications?.base || '/admin/store/notifications', {
    params: queryParams,
    staleTime: 1000 * 60 * 2,
  });

  // 2. Fetch Unread Count
  const { data: unreadResponse } = useApiQuery(
    unreadCountKey,
    apiRoutes.admin?.store?.notifications?.unreadCount || '/admin/store/notifications/unread-count',
    {
      staleTime: 1000 * 30,
    }
  );

  const notifications = listResponse?.data?.notifications || [];
  const meta = listResponse?.meta || {};
  const unreadCount =
    unreadResponse?.data?.unreadCount ??
    meta?.unreadCount ??
    notifications.filter((n) => !n.isRead).length;

  // 3. Mark All as Read Mutation
  const { mutate: markAllAsRead, isPending: isMarkingAll } = useApiMutation(
    () => post(apiRoutes.admin?.store?.notifications?.readAll || '/admin/store/notifications/read-all'),
    {
      invalidateKeys: [
        QUERY_KEYS.ADMIN?.STORE?.NOTIFICATIONS?.ALL,
        unreadCountKey,
      ],
      successMessage: 'All notifications marked as read',
    }
  );

  // 4. Mark Single as Read Mutation
  const { mutate: markAsRead } = useApiMutation(
    (id) => post(apiRoutes.admin?.store?.notifications?.read(id) || `/admin/store/notifications/${id}/read`),
    {
      invalidateKeys: [
        QUERY_KEYS.ADMIN?.STORE?.NOTIFICATIONS?.ALL,
        unreadCountKey,
      ],
    }
  );

  // 5. Clear All Notifications Mutation
  const { mutate: clearAll, isPending: isClearingAll } = useApiMutation(
    () => del(apiRoutes.admin?.store?.notifications?.clearAll || '/admin/store/notifications/clear-all'),
    {
      invalidateKeys: [
        QUERY_KEYS.ADMIN?.STORE?.NOTIFICATIONS?.ALL,
        unreadCountKey,
      ],
      successMessage: 'All notifications cleared',
    }
  );

  // 6. Delete Single Notification Mutation
  const { mutate: deleteNotification } = useApiMutation(
    (id) => del(apiRoutes.admin?.store?.notifications?.delete(id) || `/admin/store/notifications/${id}`),
    {
      invalidateKeys: [
        QUERY_KEYS.ADMIN?.STORE?.NOTIFICATIONS?.ALL,
        unreadCountKey,
      ],
      successMessage: 'Notification deleted',
    }
  );

  // 7. Socket.IO Real-Time Listener
  useEffect(() => {
    const token = getAccessToken() || localStorage.getItem('accessToken');
    if (!token) return;

    const socketUrl = getSocketUrl('/vendor');
    const socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      // Socket connected
    });

    socket.on('notification:new', (payload) => {
      // 1. Play sound chime
      playNotificationSound();

      // 2. Show toast alert
      if (payload?.notification?.title) {
        toast.info(`${payload.notification.title}: ${payload.notification.body || ''}`);
      }

      // 3. Invalidate notifications and unread queries
      queryClient.invalidateQueries({ queryKey: ['admin', 'store', 'notifications'] });
    });

    socket.on('notification:unread-count', (payload) => {
      queryClient.setQueryData(unreadCountKey, {
        success: true,
        data: { unreadCount: payload?.unreadCount ?? 0 },
      });
      queryClient.invalidateQueries({ queryKey: unreadCountKey });
    });

    socket.on('connect_error', () => {
      // Silent error handler for local socket disconnects
    });

    return () => {
      socket.disconnect();
    };
  }, [queryClient, unreadCountKey]);

  return {
    notifications,
    meta,
    unreadCount,
    isLoading,
    isFetching,
    refetch,
    markAllAsRead,
    isMarkingAll,
    markAsRead,
    clearAll,
    isClearingAll,
    deleteNotification,
  };
};

export default useStoreNotifications;
