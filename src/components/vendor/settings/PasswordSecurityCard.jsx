import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAnimatedIcon } from '@/utils/useAnimatedIcon';
import { ShieldAlertIcon, LockIcon, EyeIcon, EyeOffIcon } from '@/icons';
import { toast } from '@/utils/toast';
import { TwoFactorModal } from '@/components/admin/settings/security/TwoFactorModal';
import { get, post, patch } from '@/services/apiServices';
import { apiRoutes } from '@/services/apiRoutes';

const PasswordInput = ({ label, value, onChange, placeholder, show, onToggle, disabled }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
      {label} <span className="text-rose-500">*</span>
    </label>
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        disabled={disabled}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-2xs disabled:opacity-60"
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
      >
        {show ? <EyeOffIcon size={16} animateOnHover={false} /> : <EyeIcon size={16} animateOnHover={false} />}
      </button>
    </div>
  </div>
);

export const PasswordSecurityCard = ({ hideCurrentPassword, initialTwoFactor }) => {
  const location = useLocation();
  const shouldHideCurrentPassword =
    hideCurrentPassword !== undefined
      ? hideCurrentPassword
      : location.pathname.startsWith('/admin') || location.pathname.includes('/store/settings');

  const [shieldRef, shieldTrigger] = useAnimatedIcon();
  const [lockRef, lockTrigger] = useAnimatedIcon();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [twoFactor, setTwoFactor] = useState(Boolean(initialTwoFactor));
  const [isDisabling, setIsDisabling] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });

  useEffect(() => {
    if (initialTwoFactor !== undefined) {
      setTwoFactor(Boolean(initialTwoFactor));
    }
  }, [initialTwoFactor]);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await get(apiRoutes.auth.admin2faStatus);
        const data = res?.data || res;
        if (data?.enabled !== undefined) setTwoFactor(Boolean(data.enabled));
      } catch {
        // Silent fallback
      }
    };
    fetchStatus();
  }, []);

  const handleToggleTwoFactor = async () => {
    if (!twoFactor) {
      setIsModalOpen(true);
    } else {
      if (!window.confirm('Are you sure you want to disable Two-Factor Authentication?')) return;
      setIsDisabling(true);
      try {
        await post(apiRoutes.auth.admin2faDisable, {});
        setTwoFactor(false);
        toast.success('Two-Factor Authentication disabled');
      } catch (err) {
        toast.error(err?.message || 'Failed to disable Two-Factor Authentication');
      } finally {
        setIsDisabling(false);
      }
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!shouldHideCurrentPassword && !passwords.current) {
      return toast.error('Please enter your current password');
    }
    if (passwords.newPass.length < 8) return toast.error('New password must be at least 8 characters');
    if (passwords.newPass !== passwords.confirm) return toast.error('Passwords do not match');

    setIsUpdatingPassword(true);
    try {
      const payload = { newPassword: passwords.newPass };
      if (!shouldHideCurrentPassword && passwords.current) {
        payload.currentPassword = passwords.current;
      }
      const res = await patch(apiRoutes.auth.changePassword, payload);
      const newAccessToken = res?.data?.tokens?.accessToken || res?.tokens?.accessToken;
      if (newAccessToken) {
        localStorage.setItem('admin_access_token', newAccessToken);
        localStorage.setItem('accessToken', newAccessToken);
        localStorage.setItem('token', newAccessToken);
      }
      toast.success('Password updated successfully!');
      setPasswords({ current: '', newPass: '', confirm: '' });
    } catch {
      // Error notifications handled by apiServices
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div
      onMouseEnter={shieldTrigger.onMouseEnter}
      onMouseLeave={shieldTrigger.onMouseLeave}
      className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-xs space-y-6 flex flex-col justify-between"
    >
      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-200/60 text-orange-500 flex items-center justify-center shrink-0">
          <ShieldAlertIcon ref={shieldRef} size={20} animateOnHover={false} />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight">Password & Security</h2>
          <p className="text-xs text-slate-500 mt-0.5">Keep your account secure</p>
        </div>
      </div>

      <form onSubmit={handleUpdatePassword} className="space-y-3.5">
        {!shouldHideCurrentPassword && (
          <PasswordInput
            label="Current Password"
            value={passwords.current}
            onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))}
            placeholder="Enter current password"
            show={showCurrent}
            onToggle={() => setShowCurrent((p) => !p)}
          />
        )}
        <PasswordInput
          label="New Password"
          value={passwords.newPass}
          onChange={(e) => setPasswords((p) => ({ ...p, newPass: e.target.value }))}
          placeholder="Enter new password"
          show={showNew}
          onToggle={() => setShowNew((p) => !p)}
        />
        <PasswordInput
          label="Confirm New Password"
          value={passwords.confirm}
          onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
          placeholder="Confirm new password"
          show={showConfirm}
          onToggle={() => setShowConfirm((p) => !p)}
        />
        <button
          type="submit"
          disabled={isUpdatingPassword}
          className="w-full py-2.5 sm:py-3 bg-orange-500 hover:bg-orange-600 active:scale-98 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm shadow-orange-500/20 transition-all cursor-pointer mt-2 disabled:opacity-50"
        >
          {isUpdatingPassword ? 'Updating Password...' : 'Update Password'}
        </button>
      </form>

      <div
        onMouseEnter={lockTrigger.onMouseEnter}
        onMouseLeave={lockTrigger.onMouseLeave}
        className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
            <LockIcon ref={lockRef} size={16} animateOnHover={false} />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-semibold text-slate-800">Two-Factor Authentication</h4>
            <p className="text-[11px] text-slate-400 font-medium">
              {twoFactor ? 'Google Authenticator is connected and active' : 'Add an extra layer of security to your account'}
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={isDisabling}
          onClick={handleToggleTwoFactor}
          className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 disabled:opacity-50 ${
            twoFactor ? 'bg-orange-500' : 'bg-slate-200'
          }`}
        >
          <span
            className={`block w-5 h-5 bg-white rounded-full shadow-xs transition-transform absolute top-0.5 ${
              twoFactor ? 'left-5.5' : 'left-0.5'
            }`}
          />
        </button>
      </div>

      <TwoFactorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onComplete={() => setTwoFactor(true)}
      />
    </div>
  );
};

export default PasswordSecurityCard;
