import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BellIcon, MenuIcon, ChevronDownIcon, SettingsIcon, LockIcon } from '@/icons';
import { toast } from '@/utils/toast';
import { post } from '@/services/apiServices';
import { useSettings } from '@/hooks/useSettings';
import { getRefreshToken, clearAllAuth } from '@/services/tokenService';

export const AdminHeader = ({ onOpenSidebar }) => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef(null);
  const { profile } = useSettings();

  const adminUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('adminUser')) || {};
    } catch {
      return {};
    }
  })();

  const currentUser = profile?.user || profile || adminUser;
  const adminName = currentUser.fullName || currentUser.firstName || adminUser.fullName || adminUser.firstName || 'Admin';
  const adminEmail = currentUser.email || adminUser.email || 'admin@emart.com';
  const adminAvatar =
    currentUser.avatar ||
    currentUser.avatarUrl ||
    currentUser.profileImage ||
    adminUser.avatar ||
    adminUser.avatarUrl ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&fit=crop&q=80';

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const refreshToken = getRefreshToken();
      await post('/auth/logout', refreshToken ? { refreshToken } : {}).catch(() => {});
    } finally {
      clearAllAuth();
      setIsLoggingOut(false);
      setIsDropdownOpen(false);
      toast.success('Logged out successfully');
      navigate('/admin/login');
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#faf8f5]/90 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between border-b border-orange-100/60">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="p-2 rounded-xl text-slate-600 hover:bg-orange-50 hover:text-orange-600 transition-colors lg:hidden cursor-pointer"
        >
          <MenuIcon size={20} />
        </button>
      </div>

      <div className="flex items-center gap-4 sm:gap-6 ml-auto">
        {/* Notification Bell */}
        <button
          type="button"
          className="relative p-2 rounded-xl bg-white border border-slate-200/80 text-slate-600 hover:text-orange-600 hover:border-orange-200 shadow-2xs transition-all cursor-pointer"
        >
          <BellIcon size={18} />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
            4
          </span>
        </button>

        {/* Admin Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen((p) => !p)}
            className="flex items-center gap-3 pl-3 border-l border-slate-200 hover:opacity-85 transition-opacity cursor-pointer text-left"
          >
            <img
              src={adminAvatar}
              alt={adminName}
              className="w-9 h-9 rounded-full object-cover border border-orange-200 shadow-2xs"
              onError={(e) => {
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  adminName
                )}&background=f97316&color=fff`;
              }}
            />
            <div className="hidden sm:block">
              <span className="text-xs font-semibold text-slate-900 block leading-tight">{adminName}</span>
              <span className="text-[10px] text-slate-400 font-medium block">Super Admin</span>
            </div>
            <ChevronDownIcon
              size={14}
              className={`text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2.5 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900 truncate">{adminName}</p>
                <p className="text-[11px] text-slate-400 truncate">{adminEmail}</p>
                <span className="inline-flex mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-50 text-orange-600 border border-orange-200/60">
                  Super Admin
                </span>
              </div>

              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    navigate('/admin/settings');
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-orange-50/50 hover:text-orange-600 transition-colors cursor-pointer"
                >
                  <SettingsIcon size={15} />
                  <span>Account Settings</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    navigate('/admin/store/settings');
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-orange-50/50 hover:text-orange-600 transition-colors cursor-pointer"
                >
                  <LockIcon size={15} />
                  <span>Password & Security (2FA)</span>
                </button>
              </div>

              <div className="pt-1 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isLoggingOut}
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-4 h-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
