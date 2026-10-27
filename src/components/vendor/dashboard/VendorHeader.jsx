import { useNavigate } from 'react-router-dom';
import { BellIcon, MenuIcon } from '@/icons';
import { useAnimatedIcon } from '@/utils/useAnimatedIcon';
import { useSettings } from '@/hooks/useSettings';
import { usePortalBase } from '@/utils/usePortalBase';

export const VendorHeader = ({ onOpenSidebar, storeName = 'Fresh Mart', userName = 'User Name' }) => {
  const navigate = useNavigate();
  const { getRoute } = usePortalBase();
  const [bellRef, bellTrigger] = useAnimatedIcon();
  const { profile } = useSettings();

  const userAvatar = profile?.avatar || profile?.avatarUrl || profile?.profileImage;
  const displayName = profile?.fullName || profile?.firstName || userName;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-3 sm:px-8 py-2.5 sm:py-4 bg-white/95 backdrop-blur-md border-b border-slate-100">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={onOpenSidebar}
          type="button"
          className="p-1.5 -ml-1 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors lg:hidden shrink-0"
          aria-label="Open sidebar"
        >
          <MenuIcon size={20} />
        </button>

        <div className="min-w-0">
          <h1 className="text-xs xs:text-sm sm:text-2xl font-semibold text-slate-900 tracking-tight flex items-center gap-1">
            <span>Good Morning!</span>
            <span className="hidden sm:inline">{displayName}</span>
            <span className="inline-block animate-pulse shrink-0">👋</span>
          </h1>
          <p className="text-[10px] sm:text-sm text-slate-500 mt-0.5 leading-tight">
            <span className="sm:hidden">Store overview & updates</span>
            <span className="hidden sm:inline">Here's what's happening with your store today.</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-4 shrink-0 pl-1.5">
        <button
          type="button"
          onClick={() => navigate(getRoute('/notifications'))}
          onMouseEnter={bellTrigger.onMouseEnter}
          onMouseLeave={bellTrigger.onMouseLeave}
          className="relative p-1.5 sm:p-2.5 rounded-full bg-white border border-slate-200/80 shadow-xs hover:border-orange-200 hover:bg-orange-50/40 text-slate-600 hover:text-orange-600 transition-all cursor-pointer"
          aria-label="Notifications"
        >
          <BellIcon ref={bellRef} size={17} />
          <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 w-2 h-2 bg-orange-500 rounded-full ring-2 ring-white" />
        </button>

        <div className="flex items-center gap-2 p-1 sm:pl-1.5 sm:pr-3 sm:py-1.5 rounded-full bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all cursor-pointer">
          {userAvatar ? (
            <img
              src={userAvatar}
              alt={storeName}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-1 ring-orange-200"
            />
          ) : (
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 text-white font-bold text-xs flex items-center justify-center ring-1 ring-orange-200">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="hidden sm:block text-left leading-none">
            <p className="text-xs font-semibold text-slate-800">{storeName}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Seller</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default VendorHeader;
