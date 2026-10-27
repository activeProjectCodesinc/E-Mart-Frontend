import InventoryActionButtons from './InventoryActionButtons';

const STATUS_BADGES = {
  'In Stock': 'bg-[#eaf8ef] text-[#16a34a] border-[#bbf7d0]',
  'Low Stock': 'bg-[#fff4eb] text-[#ea580c] border-[#fdba74]',
  'Out of Stock': 'bg-[#fef2f2] text-[#ef4444] border-[#fecaca]',
};

const renderText = (value, fallback = '') => {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (typeof value === 'object') return value.name || value.symbol || value.title || value.code || fallback;
  return fallback;
};

export const InventoryTable = ({
  items = [],
  selectedIds = [],
  onToggleSelect,
  onToggleSelectAll,
  onAddStock,
  onEditProduct,
}) => {
  const isAllSelected = items.length > 0 && selectedIds.length === items.length;

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
      <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] sm:text-xs font-bold text-slate-500 tracking-wider">
              <th className="py-3.5 px-3.5 sm:px-4 w-10">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={onToggleSelectAll}
                  className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 border-slate-300 accent-orange-600 cursor-pointer"
                />
              </th>
              <th className="py-3.5 px-3 sm:px-4">Product</th>
              <th className="py-3.5 px-3 sm:px-4">Current Stock</th>
              <th className="py-3.5 px-3 sm:px-4">Status</th>
              <th className="py-3.5 px-3 sm:px-4 text-right">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400">
                  No inventory items match your search or filter criteria.
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                const statusStr = renderText(item.status, 'In Stock');
                const badgeStyle = STATUS_BADGES[statusStr] || STATUS_BADGES['In Stock'];

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/60 transition-colors group"
                  >
                    <td className="py-3.5 px-3.5 sm:px-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect(item.id)}
                        className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 border-slate-300 accent-orange-600 cursor-pointer"
                      />
                    </td>

                    <td className="py-3.5 px-3 sm:px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={renderText(item.name, 'Product')}
                          className="w-10 h-10 rounded-xl object-cover bg-slate-100 border border-slate-200/80 shrink-0"
                        />
                        <div>
                          <h4 className="font-semibold text-slate-800 group-hover:text-orange-600 transition-colors">
                            {renderText(item.name, 'Product')}
                          </h4>
                          <span className="text-[11px] text-slate-400">
                            {renderText(item.unit, '1 unit')}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 sm:px-4">
                      <span
                        className={`font-black ${
                          Number(item.stock ?? 0) === 0
                            ? 'text-rose-600'
                            : Number(item.stock ?? 0) <= Number(item.lowStockAlert ?? 10)
                            ? 'text-orange-600'
                            : 'text-slate-700'
                        }`}
                      >
                        {renderText(item.stock, 0)}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 sm:px-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${badgeStyle}`}
                      >
                        {statusStr}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 sm:px-4 text-right">
                      <InventoryActionButtons
                        product={item}
                        onAddStock={onAddStock}
                        onEditProduct={onEditProduct}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryTable;
