import { useState } from 'react';
import { toast } from '@/utils/toast';
import { EyeIcon, EyeOffIcon } from '@/icons';
import { patch } from '@/services/apiServices';
import { apiRoutes } from '@/services/apiRoutes';

export const ChangePasswordCard = () => {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.currentPassword || !form.newPassword) {
      toast.error('Please enter your current and new password');
      return;
    }
    if (form.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setIsUpdating(true);
    try {
      const res = await patch(apiRoutes.auth.changePassword, {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      const newAccessToken = res?.data?.tokens?.accessToken || res?.tokens?.accessToken;
      if (newAccessToken) {
        localStorage.setItem('admin_access_token', newAccessToken);
        localStorage.setItem('accessToken', newAccessToken);
        localStorage.setItem('token', newAccessToken);
      }
      toast.success('Password updated successfully! Other sessions will be signed out.');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch {
      // Handled by apiServices
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900">
            Change password
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Use a strong, unique password for this account.
          </p>
        </div>

        {/* Current Password */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Current password
          </label>
          <div className="relative">
            <input
              type={showCurrent ? 'text' : 'password'}
              value={form.currentPassword}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, currentPassword: e.target.value }))
              }
              placeholder="Enter current password"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 shadow-2xs pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              {showCurrent ? (
                <EyeOffIcon className="w-4 h-4" />
              ) : (
                <EyeIcon className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            New password
          </label>
          <div className="relative">
            <input
              type={showNew ? 'text' : 'password'}
              value={form.newPassword}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, newPassword: e.target.value }))
              }
              placeholder="Enter new password"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 shadow-2xs pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              {showNew ? (
                <EyeOffIcon className="w-4 h-4" />
              ) : (
                <EyeIcon className="w-4 h-4" />
              )}
            </button>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            At least 12 characters; combine letters, numbers and symbols.
          </p>
        </div>

        {/* Confirm New Password */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Confirm new password
          </label>
          <div className="relative">
            <input
              type={showConfirm ? 'text' : 'password'}
              value={form.confirmPassword}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
              }
              placeholder="Re-enter new password"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 shadow-2xs pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              {showConfirm ? (
                <EyeOffIcon className="w-4 h-4" />
              ) : (
                <EyeIcon className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 leading-relaxed">
          A security alert is sent after a password change. Other sessions will be signed out; your current session stays active.
        </p>

        {/* Submit Button */}
        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            type="submit"
            disabled={isUpdating}
            className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-semibold shadow-xs shadow-orange-500/25 active:scale-95 transition-all cursor-pointer"
          >
            {isUpdating ? 'Updating password...' : 'Update password'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChangePasswordCard;
