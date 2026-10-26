import { useApiQuery } from '@/hooks/useApiQuery';
import { useApiMutation } from '@/hooks/useApiMutation';
import { apiRoutes } from '@/services/apiRoutes';
import { QUERY_KEYS } from '@/services/queryKeys';
import { post, patch, put, del, uploadFile } from '@/services/apiServices';

export const useAdminProducts = (filters = {}) => {
  const query = useApiQuery(
    QUERY_KEYS.ADMIN.PRODUCTS.LIST(filters),
    apiRoutes.admin.products.base,
    { params: filters }
  );

  return {
    products: query.data?.data?.products || [],
    meta: query.data?.meta || {},
    counts: query.data?.meta?.counts || {},
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

export const useAdminProductDetail = (id) => {
  const query = useApiQuery(
    QUERY_KEYS.ADMIN.PRODUCTS.DETAIL(id),
    id ? apiRoutes.admin.products.detail(id) : null,
    { enabled: Boolean(id) }
  );

  return {
    product: query.data?.data?.product || query.data?.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

export const useCreateProduct = (options = {}) =>
  useApiMutation((data) => post(apiRoutes.admin.products.base, data), {
    invalidateKeys: [
      QUERY_KEYS.ADMIN.PRODUCTS.ALL,
      QUERY_KEYS.ADMIN.DASHBOARD(),
    ],
    successMessage: 'Product created successfully!',
    ...options,
  });

export const useUpdateProduct = (options = {}) =>
  useApiMutation(
    ({ id, ...data }) => patch(apiRoutes.admin.products.detail(id), data),
    {
      invalidateKeys: [
        QUERY_KEYS.ADMIN.PRODUCTS.ALL,
        QUERY_KEYS.ADMIN.DASHBOARD(),
      ],
      successMessage: 'Product updated successfully!',
      ...options,
    }
  );

export const useUpdateProductStatus = (options = {}) =>
  useApiMutation(
    ({ id, status, reason }) =>
      patch(apiRoutes.admin.products.status(id), { status, reason }),
    {
      invalidateKeys: [
        QUERY_KEYS.ADMIN.PRODUCTS.ALL,
        QUERY_KEYS.ADMIN.DASHBOARD(),
      ],
      successMessage: 'Product status updated!',
      ...options,
    }
  );

export const useDeleteProduct = (options = {}) =>
  useApiMutation((id) => del(apiRoutes.admin.products.detail(id)), {
    invalidateKeys: [
      QUERY_KEYS.ADMIN.PRODUCTS.ALL,
      QUERY_KEYS.ADMIN.DASHBOARD(),
    ],
    successMessage: 'Product deleted successfully!',
    ...options,
  });

export const useUploadProductImages = (options = {}) =>
  useApiMutation(
    ({ id, formData }) =>
      uploadFile(apiRoutes.admin.products.images(id), formData),
    {
      invalidateKeys: [QUERY_KEYS.ADMIN.PRODUCTS.ALL],
      successMessage: 'Images uploaded successfully!',
      ...options,
    }
  );

export const useReorderProductImages = (options = {}) =>
  useApiMutation(
    ({ id, imageIds }) =>
      put(apiRoutes.admin.products.images(id), { imageIds }),
    {
      invalidateKeys: [QUERY_KEYS.ADMIN.PRODUCTS.ALL],
      successMessage: 'Images reordered successfully!',
      ...options,
    }
  );

export const useDeleteProductImage = (options = {}) =>
  useApiMutation(
    ({ id, imageId }) =>
      del(apiRoutes.admin.products.deleteImage(id, imageId)),
    {
      invalidateKeys: [QUERY_KEYS.ADMIN.PRODUCTS.ALL],
      successMessage: 'Image removed successfully!',
      ...options,
    }
  );
