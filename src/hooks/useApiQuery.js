import { useQuery } from '@tanstack/react-query';
import { get } from '@/services/apiServices';

export const useApiQuery = (queryKey, url, options = {}) => {
  const { params, ...queryOptions } = options;

  return useQuery({
    queryKey,
    queryFn: () => get(url, params),
    enabled: !!url && (queryOptions.enabled !== undefined ? queryOptions.enabled : true),
    ...queryOptions,
  });
};

export default useApiQuery;
