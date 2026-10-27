import { useApiQuery } from '@/hooks/useApiQuery';
import { useApiMutation } from '@/hooks/useApiMutation';
import { apiRoutes } from '@/services/apiRoutes';
import { QUERY_KEYS } from '@/services/queryKeys';
import { post, uploadFile } from '@/services/apiServices';

export const useAdminInventory = (filters = {}) => {
  const query = useApiQuery(
    QUERY_KEYS.ADMIN.INVENTORY.LIST(filters),
    apiRoutes.admin.inventory.base,
    { params: filters }
  );

  const rawData = query.data?.data;
  const inventoryList =
    rawData?.inventory ||
    rawData?.products ||
    rawData?.items ||
    (Array.isArray(rawData) ? rawData : []);

  return {
    inventory: inventoryList,
    meta: query.data?.meta || {},
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

export const useInventoryMovements = (filterOrId) => {
  const params =
    typeof filterOrId === 'object' && filterOrId !== null
      ? filterOrId
      : { productId: filterOrId };

  const keyId = params.productId || params.variantId || 'all';

  const query = useApiQuery(
    QUERY_KEYS.ADMIN.INVENTORY.MOVEMENTS(keyId),
    Boolean(params.productId || params.variantId) ? apiRoutes.admin.inventory.movements : null,
    {
      params,
      enabled: Boolean(params.productId || params.variantId),
    }
  );

  return {
    movements: query.data?.data?.movements || query.data?.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

export const useAdjustStock = (options = {}) =>
  useApiMutation(
    (data) => post(apiRoutes.admin.inventory.adjust, data),
    {
      invalidateKeys: [
        QUERY_KEYS.ADMIN.INVENTORY.ALL,
        QUERY_KEYS.ADMIN.PRODUCTS.ALL,
        QUERY_KEYS.ADMIN.DASHBOARD(),
      ],
      successMessage: 'Stock adjusted successfully!',
      ...options,
    }
  );

export const usePreviewInventoryImport = (options = {}) =>
  useApiMutation(
    (formData) =>
      uploadFile(apiRoutes.admin.inventory.importPreview, formData),
    {
      successMessage: 'Import preview generated!',
      ...options,
    }
  );

export const useCommitInventoryImport = (options = {}) =>
  useApiMutation(
    (data) => post(apiRoutes.admin.inventory.importCommit, data),
    {
      invalidateKeys: [
        QUERY_KEYS.ADMIN.INVENTORY.ALL,
        QUERY_KEYS.ADMIN.PRODUCTS.ALL,
        QUERY_KEYS.ADMIN.DASHBOARD(),
      ],
      successMessage: 'Bulk inventory imported successfully!',
      ...options,
    }
  );
