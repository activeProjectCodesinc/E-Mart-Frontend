export const PromotionsKPIs = ({ deals = [], kpis = null }) => {
  const totalDeals = kpis?.totalDeals ?? deals.length;
  const activeDeals =
    kpis?.activeDeals ?? deals.filter((d) => d.status === 'Active').length;
  const activeProducts =
    kpis?.activeProducts ??
    deals
      .filter((d) => d.status === 'Active')
      .reduce((sum, d) => sum + (d.activeProductsCount || d.productIds?.length || 0), 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Total Deals Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <span className="text-xs font-medium text-slate-500">Total deals</span>
        <div className="my-2">
          <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {totalDeals}
          </span>
        </div>
        <p className="text-xs text-slate-500">Across all three deal types</p>
      </div>

      {/* Active Deals Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <span className="text-xs font-medium text-slate-500">Active deals</span>
        <div className="my-2">
          <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {activeDeals}
          </span>
        </div>
        <p className="text-xs text-slate-500">Currently running in your store</p>
      </div>

      {/* Active Products Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <span className="text-xs font-medium text-slate-500">Active products</span>
        <div className="my-2">
          <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {activeProducts}
          </span>
        </div>
        <p className="text-xs text-slate-500">Across currently active deals</p>
      </div>
    </div>
  );
};

export default PromotionsKPIs;
