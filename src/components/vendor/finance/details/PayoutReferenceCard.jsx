export const PayoutReferenceCard = ({ payout }) => {
  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Payout Reference
          </span>
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight mt-0.5">
            {payout?.id || 'PAY-3982'}
          </h3>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200/50">
          {payout?.status || 'Paid'}
        </span>
      </div>

      <div className="py-4">
        <span className="text-xs font-semibold text-slate-400">
          Amount Transferred
        </span>
        <p className="text-2xl sm:text-3xl font-semibold text-slate-900 mt-0.5">
          PKR {Number(payout?.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Date
          </span>
          <p className="text-xs sm:text-sm font-semibold text-slate-900 mt-1">
            {payout?.date || 'Sep 15, 2025'}
          </p>
        </div>

        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Payment Method
          </span>
          <p className="text-xs sm:text-sm font-semibold text-slate-900 mt-1">
            {payout?.method || 'Bank Transfer'}
          </p>
        </div>

        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Destination Bank
          </span>
          <p className="text-xs sm:text-sm font-semibold text-slate-900 mt-1">
            {payout?.bank || 'Allied Bank (****4242)'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PayoutReferenceCard;
