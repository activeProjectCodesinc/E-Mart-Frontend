import { useMemo } from 'react';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useApiMutation } from '@/hooks/useApiMutation';
import { apiRoutes } from '@/services/apiRoutes';
import { QUERY_KEYS } from '@/services/queryKeys';
import { patch, uploadFile, put } from '@/services/apiServices';

/**
 * Hook for managing user profile & store settings with TanStack Query.
 */
export const useSettings = () => {
  // Fetch user profile from /me
  const profileQuery = useApiQuery(QUERY_KEYS.AUTH.PROFILE, apiRoutes.user.me, {
    staleTime: 5 * 60 * 1000,
  });

  // Mutation to update profile details (fullName, phone, avatar/file in single endpoint)
  const updateProfileMutation = useApiMutation(
    (data) => {
      const isMultipart = data instanceof FormData;
      return patch(apiRoutes.user.updateProfile, data, null, isMultipart);
    },
    {
      invalidateKey: QUERY_KEYS.AUTH.PROFILE,
      successMessage: 'Account settings saved successfully!',
      onSuccess: (res) => {
        const updated = res?.data?.user || res?.data || res?.user;
        if (updated) {
          try {
            const oldAdmin = JSON.parse(localStorage.getItem('adminUser') || '{}');
            localStorage.setItem(
              'adminUser',
              JSON.stringify({
                ...oldAdmin,
                ...updated,
                fullName: updated.fullName || oldAdmin.fullName,
                firstName: updated.firstName || oldAdmin.firstName,
                lastName: updated.lastName || oldAdmin.lastName,
                email: updated.email || oldAdmin.email,
                phone: updated.phone || oldAdmin.phone,
                avatar: updated.avatar || updated.avatarUrl || updated.profileImage || oldAdmin.avatar,
              })
            );
          } catch {
            // Ignore parse errors
          }
        }
      },
    }
  );

  // Mutation to upload avatar to Cloudinary
  const uploadAvatarMutation = useApiMutation(
    (formData) => uploadFile(`${apiRoutes.files.upload}?purpose=avatar`, formData),
    {
      successMessage: 'Photo uploaded to Cloudinary successfully!',
    }
  );

  // Mutation to upload store logo to Cloudinary
  const uploadStoreLogoMutation = useApiMutation(
    (formData) => uploadFile(`${apiRoutes.files.upload}?purpose=store_logo`, formData),
    {
      successMessage: 'Store logo uploaded to Cloudinary successfully!',
    }
  );

  // Mutation to upload store banner to Cloudinary
  const uploadStoreBannerMutation = useApiMutation(
    (formData) => uploadFile(`${apiRoutes.files.upload}?purpose=store_banner`, formData),
    {
      successMessage: 'Store banner uploaded to Cloudinary successfully!',
    }
  );

  // Fetch notification preferences
  const notificationPrefsQuery = useApiQuery(
    QUERY_KEYS.SETTINGS.NOTIFICATIONS,
    apiRoutes.user.notificationPreferences,
    {
      staleTime: 5 * 60 * 1000,
    }
  );

  // Update notification preferences
  const updateNotificationPrefsMutation = useApiMutation(
    (data) => put(apiRoutes.user.notificationPreferences, data),
    {
      invalidateKey: QUERY_KEYS.SETTINGS.NOTIFICATIONS,
      successMessage: 'Notification preferences updated!',
    }
  );

  const normalizedProfile = useMemo(() => {
    const rawData = profileQuery.data;
    const user =
      rawData?.data?.user ||
      rawData?.user ||
      rawData?.data ||
      rawData;

    if (!user || typeof user !== 'object' || (!user.id && !user.email && !user.fullName && !user.firstName)) {
      return null;
    }

    return {
      ...user,
      user,
      avatar: user.avatar || user.avatarUrl || user.profileImage || '',
      avatarUrl: user.avatarUrl || user.avatar || user.profileImage || '',
      profileImage: user.profileImage || user.avatar || user.avatarUrl || '',
    };
  }, [profileQuery.data]);

  return {
    profile: normalizedProfile,
    isLoadingProfile: profileQuery.isLoading,
    profileError: profileQuery.error,
    refetchProfile: profileQuery.refetch,
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdatingProfile: updateProfileMutation.isPending,
    uploadAvatar: uploadAvatarMutation.mutateAsync,
    isUploadingAvatar: uploadAvatarMutation.isPending,
    uploadStoreLogo: uploadStoreLogoMutation.mutateAsync,
    isUploadingStoreLogo: uploadStoreLogoMutation.isPending,
    uploadStoreBanner: uploadStoreBannerMutation.mutateAsync,
    isUploadingStoreBanner: uploadStoreBannerMutation.isPending,
    notificationPrefs: notificationPrefsQuery.data?.data,
    updateNotificationPrefs: updateNotificationPrefsMutation.mutateAsync,
  };
};

export default useSettings;
