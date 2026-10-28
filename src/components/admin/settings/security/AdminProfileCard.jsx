import { useState, useEffect } from 'react';
import { toast } from '@/utils/toast';
import { LockIcon } from '@/icons';
import { INITIAL_ADMIN_PROFILE } from '@/mock/admin/adminSettings.mock';
import { useSettings } from '@/hooks/useSettings';

export const AdminProfileCard = () => {
  const { profile: serverProfile, updateProfile, isUpdatingProfile } = useSettings();
  const [profile, setProfile] = useState(INITIAL_ADMIN_PROFILE);
  const [savedProfile, setSavedProfile] = useState(INITIAL_ADMIN_PROFILE);

  useEffect(() => {
    if (serverProfile) {
      const user = serverProfile.user || serverProfile;
      const initial = {
        displayName: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || INITIAL_ADMIN_PROFILE.displayName,
        email: user.email || INITIAL_ADMIN_PROFILE.email,
        phoneNumber: user.phone || INITIAL_ADMIN_PROFILE.phoneNumber,
        role: user.userType === 'admin' ? 'Super Administrator' : (user.userType || INITIAL_ADMIN_PROFILE.role),
      };

      setProfile((prev) => {
        if (
          prev.displayName === initial.displayName &&
          prev.email === initial.email &&
          prev.phoneNumber === initial.phoneNumber &&
          prev.role === initial.role
        ) {
          return prev;
        }
        return initial;
      });

      setSavedProfile((prev) => {
        if (
          prev.displayName === initial.displayName &&
          prev.email === initial.email &&
          prev.phoneNumber === initial.phoneNumber &&
          prev.role === initial.role
        ) {
          return prev;
        }
        return initial;
      });
    }
  }, [serverProfile]);

  const handleChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleCancel = () => {
    setProfile(savedProfile);
    toast.info('Profile changes discarded');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({
        fullName: profile.displayName,
        phone: profile.phoneNumber,
      });
      setSavedProfile(profile);
    } catch {
      // Error notifications handled by hook
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900">
            Admin profile
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Personal details for your Emart administrator account.
          </p>
        </div>

        {/* Display name & Phone number */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Display name
            </label>
            <input
              type="text"
              value={profile.displayName}
              onChange={(e) => handleChange('displayName', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 shadow-2xs"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Phone number
            </label>
            <input
              type="text"
              value={profile.phoneNumber}
              onChange={(e) => handleChange('phoneNumber', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 shadow-2xs"
            />
          </div>
        </div>

        {/* Email address */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Email address
          </label>
          <input
            type="email"
            value={profile.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 shadow-2xs"
            required
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Changing your sign-in email requires verification.
          </p>
        </div>

        {/* System role info */}
        <div className="flex items-center gap-2 pt-1 text-xs text-slate-500">
          <LockIcon size={14} className="text-slate-400 shrink-0" animateOnHover={false} />
          <span>{profile.role}</span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isUpdatingProfile}
            className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold shadow-xs shadow-orange-500/25 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            {isUpdatingProfile ? 'Saving...' : 'Save profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminProfileCard;
