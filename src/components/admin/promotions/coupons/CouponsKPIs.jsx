export const CouponsKPIs = ({ coupons = [], kpis = null }) => {
  const totalCoupons = kpis?.totalCoupons ?? coupons.length;
  const activeCoupons =
    kpis?.activeCoupons ?? coupons.filter((c) => c.status === 'Active').length;
  const totalUsage =
    kpis?.totalUsage ?? coupons.reduce((sum, c) => sum + (Number(c.totalUsed) || 0), 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Total Coupons Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <span className="text-xs font-medium text-slate-500">Total coupons</span>
        <div className="my-2">
          <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {totalCoupons}
          </span>
        </div>
        <p className="text-xs text-slate-500">Across all coupon types</p>
      </div>

      {/* Active Coupons Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <span className="text-xs font-medium text-slate-500">Active coupons</span>
        <div className="my-2">
          <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {activeCoupons}
          </span>
        </div>
        <p className="text-xs text-slate-500">Available at checkout</p>
      </div>

      {/* Total Usage Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <span className="text-xs font-medium text-slate-500">Total usage</span>
        <div className="my-2">
          <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {totalUsage}
          </span>
        </div>
        <p className="text-xs text-slate-500">Successful redemptions</p>
      </div>
    </div>
  );
};

export default CouponsKPIs;
