import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logoImg from '@/assets/images/logo.png';
import { BoxesIcon, ChevronDownIcon, XIcon } from '@/icons';
import { ADMIN_NAV_ITEMS, ADMIN_STORE_MENU_ITEMS } from '@/mock/admin/adminNav.mock';
import { useAnimatedIcon } from '@/utils/useAnimatedIcon';
import AdminNavItem from './AdminNavItem';
import AdminStoreMenuItem from './AdminStoreMenuItem';

export const AdminSidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const isStoreRoute = location.pathname.startsWith('/admin/store');
  const [isStoreMenuOpen, setIsStoreMenuOpen] = useState(true);
  const [storeIconRef, storeTrigger] = useAnimatedIcon();

  useEffect(() => {
    setIsStoreMenuOpen(true);
  }, [isStoreRoute]);

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#fbf9f6] border-r border-orange-100/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-orange-100/50">
          <Link to="/admin/store/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10">
              <img src={logoImg} alt="E-Mart" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="text-base font-semibold text-slate-900 tracking-tight block">E-Mart</span>
              <span className="text-[10px] text-slate-400 font-medium block -mt-1">Admin Console</span>
            </div>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 lg:hidden cursor-pointer"
          >
            <XIcon size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-3.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {/* My Store Dropdown */}
          <div className="bg-white/80 rounded-2xl border border-orange-100/70 p-1.5 shadow-2xs">
            <button
              type="button"
              onClick={() => setIsStoreMenuOpen(!isStoreMenuOpen)}
              onMouseEnter={storeTrigger.onMouseEnter}
              onMouseLeave={storeTrigger.onMouseLeave}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-700 hover:text-orange-600 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <BoxesIcon
                  ref={storeIconRef}
                  size={15}
                  animateOnHover={false}
                  className="text-orange-500 group-hover:text-orange-600 transition-colors"
                />
                <span>My Store</span>
              </div>
              <ChevronDownIcon
                size={14}
                className={`text-slate-400 transition-transform ${isStoreMenuOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isStoreMenuOpen && (
              <div className="pt-1.5 space-y-0.5 border-t border-slate-100 mt-1">
                {ADMIN_STORE_MENU_ITEMS.map((item) => (
                  <AdminStoreMenuItem
                    key={item.id}
                    item={item}
                    onClose={onClose}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Main Admin Navigation */}
          <nav className="space-y-1">
            {ADMIN_NAV_ITEMS.map((item) => {
              const isActive =
                item.path === '/admin/dashboard'
                  ? location.pathname === '/admin/dashboard' || location.pathname === '/admin'
                  : location.pathname.startsWith(item.path);

              return (
                <AdminNavItem
                  key={item.id}
                  item={item}
                  isActive={isActive}
                  onClose={onClose}
                />
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
