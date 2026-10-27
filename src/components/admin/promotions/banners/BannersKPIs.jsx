export const BannersKPIs = ({ banners = [], kpis = null }) => {
  const totalBanners = kpis?.totalBanners ?? banners.length;
  const activeBanners =
    kpis?.activeBanners ?? banners.filter((b) => b.status === 'Active').length;

  const homepageCount = banners.filter((b) => b.placement === 'Homepage').length;
  const categoryCount = banners.filter(
    (b) => b.placement === 'Category Page'
  ).length;

  const placementsCount = (homepageCount > 0 ? 1 : 0) + (categoryCount > 0 ? 1 : 0);

  const getPlacementsSubtext = () => {
    if (kpis?.placementCountSummary) return kpis.placementCountSummary;
    if (homepageCount > 0 && categoryCount > 0) {
      const hText = homepageCount === 1 ? 'One homepage' : `${homepageCount} homepages`;
      const cText = categoryCount === 1 ? 'one category' : `${categoryCount} categories`;
      return `${hText} · ${cText}`;
    }
    if (homepageCount > 0) return `${homepageCount} homepage placement(s)`;
    if (categoryCount > 0) return `${categoryCount} category placement(s)`;
    return 'No active placements';
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Total Banners Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <span className="text-xs font-medium text-slate-500">Total banners</span>
        <div className="my-2">
          <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {totalBanners}
          </span>
        </div>
        <p className="text-xs text-slate-500">
          {kpis?.placementsSummary || 'Homepage and Category Page'}
        </p>
      </div>

      {/* Active Banners Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <span className="text-xs font-medium text-slate-500">Active banners</span>
        <div className="my-2">
          <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {activeBanners}
          </span>
        </div>
        <p className="text-xs text-slate-500">
          {kpis?.activeSummary || 'Currently visible in your store'}
        </p>
      </div>

      {/* Banner Placements Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <span className="text-xs font-medium text-slate-500">Banner placements</span>
        <div className="my-2">
          <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {kpis?.bannerPlacements ?? (placementsCount || totalBanners)}
          </span>
        </div>
        <p className="text-xs text-slate-500">{getPlacementsSubtext()}</p>
      </div>
    </div>
  );
};

export default BannersKPIs;
