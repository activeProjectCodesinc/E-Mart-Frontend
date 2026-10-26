import ProductStatusDropdown from './ProductStatusDropdown';
import ProductActionButtons from './ProductActionButtons';

export const ProductsTable = ({
  products = [],
  selectedIds = [],
  onToggleSelect,
  onToggleSelectAll,
  onOpenStatusModal,
  onEditProduct,
  onDeleteProduct,
}) => {
  const isAllSelected = products.length > 0 && selectedIds.length === products.length;

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
      <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] sm:text-xs font-bold text-slate-500 tracking-wider">
              <th className="py-3 px-3.5 sm:px-4 w-10">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={onToggleSelectAll}
                  className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 border-slate-300 accent-orange-600 cursor-pointer"
                />
              </th>
              <th className="py-3 px-3 sm:px-4">Product</th>
              <th className="py-3 px-3 sm:px-4">Category</th>
              <th className="py-3 px-3 sm:px-4">Price</th>
              <th className="py-3 px-3 sm:px-4">Stock</th>
              <th className="py-3 px-3 sm:px-4">Status</th>
              <th className="py-3 px-3 sm:px-4 text-right">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
            {products.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  No products found matching your filter criteria.
                </td>
              </tr>
            ) : (
              products.map((product) => {
                const isSelected = selectedIds.includes(product.id);
                const isOutOfStock = product.stock === 0;

                return (
                  <tr
                    key={product.id}
                    className="hover:bg-slate-50/60 transition-colors group"
                  >
                    <td className="py-3.5 px-3.5 sm:px-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect(product.id)}
                        className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 border-slate-300 accent-orange-600 cursor-pointer"
                      />
                    </td>

                    <td className="py-3.5 px-3 sm:px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image || product.imageUrl || 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=100'}
                          alt={product.name}
                          className="w-10 h-10 rounded-xl object-cover bg-slate-100 border border-slate-200/80 shrink-0"
                        />
                        <span className="font-bold text-slate-800 group-hover:text-orange-600 transition-colors line-clamp-1">
                          {product.name}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 sm:px-4 text-slate-500 font-medium">
                      {typeof product.category === 'object' ? product.category?.name : (product.category || 'General')}
                    </td>

                    <td className="py-3.5 px-3 sm:px-4 font-bold text-slate-900">
                      PKR {Number(product.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>

                    <td className="py-3.5 px-3 sm:px-4">
                      <span
                        className={`font-bold ${
                          isOutOfStock ? 'text-rose-500' : 'text-slate-700'
                        }`}
                      >
                        {product.stock}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 sm:px-4">
                      <ProductStatusDropdown
                        status={product.status}
                        onClick={() => onOpenStatusModal(product)}
                      />
                    </td>

                    <td className="py-3.5 px-3 sm:px-4 text-right">
                      <ProductActionButtons
                        product={product}
                        onEdit={onEditProduct}
                        onDelete={onDeleteProduct}
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

export default ProductsTable;
