export const VendorTopProducts = ({ products = [] }) => {
  return (
    <div className="p-3.5 sm:p-5 bg-white rounded-2xl border border-slate-100 shadow-xs h-full flex flex-col justify-between">
      <div className="mb-3 sm:mb-4">
        <h3 className="text-sm sm:text-base font-semibold text-slate-900 tracking-tight">
          Top Selling Products
        </h3>
      </div>

      <div className="space-y-2 sm:space-y-3">
        {products.length === 0 ? (
          <div className="py-6 text-center text-slate-400 text-xs font-medium">
            No top selling products yet
          </div>
        ) : (
          products.map((item) => (
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
                <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">{item.sales}</p>
              </div>
            </div>

            <span className="text-xs font-semibold text-slate-900 shrink-0">{item.price}</span>
          </div>
        ))
      )}
      </div>
    </div>
  );
};

export default VendorTopProducts;
