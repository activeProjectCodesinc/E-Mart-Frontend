import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  INITIAL_ACCOUNT_SETTINGS,
  INITIAL_PAYMENT_SETTINGS,
  INITIAL_NOTIFICATION_PREFERENCES,
} from '@/mock/vendor/vendorSettings.mock';
import SettingsHeader from '@/components/vendor/settings/SettingsHeader';
import AccountSettingsCard from '@/components/vendor/settings/AccountSettingsCard';
import PasswordSecurityCard from '@/components/vendor/settings/PasswordSecurityCard';
import PaymentSettingsCard from '@/components/vendor/settings/PaymentSettingsCard';
import NotificationPreferencesCard from '@/components/vendor/settings/NotificationPreferencesCard';
import { useSettings } from '@/hooks/useSettings';

export const VendorSettingsPage = () => {
  const location = useLocation();
  const isAdminStore =
    location.pathname.startsWith('/admin') ||
    location.pathname.includes('/store/settings');

  const { profile, updateProfile, isUpdatingProfile } = useSettings();

  const [accountData, setAccountData] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('adminUser') || '{}');
      if (stored && (stored.email || stored.fullName || stored.avatar || stored.avatarUrl)) {
        return {
          ...INITIAL_ACCOUNT_SETTINGS,
          fullName: stored.fullName || `${stored.firstName || ''} ${stored.lastName || ''}`.trim() || INITIAL_ACCOUNT_SETTINGS.fullName,
          email: stored.email || INITIAL_ACCOUNT_SETTINGS.email,
          phone: stored.phone || INITIAL_ACCOUNT_SETTINGS.phone,
          avatar: stored.avatar || stored.avatarUrl || stored.profileImage || INITIAL_ACCOUNT_SETTINGS.avatar,
        };
      }
    } catch {
      // Fallback
    }
    return INITIAL_ACCOUNT_SETTINGS;
  });
  const [paymentData, setPaymentData] = useState(INITIAL_PAYMENT_SETTINGS);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATION_PREFERENCES);

  useEffect(() => {
    if (profile) {
      const user = profile.user || profile;
      const avatarUrl = user.avatar || user.avatarUrl || user.profileImage;
      const nextFullName = user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim();
      const nextEmail = user.email;
      const nextPhone = user.phone;

      setAccountData((prev) => {
        const resolvedFullName = nextFullName || prev.fullName;
        const resolvedEmail = nextEmail || prev.email;
        const resolvedPhone = nextPhone || prev.phone;
        const resolvedAvatar = avatarUrl || prev.avatar;

        if (
          prev.fullName === resolvedFullName &&
          prev.email === resolvedEmail &&
          prev.phone === resolvedPhone &&
          prev.avatar === resolvedAvatar
        ) {
          return prev;
        }

        return {
          ...prev,
          fullName: resolvedFullName,
          email: resolvedEmail,
          phone: resolvedPhone,
          avatar: resolvedAvatar,
        };
      });
    }
  }, [profile]);

  const handleAccountChange = (field, value) => {
    setAccountData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveAccount = async (overrideData) => {
    try {
      const targetData = { ...accountData, ...(overrideData || {}) };
      if (targetData.avatarFile) {
        const formData = new FormData();
        formData.append('fullName', targetData.fullName || '');
        formData.append('phone', targetData.phone || '');
        formData.append('file', targetData.avatarFile);
        await updateProfile(formData);
      } else {
        await updateProfile({
          fullName: targetData.fullName,
          phone: targetData.phone,
          avatar: targetData.avatar,
          avatarUrl: targetData.avatar,
          profileImage: targetData.avatar,
        });
      }
    } catch {
      // Error notifications handled by hook
    }
  };

  const handleToggleNotification = (id) => {
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, enabled: !item.enabled } : item
      )
    );
  };

  const displayedNotifications = isAdminStore
    ? notifications.filter((item) => item.id !== 'payouts' && item.id !== 'messages')
    : notifications;

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      <SettingsHeader />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-stretch">
        <AccountSettingsCard
          data={accountData}
          onChange={handleAccountChange}
          onSave={handleSaveAccount}
          isSaving={isUpdatingProfile}
        />

        <PasswordSecurityCard
          hideCurrentPassword={isAdminStore}
          initialTwoFactor={profile?.twoFactorEnabled}
        />

        {!isAdminStore && (
          <PaymentSettingsCard
            data={paymentData}
            onSave={setPaymentData}
          />
        )}

        <NotificationPreferencesCard
          preferences={displayedNotifications}
          onToggle={handleToggleNotification}
          className={isAdminStore ? 'lg:col-span-2' : ''}
          isGridLayout={isAdminStore}
        />
      </div>
    </div>
  );
};

export default VendorSettingsPage;
