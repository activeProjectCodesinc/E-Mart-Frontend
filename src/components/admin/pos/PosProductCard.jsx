import { PlusIcon } from '@/icons';

export const PosProductCard = ({ product, onAddToCart }) => {
  const isOutOfStock =
    product.inStock !== undefined
      ? !product.inStock
      : product.stock !== undefined
      ? Number(product.stock) <= 0
      : false;

  const imageUrl =
    product.image ||
    product.imageUrl ||
    (Array.isArray(product.images) && (product.images[0]?.url || product.images[0])) ||
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=240&auto=format&fit=crop&q=80';

  return (
    <div
      className={`bg-white rounded-2xl border p-3 flex flex-col justify-between transition-all group ${
        isOutOfStock
          ? 'border-slate-200/80 opacity-75'
          : 'border-slate-200/90 hover:border-orange-300 hover:shadow-md cursor-pointer'
      }`}
      onClick={() => !isOutOfStock && onAddToCart(product)}
    >
      <div>
        <div className="relative w-full aspect-4/3 rounded-xl overflow-hidden bg-slate-50 mb-2.5">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />

          {isOutOfStock ? (
            <span className="absolute top-2 left-2 px-2 py-0.5 bg-slate-100/90 backdrop-blur-xs text-slate-500 border border-slate-200 text-[10px] font-semibold rounded-md shadow-2xs">
              Out of Stock
            </span>
          ) : product.discount ? (
            <span className="absolute top-2 left-2 px-2 py-0.5 bg-[#f95900] text-white text-[10px] font-semibold rounded-md shadow-2xs">
              {product.discount}
            </span>
          ) : null}
        </div>

        <h4 className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
          {product.name}
        </h4>
        <p className="text-[11px] text-slate-500">
          ({product.unit})
        </p>
      </div>

      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100">
        <div>
          <span className="text-xs sm:text-sm font-bold text-slate-900 block leading-tight">
            Rs. {product.price}
          </span>
          {product.originalPrice && (
            <span className="text-[10px] text-slate-400 line-through">
              Rs. {product.originalPrice}
            </span>
          )}
        </div>

        <button
          type="button"
          disabled={isOutOfStock}
          onClick={(e) => {
            e.stopPropagation();
            if (!isOutOfStock) onAddToCart(product);
          }}
          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all ${
            isOutOfStock
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-[#f95900] hover:bg-[#ea5000] text-white shadow-sm shadow-orange-500/25 active:scale-95 cursor-pointer'
          }`}
          title={isOutOfStock ? 'Out of stock' : 'Add to cart'}
        >
          <PlusIcon size={14} />
        </button>
      </div>
    </div>
  );
};

export default PosProductCard;
