import { useApiQuery } from '@/hooks/useApiQuery';
import { useApiMutation } from '@/hooks/useApiMutation';
import { apiRoutes } from '@/services/apiRoutes';
import { QUERY_KEYS } from '@/services/queryKeys';
import { post } from '@/services/apiServices';

/**
 * Hook to fetch active store products for POS with search, category and pagination.
 */
export const usePosProducts = (params = {}) => {
  const query = useApiQuery(
    QUERY_KEYS.ADMIN.STORE.POS.PRODUCTS(params),
    apiRoutes.admin.store.pos.products,
    {
      params,
      keepPreviousData: true,
      staleTime: 1000 * 60 * 2,
    }
  );

  const rawData = query.data?.data;
  const products = Array.isArray(rawData)
    ? rawData
    : rawData?.products || [];

  const meta = query.data?.meta || {
    page: params.page || 1,
    pageSize: params.pageSize || 9,
    total: products.length,
    totalPages: Math.max(1, Math.ceil(products.length / (params.pageSize || 9))),
  };

  return {
    products,
    meta,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

/**
 * Hook to place a POS order (Take Away or Home Delivery).
 */
export const usePlacePosOrder = (options = {}) =>
  useApiMutation(
    (orderData) => post(apiRoutes.admin.store.pos.order, orderData),
    {
      invalidateKeys: [
        QUERY_KEYS.ADMIN.STORE.POS.ALL,
        QUERY_KEYS.ADMIN.ORDERS.ALL,
        QUERY_KEYS.ADMIN.INVENTORY.ALL,
        QUERY_KEYS.ADMIN.DASHBOARD(),
      ],
      ...options,
    }
  );

/**
 * Hook to fetch registered store customers for POS customer selection.
 */
export const useStoreCustomers = (params = { tab: 'all', page: 1, pageSize: 50 }) => {
  const query = useApiQuery(
    QUERY_KEYS.CUSTOMERS.LIST(params),
    apiRoutes.admin.customers.base,
    {
      params,
      staleTime: 1000 * 60 * 5,
    }
  );

  const rawData = query.data?.data;
  const customers = Array.isArray(rawData)
    ? rawData
    : rawData?.customers || [];

  return {
    customers,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};
