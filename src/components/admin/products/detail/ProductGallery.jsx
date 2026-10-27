import { useState } from 'react';
import { PlusIcon } from '@/icons';

export const ProductGallery = ({ product }) => {
  const [selectedImage, setSelectedImage] = useState(0);

  const getImgUrl = (item) => {
    if (!item) return '';
    if (typeof item === 'string') return item;
    if (typeof item === 'object') return item.url || item.imageUrl || '';
    return '';
  };

  const rawImages = Array.isArray(product.images) && product.images.length > 0
    ? product.images.map(getImgUrl).filter(Boolean)
    : [product.image || product.imageUrl || 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600'];

  const images = rawImages.length > 0 ? rawImages : ['https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600'];

  const tags = product.tags || ['fresh fruits', 'banana', 'organic', 'healthy food'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Media Column (5 cols) */}
      <div className="lg:col-span-5 space-y-3">
        {/* Main Image Box */}
        <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-2xs">
          <span className="absolute top-3.5 left-3.5 z-10 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-orange-600 text-white shadow-xs">
            Main
          </span>
          <img
            src={images[selectedImage]}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* 4 Thumbnails */}
        <div className="grid grid-cols-4 gap-2.5">
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedImage(idx)}
              className={`aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer bg-slate-50 ${
                selectedImage === idx
                  ? 'border-orange-500 ring-2 ring-orange-500/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <img
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Description & Tags Column (7 cols) */}
      <div className="lg:col-span-7 space-y-4">
        {/* Short & Detailed summary text */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            About Product
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {product.detailedDescription || product.shortDescription ||
              'Fresh and organic products carefully sourced from trusted farms. Rich in nutrients and perfect for everyday household use.'}
          </p>

          {/* Tags */}
          <div className="pt-2">
            <span className="text-xs font-semibold text-slate-500 block mb-2">
              Product Tags
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/70"
                >
                  <span>{tag}</span>
                  <span className="text-slate-400 hover:text-slate-600 cursor-pointer">×</span>
                </span>
              ))}

              <button
                type="button"
                className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-semibold text-orange-600 bg-orange-50 border border-orange-200/60 hover:bg-orange-100 transition-colors cursor-pointer"
              >
                <PlusIcon animateOnHover={false} size={13} />
                <span>Add Tag</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductGallery;
