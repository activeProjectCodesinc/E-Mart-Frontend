import { useApiQuery } from '@/hooks/useApiQuery';
import { useApiMutation } from '@/hooks/useApiMutation';
import { apiRoutes } from '@/services/apiRoutes';
import { QUERY_KEYS } from '@/services/queryKeys';
import { patch, post } from '@/services/apiServices';

export const useAdminOrders = (filters = {}) => {
  const query = useApiQuery(
    QUERY_KEYS.ADMIN.ORDERS.LIST(filters),
    apiRoutes.admin.orders.base,
    { params: filters }
  );

  return {
    orders: query.data?.data?.orders || [],
    meta: query.data?.meta || {},
    counts: query.data?.meta?.counts || {},
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

export const useAdminOrderDetail = (id) => {
  const query = useApiQuery(
    QUERY_KEYS.ADMIN.ORDERS.DETAIL(id),
    id ? apiRoutes.admin.orders.detail(id) : null,
    { enabled: Boolean(id) }
  );

  return {
    order: query.data?.data?.order || query.data?.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

export const useUpdateOrderStatus = (options = {}) =>
  useApiMutation(
    ({ id, status }) =>
      patch(apiRoutes.admin.orders.status(id), { status }),
    {
      invalidateKeys: [
        QUERY_KEYS.ADMIN.ORDERS.ALL,
        QUERY_KEYS.ADMIN.DASHBOARD(),
      ],
      successMessage: 'Order status updated successfully!',
      ...options,
    }
  );

export const useCancelOrder = (options = {}) =>
  useApiMutation(
    ({ id, reason }) =>
      post(apiRoutes.admin.orders.cancel(id), { reason }),
    {
      invalidateKeys: [
        QUERY_KEYS.ADMIN.ORDERS.ALL,
        QUERY_KEYS.ADMIN.DASHBOARD(),
      ],
      successMessage: 'Order cancelled.',
      ...options,
    }
  );
