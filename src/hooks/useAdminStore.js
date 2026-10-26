import { useApiQuery } from '@/hooks/useApiQuery';
import { useApiMutation } from '@/hooks/useApiMutation';
import { apiRoutes } from '@/services/apiRoutes';
import { QUERY_KEYS } from '@/services/queryKeys';
import { patch } from '@/services/apiServices';

export const useAdminStoreProfile = () => {
  const query = useApiQuery(
    QUERY_KEYS.ADMIN.STORE.PROFILE,
    apiRoutes.admin.store.management
  );

  return {
    store: query.data?.data?.store || query.data?.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

export const useUpdateStoreProfile = (options = {}) =>
  useApiMutation(
    (data) => patch(apiRoutes.admin.store.management, data),
    {
      invalidateKey: QUERY_KEYS.ADMIN.STORE.PROFILE,
      successMessage: 'Store profile updated successfully!',
      ...options,
    }
  );
