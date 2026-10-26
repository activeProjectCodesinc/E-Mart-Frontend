import { useApiQuery } from '@/hooks/useApiQuery';
import { apiRoutes } from '@/services/apiRoutes';
import { QUERY_KEYS } from '@/services/queryKeys';

export const useCategories = () => {
  const query = useApiQuery(
    QUERY_KEYS.CATEGORIES.TREE,
    apiRoutes.categories.tree,
    {
      staleTime: 1000 * 60 * 15,
    }
  );

  return {
    categories: query.data?.data?.categories || query.data?.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

export const useCategoryDetail = (id) => {
  const query = useApiQuery(
    QUERY_KEYS.CATEGORIES.DETAIL(id),
    id ? apiRoutes.categories.detail(id) : null,
    { enabled: Boolean(id) }
  );

  return {
    category: query.data?.data?.category || query.data?.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

export default useCategories;
