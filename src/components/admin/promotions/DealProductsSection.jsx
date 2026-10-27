import { useMemo } from 'react';
import { XIcon } from '@/icons';
import { ProductSelectDropdown } from './ProductSelectDropdown';
import { AVAILABLE_PRODUCTS_CATALOG } from '@/mock/admin/promotions.mock';
import { useAdminProducts } from '@/hooks/useAdminProducts';

export const DealProductsSection = ({
  selectedProductIds = [],
  onToggleProduct,
  onRemoveProduct,
}) => {
  const { products: apiProducts, isLoading } = useAdminProducts({ pageSize: 100 });

  const catalog = useMemo(() => {
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
  }, [apiProducts]);

  const selectedProducts = useMemo(() => {
    return selectedProductIds.map((id) => {
      const found = catalog.find((p) => p.id === id);
      if (found) return found;
      // Fallback for pre-existing mock deals in initial state
      const mockFound = AVAILABLE_PRODUCTS_CATALOG.find((m) => m.id === id);
      if (mockFound) {
        return {
          id: mockFound.id,
          name: mockFound.name,
          category: mockFound.category,
          price: mockFound.price,
          image: mockFound.image,
        };
      }
      return {
        id,
        name: `Product (${id})`,
        category: 'General',
        price: 'PKR 0',
        image:
          'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&auto=format&fit=crop&q=60',
      };
    });
  }, [selectedProductIds, catalog]);

  return (
    <div className="pt-2 border-t border-slate-100">
      <div className="flex items-center justify-between mb-2">
        <div>
          <label className="block text-xs font-semibold text-slate-700">
            Products in this Deal
          </label>
          <span className="text-[11px] text-slate-400">
            {selectedProductIds.length} product{selectedProductIds.length === 1 ? '' : 's'} included
          </span>
        </div>

        {/* Add Products Dropdown Button */}
        <ProductSelectDropdown
          selectedProductIds={selectedProductIds}
          onToggleProduct={onToggleProduct}
          productsList={catalog}
          isLoading={isLoading}
        />
      </div>

      {/* Selected Products List with Remove action */}
      {selectedProducts.length > 0 ? (
        <div className="max-h-36 overflow-y-auto space-y-1.5 p-2 bg-slate-50/70 rounded-xl border border-slate-200/70">
          {selectedProducts.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200/60 shadow-2xs"
            >
              <div className="flex items-center gap-2 min-w-0">
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-7 h-7 rounded-md object-cover shrink-0"
                />
                <div className="truncate">
                  <span className="text-xs font-semibold text-slate-800 truncate block">
                    {p.name}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {p.category} · {p.price}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onRemoveProduct(p.id)}
                className="p-1 text-slate-400 hover:text-rose-500 rounded-md transition-colors cursor-pointer"
                title="Remove product from deal"
              >
                <XIcon size={14} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/50 text-[11px] text-amber-800 leading-relaxed">
          No products selected yet. Click <strong>Add Products</strong> above to open the dropdown and select items for this offer.
        </div>
      )}
    </div>
  );
};

export default DealProductsSection;
