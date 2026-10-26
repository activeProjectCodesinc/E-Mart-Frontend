import { useApiQuery } from '@/hooks/useApiQuery';
import { apiRoutes } from '@/services/apiRoutes';
import { QUERY_KEYS } from '@/services/queryKeys';

export const useAdminDashboard = (dateRange = {}) => {
  const query = useApiQuery(
    QUERY_KEYS.ADMIN.DASHBOARD(dateRange),
    apiRoutes.admin.dashboard,
    {
      params: dateRange,
      staleTime: 60 * 1000,
    }
  );

  return {
    dashboard: query.data?.data,
    period: query.data?.data?.period,
    store: query.data?.data?.store,
    kpis: query.data?.data?.kpis,
    salesOverview: query.data?.data?.salesOverview || [],
    recentOrders: query.data?.data?.recentOrders || [],
    topProducts: query.data?.data?.topProducts || [],
    lowStock: query.data?.data?.lowStock || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

export default useAdminDashboard;
