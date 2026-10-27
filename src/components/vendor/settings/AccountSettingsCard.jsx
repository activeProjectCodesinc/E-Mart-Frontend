import { useRef } from 'react';
import { useAnimatedIcon } from '@/utils/useAnimatedIcon';
import { UserIcon, ChevronDownIcon } from '@/icons';
import { useSettings } from '@/hooks/useSettings';

export const AccountSettingsCard = ({ data, onChange, onSave, isSaving = false }) => {
  const fileInputRef = useRef(null);
  const [userRef, userTrigger] = useAnimatedIcon();
  const { uploadAvatar, isUploadingAvatar } = useSettings();

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Fast local preview
    const reader = new FileReader();
    reader.onload = (event) => {
      onChange('avatar', event.target.result);
    };
    reader.readAsDataURL(file);

    // Upload to Cloudinary under emart folder via hook
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await uploadAvatar(formData);
      if (res?.data?.url) {
        onChange('avatar', res.data.url);
      }
    } catch {
      // Handled by hook
    }
  };

  return (
    <div
      onMouseEnter={userTrigger.onMouseEnter}
      onMouseLeave={userTrigger.onMouseLeave}
      className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-xs space-y-6 flex flex-col justify-between"
    >
      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-200/60 text-orange-500 flex items-center justify-center shrink-0">
          <UserIcon ref={userRef} size={20} animateOnHover={false} />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight">
            Account Settings
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Update your personal information and login details
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="flex flex-col items-center gap-2 shrink-0">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-orange-100 shadow-xs bg-slate-100 relative">
              {data.avatar ? (
                <img
                  src={data.avatar}
                  alt={data.fullName || 'Admin'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-400 to-amber-500 text-white font-bold text-xl">
                  {data.fullName?.charAt(0)?.toUpperCase() || 'A'}
                </div>
              )}
              {isUploadingAvatar && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-[10px] font-semibold">
                  Uploading...
                </div>
              )}
            </div>
            <button
              type="button"
              disabled={isUploadingAvatar}
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 border border-orange-300 text-orange-600 hover:bg-orange-50/70 font-semibold text-xs rounded-xl transition-all cursor-pointer shadow-2xs active:scale-95 disabled:opacity-50"
            >
              {isUploadingAvatar ? 'Uploading...' : 'Change Photo'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>

          <div className="flex-1 w-full space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={data.fullName || ''}
                onChange={(e) => onChange('fullName', e.target.value)}
                placeholder="Ali Khan"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={data.email || ''}
                disabled
                title="Email is your login identifier"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-500 cursor-not-allowed shadow-2xs"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Phone Number <span className="text-rose-500">*</span>
          </label>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 shrink-0">
              <span>🇵🇰</span>
              <span>{data.countryCode || '+92'}</span>
              <ChevronDownIcon size={14} animateOnHover={false} className="text-slate-400" />
            </div>
            <input
              type="tel"
              required
              value={data.phone ? String(data.phone).replace(/^\+92/, '') : ''}
              onChange={(e) => onChange('phone', e.target.value.replace(/^\+92/, ''))}
              placeholder="3001234567"
              className="flex-1 w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-2xs"
            />
          </div>
        </div>

        {onSave && (
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              disabled={isSaving || isUploadingAvatar}
              onClick={onSave}
              className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountSettingsCard;
