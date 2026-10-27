import { CircleCheckIcon, XIcon } from '@/icons';

export const UploadSuccessModal = ({
  isOpen,
  product,
  onAddAnother,
  onBackToProducts,
}) => {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 text-center animate-in fade-in zoom-in-95 duration-150">
        <button
          type="button"
          onClick={onBackToProducts}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <XIcon size={16} />
        </button>

        <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-3 shadow-xs">
          <CircleCheckIcon size={28} />
        </div>

        <h3 className="text-xl font-semibold text-slate-900">Upload Success</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
          Your product has been added successfully. You can view it on your products table or add another product.
        </p>

        <div className="flex items-center gap-3 p-3 mt-4 text-left rounded-xl bg-slate-50 border border-slate-100">
          <img
            src={
              product.image ||
              (Array.isArray(product.images) && (product.images[0]?.url || (typeof product.images[0] === 'string' && product.images[0]))) ||
              'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=120'
            }
            alt={product.name}
            className="w-12 h-12 rounded-lg object-cover bg-white border border-slate-200 shrink-0"
          />
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
              {product.name}
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {product.category}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2.5 mt-5">
          <button
            type="button"
            onClick={onAddAnother}
            className="flex-1 py-2.5 px-4 text-xs font-bold text-slate-700 hover:text-slate-900 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Add Another Product
          </button>
          <button
            type="button"
            onClick={onBackToProducts}
            className="flex-1 py-2.5 px-4 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-md shadow-orange-500/20 active:scale-98 transition-all cursor-pointer"
          >
            Back to Products
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadSuccessModal;
