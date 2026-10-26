import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from '@/utils/toast';

export const useApiMutation = (mutationFn, options = {}) => {
  const queryClient = useQueryClient();
  const {
    invalidateKey,
    invalidateKeys,
    successMessage,
    onSuccess,
    onError,
    ...rest
  } = options;

  return useMutation({
    mutationFn,
    onSuccess: (data, variables, context) => {
      const keys = [];
      if (invalidateKeys && Array.isArray(invalidateKeys)) {
        keys.push(...invalidateKeys);
      } else if (invalidateKey) {
        if (Array.isArray(invalidateKey) && Array.isArray(invalidateKey[0])) {
          keys.push(...invalidateKey);
        } else {
          keys.push(invalidateKey);
        }
      }

      keys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });

      if (successMessage) {
        toast.success(
          typeof successMessage === 'function' ? successMessage(data) : successMessage
        );
      }

      if (onSuccess) {
        onSuccess(data, variables, context);
      }
    },
    onError: (error, variables, context) => {
      if (onError) {
        onError(error, variables, context);
      }
    },
    ...rest,
  });
};

export default useApiMutation;
