export const PayoutBreakdownCard = ({ breakdown = [], total = 1120.0 }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="p-4 sm:p-6 pb-2">
        <h3 className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight">
          Payout Breakdown
        </h3>
      </div>

      <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-slate-200/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/50">
              <th className="py-3 px-4 sm:px-6">DESCRIPTION</th>
              <th className="py-3 px-4 sm:px-6">ORDER ID</th>
              <th className="py-3 px-4 sm:px-6 text-right">AMOUNT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {breakdown.map((item, idx) => {
              const isPositive = item.amount > 0;
              const formattedAmount = `${isPositive ? '+' : '-'}PKR ${Math.abs(item.amount).toFixed(2)}`;

              return (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-800">
                    {item.description}
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-slate-500 font-mono text-xs">
                    {item.orderId}
                  </td>
                  <td
                    className={`py-3.5 px-4 sm:px-6 text-right font-semibold ${
                      isPositive ? 'text-emerald-600' : 'text-rose-500'
                    }`}
                  >
                    {formattedAmount}
                  </td>
                </tr>
              );
            })}

            <tr className="bg-slate-50/80 font-semibold">
              <td className="py-3.5 px-4 sm:px-6 text-slate-900">
                Total Transferred
              </td>
              <td className="py-3.5 px-4 sm:px-6 text-slate-400 font-mono text-xs">
                —
              </td>
              <td className="py-3.5 px-4 sm:px-6 text-right text-slate-900 font-semibold">
                PKR {Number(total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PayoutBreakdownCard;
