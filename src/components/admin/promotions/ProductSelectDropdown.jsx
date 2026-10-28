import { useState, useRef, useEffect, useMemo } from 'react';
import { PlusIcon, SearchIcon, CheckIcon } from '@/icons';
import { useAdminProducts, useDebounce } from '@/hooks';

export const ProductSelectDropdown = ({
  selectedProductIds = [],
  onToggleProduct,
  productsList = null,
  isLoading: propIsLoading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const dropdownRef = useRef(null);

  const { products: apiProducts, isLoading: hookIsLoading } = useAdminProducts({ pageSize: 100 });
  const isLoading = propIsLoading || (productsList === null && hookIsLoading);

  const catalog = useMemo(() => {
    if (productsList && Array.isArray(productsList)) return productsList;
    if (apiProducts && Array.isArray(apiProducts) && apiProducts.length > 0) {
      return apiProducts.map((p) => {
        const catName =
          typeof p.category === 'object' && p.category !== null
            ? p.category?.name || 'General'
            : p.category || 'General';

        const priceNum = Number(p.price ?? p.basePrice ?? 0);
        const formattedPrice = `PKR ${priceNum.toLocaleString(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        })}`;

        const imgUrl =
          (Array.isArray(p.images) &&
            (p.images.find((img) => img.isMain)?.url || p.images[0]?.url)) ||
          p.imageUrl ||
          p.image ||
          'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&auto=format&fit=crop&q=60';

        return {
          id: p.id,
          name: p.name,
          category: catName,
          price: formattedPrice,
          image: imgUrl,
        };
      });
    }
    return [];
  }, [apiProducts, productsList]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredProducts = useMemo(() => {
    if (!debouncedSearch.trim()) return catalog;
    const q = debouncedSearch.toLowerCase();
    return catalog.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
    );
  }, [catalog, debouncedSearch]);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Add Products Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 hover:bg-orange-100/80 border border-orange-200/80 rounded-xl text-xs font-semibold text-orange-600 transition-all cursor-pointer shadow-2xs"
      >
        <PlusIcon size={14} animateOnHover={false} />
        <span>Add Products</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 sm:w-80 max-w-[85vw] bg-white rounded-2xl shadow-xl border border-slate-200 z-50 p-3 space-y-2.5 animate-in fade-in zoom-in-95 duration-150">
          {/* Search Input */}
          <div className="relative">
            <SearchIcon
              size={14}
              animateOnHover={false}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search store products..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white"
              autoFocus
            />
          </div>

          {/* Products List */}
          <div className="max-h-56 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
            {isLoading ? (
              <div className="py-6 flex flex-col items-center justify-center gap-2 text-slate-400">
                <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs">Loading store products...</span>
              </div>
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map((product) => {
                const isSelected = selectedProductIds.includes(product.id);
                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => onToggleProduct(product.id)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-orange-50/70 border border-orange-200/70'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-8 h-8 rounded-lg object-cover shrink-0 border border-slate-200/60"
                      />
                      <div className="truncate">
                        <p className="text-xs font-semibold text-slate-800 truncate">
                          {product.name}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {product.category} · {product.price}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 pl-2">
                      {isSelected ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-orange-500 text-white shadow-2xs">
                          <CheckIcon size={12} />
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-slate-300 text-slate-400 hover:border-orange-500 hover:text-orange-500">
                          <PlusIcon size={12} animateOnHover={false} />
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            ) : (
              <p className="py-6 text-center text-xs text-slate-400">
                {search.trim() ? `No products match "${search}"` : 'No store products found'}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductSelectDropdown;
