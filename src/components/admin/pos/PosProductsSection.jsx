import { SearchIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from '@/icons';
import PosProductCard from './PosProductCard';

export const PosProductsSection = ({
  products = [],
  categories = [],
  selectedCategoryId = '',
  onCategoryChange,
  search = '',
  onSearchChange,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  onAddToCart,
  isLoading = false,
}) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-6 shadow-xs flex flex-col justify-between min-h-[720px]">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm sm:text-base font-bold text-slate-900">
            Store Products
          </h2>
          {isLoading && (
            <span className="text-[11px] font-semibold text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full animate-pulse">
              Loading products...
            </span>
          )}
        </div>

        {/* Filter Bar: Categories Dropdown & Live Search */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mb-5">
          <div className="sm:col-span-5 relative">
            <select
              value={selectedCategoryId}
              onChange={(e) => {
                onCategoryChange(e.target.value);
                onPageChange(1);
              }}
              className="w-full appearance-none px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-200/90 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all cursor-pointer text-slate-700 font-semibold pr-9"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => {
                const id = cat.id || cat;
                const name = cat.name || cat;
                return (
                  <option key={id} value={id}>
                    {name}
                  </option>
                );
              })}
            </select>
            <ChevronDownIcon
              size={14}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>

          <div className="sm:col-span-7 relative">
            <SearchIcon
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                onSearchChange(e.target.value);
                onPageChange(1);
              }}
              placeholder="Search by product name or SKU..."
              className="w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-200/90 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-slate-800 placeholder:text-slate-400 font-medium"
            />
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-3.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 animate-pulse h-56 flex flex-col justify-between"
              >
                <div className="w-full aspect-4/3 bg-slate-200 rounded-xl mb-2" />
                <div className="space-y-1.5">
                  <div className="w-3/4 h-3 bg-slate-200 rounded" />
                  <div className="w-1/2 h-2 bg-slate-200 rounded" />
                </div>
                <div className="w-full h-6 bg-slate-200 rounded mt-2" />
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-3.5">
            {products.map((product) => (
              <PosProductCard
                key={product.id || product.variantId}
                product={product}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center text-slate-400 text-xs flex flex-col items-center justify-center">
            <span className="text-3xl mb-2">🔍</span>
            <p className="font-semibold text-slate-600">No products found</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Try adjusting your search query or selecting a different category.
            </p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-1.5 pt-5 mt-4 border-t border-slate-100">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            <ChevronLeftIcon size={14} />
          </button>

          {Array.from({ length: totalPages }).map((_, idx) => {
            const pageNum = idx + 1;
            const isActive = pageNum === currentPage;
            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => onPageChange(pageNum)}
                className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#f95900] text-white shadow-2xs shadow-orange-500/20'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            <ChevronRightIcon size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export default PosProductsSection;
