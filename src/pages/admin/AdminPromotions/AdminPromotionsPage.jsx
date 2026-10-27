import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PlusIcon } from '@/icons';
import { PROMOTION_TABS } from '@/mock/admin/promotions.mock';
import { DealsTabContent } from '@/components/admin/promotions/DealsTabContent';
import { CouponsTabContent } from '@/components/admin/promotions/coupons/CouponsTabContent';
import { BannerTabContent } from '@/components/admin/promotions/BannerTabContent';

export const AdminPromotionsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Determine initial tab from query param if available, defaulting to 'Banner' if tab=banner, else 'Coupons'
  const paramTab = searchParams.get('tab');
  const matchedTab = paramTab
    ? PROMOTION_TABS.find(
        (t) => t.toLowerCase() === paramTab.trim().toLowerCase()
      )
    : null;

  const [activeTab, setActiveTab] = useState(matchedTab || 'Banner');
  const [isCreateBannerOpen, setIsCreateBannerOpen] = useState(false);

  useEffect(() => {
    if (matchedTab && matchedTab !== activeTab) {
      setActiveTab(matchedTab);
    }
  }, [matchedTab]);

  const handleSelectTab = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab: tab.toLowerCase() });
  };

  const isBannerTab = activeTab === 'Banner';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {isBannerTab ? 'Banner' : 'Promotions'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {isBannerTab
              ? 'Manage images, messages and calls to action for your storefront.'
              : 'Manage store offers, coupon codes and category discounts in one place.'}
          </p>
        </div>

        {/* Top-right button for Banner tab matching Screenshot 1 */}
        {isBannerTab && (
          <button
            type="button"
            onClick={() => setIsCreateBannerOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold shadow-xs shadow-orange-500/25 active:scale-95 transition-all cursor-pointer self-start sm:self-auto"
          >
            <PlusIcon size={16} animateOnHover={false} />
            <span>Add New Banner</span>
          </button>
        )}
      </div>

      {/* Top Tabs: Deals, Coupons, Banner */}
      <div className="flex items-center gap-2">
        {PROMOTION_TABS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => handleSelectTab(tab)}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-orange-500 text-white shadow-xs shadow-orange-500/25'
                  : 'bg-amber-50/70 hover:bg-amber-100/70 text-slate-700'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      {activeTab === 'Banner' && (
        <BannerTabContent
          isCreateModalOpen={isCreateBannerOpen}
          setIsCreateModalOpen={setIsCreateBannerOpen}
        />
      )}
      {activeTab === 'Coupons' && <CouponsTabContent />}
      {activeTab === 'Deals' && <DealsTabContent />}
    </div>
  );
};

export default AdminPromotionsPage;
