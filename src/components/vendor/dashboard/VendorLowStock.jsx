import { Link } from 'react-router-dom';
import { usePortalBase } from '@/utils/usePortalBase';

export const VendorLowStock = ({ products = [] }) => {
  const { getRoute } = usePortalBase();

  return (
    <div className="p-3.5 sm:p-5 bg-white rounded-2xl border border-slate-100 shadow-xs h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-sm sm:text-base font-semibold text-slate-900 tracking-tight">
          Low Stock Products
        </h3>
        <Link
          to={getRoute('/inventory')}
          className="text-xs font-semibold text-orange-600 hover:text-orange-700 transition-colors"
        >
          View All
        </Link>
      </div>

      <div className="space-y-2 sm:space-y-3">
        {products.length === 0 ? (
          <div className="py-6 text-center text-emerald-600/80 text-xs font-medium">
            ✓ All products are well-stocked
          </div>
        ) : (
          products.map((item) => {
          const isOut = item.status === 'Out of Stock';

          return (
            <div
              key={item.id}
              className="flex items-center justify-between p-1.5 sm:p-2 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 pr-2">
                <img
                  src={item.img}
                  alt={item.name}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover border border-slate-100 shadow-2xs group-hover:scale-105 transition-transform shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="text-xs font-semibold text-slate-800 group-hover:text-orange-600 transition-colors truncate">
                    {item.name}
                  </h4>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">{item.stock}</p>
                </div>
              </div>

              <span
                className={`text-[9px] sm:text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                  isOut
                    ? 'bg-rose-50 text-rose-500 border border-rose-200/50'
                    : 'bg-amber-50 text-amber-600 border border-amber-200/50'
                }`}
              >
                {item.status}
              </span>
            </div>
          );
        })
      )}
      </div>
    </div>
  );
};

export default VendorLowStock;
