import { HistoryIcon } from '@/icons';

const TYPE_PILLS = {
  'Stock In': 'bg-emerald-50 text-emerald-600 border border-emerald-200',
  'Stock Adjustment': 'bg-blue-50 text-blue-600 border border-blue-200',
  'Stock Out': 'bg-rose-50 text-rose-600 border border-rose-200',
};

export const StockHistoryTable = ({ history = [], isLoading = false }) => {
  return (
    <div className="space-y-3 pt-2 border-t border-slate-100">
      <div className="flex items-center gap-2">
        <HistoryIcon size={16} className="text-orange-600" />
        <div>
          <h4 className="text-xs sm:text-sm font-semibold text-slate-900">
            Stock History
          </h4>
          <p className="text-[11px] text-slate-400">
            View all stock in/out transactions for this product
          </p>
        </div>
      </div>

      <div className="border border-slate-200/80 rounded-xl overflow-hidden">
        <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-2.5 px-3">Date & Time</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Quantity</th>
                <th className="py-2.5 px-3">Previous Stock</th>
                <th className="py-2.5 px-3">New Stock</th>
                <th className="py-2.5 px-3">Notes</th>
                <th className="py-2.5 px-3">Added By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {isLoading ? (
                [1, 2, 3].map((n) => (
                  <tr key={n} className="animate-pulse">
                    <td className="py-3 px-3"><div className="h-3 w-28 bg-slate-200 rounded" /></td>
                    <td className="py-3 px-3"><div className="h-4 w-16 bg-slate-200 rounded-full" /></td>
                    <td className="py-3 px-3"><div className="h-3 w-12 bg-slate-200 rounded" /></td>
                    <td className="py-3 px-3"><div className="h-3 w-12 bg-slate-200 rounded" /></td>
                    <td className="py-3 px-3"><div className="h-3 w-12 bg-slate-200 rounded" /></td>
                    <td className="py-3 px-3"><div className="h-3 w-24 bg-slate-200 rounded" /></td>
                    <td className="py-3 px-3"><div className="h-3 w-10 bg-slate-200 rounded" /></td>
                  </tr>
                ))
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                    No stock movements recorded yet.
                  </td>
                </tr>
              ) : (
                history.map((row) => {
                  const isPositive =
                    typeof row.quantity === 'string'
                      ? row.quantity.startsWith('+')
                      : Number(row.quantity) > 0;
                  return (
                    <tr key={row.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">{row.date}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${TYPE_PILLS[row.type] || TYPE_PILLS['Stock In']}`}>
                          {row.type}
                        </span>
                      </td>
                      <td className={`py-2.5 px-3 font-bold whitespace-nowrap ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {row.quantity}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{row.prevStock}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-800">{row.newStock}</td>
                      <td className="py-2.5 px-3 text-slate-500 max-w-[150px] truncate" title={row.notes}>
                        {row.notes}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{row.addedBy}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StockHistoryTable;
