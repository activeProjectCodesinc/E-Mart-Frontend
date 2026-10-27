export const PayoutBalanceCard = ({
  available = 'PKR 0.00',
  minimum = 'PKR 500.00',
  autoPayoutEnabled = true,
  autoPayoutFrequency = 'Monthly',
}) => {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-xs">
      <h3 className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight mb-4">
        Payout Balance
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 pt-1">
        <div>
          <span className="text-xs font-semibold text-slate-400">
            Available for Payout
          </span>
          <p className="text-xl sm:text-2xl font-semibold text-slate-900 mt-1">
            {available}
          </p>
        </div>

        <div>
          <span className="text-xs font-semibold text-slate-400">
            Minimum Payout Amount
          </span>
          <p className="text-xl sm:text-2xl font-semibold text-slate-900 mt-1">
            {minimum}
          </p>
          <span className="text-xs text-slate-300 font-semibold block mt-0.5">—</span>
        </div>

        <div>
          <span className="text-xs font-semibold text-slate-400">
            Auto Payout
          </span>
          <p className="text-xl sm:text-2xl font-semibold text-emerald-600 mt-1">
            {autoPayoutEnabled ? 'Enabled' : 'Disabled'}
          </p>
          <span className="text-xs text-slate-500 font-medium block mt-0.5">
            {autoPayoutFrequency}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PayoutBalanceCard;
