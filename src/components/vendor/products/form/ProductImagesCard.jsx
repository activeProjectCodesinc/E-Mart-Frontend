import { useState, useRef } from 'react';
import { UploadIcon, XIcon, PlusIcon } from '@/icons';

export const ProductImagesCard = ({ formData, onChange }) => {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleOpenFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleFiles = (files) => {
    const validImageFiles = Array.from(files).filter((file) =>
      file.type.startsWith('image/')
    );
    if (validImageFiles.length === 0) return;

    const newImageUrls = validImageFiles.map((file) => URL.createObjectURL(file));
    onChange('images', [...(formData.images || []), ...newImageUrls]);
    onChange('imageFiles', [...(formData.imageFiles || []), ...validImageFiles]);
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      handleFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    onChange(
      'images',
      (formData.images || []).filter((_, idx) => idx !== indexToRemove)
    );
    onChange(
      'imageFiles',
      (formData.imageFiles || []).filter((_, idx) => idx !== indexToRemove)
    );
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-7 shadow-xs space-y-5">
      <h3 className="text-sm sm:text-base font-semibold text-slate-900">
        Product Images <span className="text-orange-600">*</span>
      </h3>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      <div
        onClick={handleOpenFileDialog}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-7 text-center transition-all cursor-pointer group ${
          isDragging
            ? 'border-orange-500 bg-orange-50/40'
            : 'border-slate-200/90 hover:border-orange-500/60 bg-white hover:bg-orange-50/20'
        }`}
      >
        <div className="w-10 h-10 mx-auto rounded-full bg-orange-50 border border-orange-100/80 flex items-center justify-center text-orange-500 mb-2 group-hover:scale-105 transition-transform shadow-2xs">
          <UploadIcon size={18} />
        </div>
        <p className="text-xs sm:text-sm font-bold text-slate-800">
          Drag & drop images here or{' '}
          <span className="text-orange-600 underline font-bold">click to browse</span>
        </p>
        <p className="text-[11px] text-slate-400 mt-1">
          Supports: JPG, PNG, WebP (Min 300×300px, Max 5MB each)
        </p>
      </div>

      <div className="flex items-center gap-3 flex-wrap pt-1">
        {(formData.images || []).map((img, idx) => (
          <div
            key={idx}
            className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 bg-slate-100 group shadow-2xs ${
              idx === 0 ? 'border-orange-500' : 'border-slate-200'
            }`}
          >
            <img src={img} alt="Product" className="w-full h-full object-cover" />
            {idx === 0 && (
              <span className="absolute bottom-1 left-1 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-orange-600 text-white rounded shadow-xs">
                Main
              </span>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveImage(idx);
              }}
              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 hover:bg-rose-600 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <XIcon size={10} />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={handleOpenFileDialog}
          className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-200 hover:border-orange-500 text-slate-400 hover:text-orange-600 flex flex-col items-center justify-center gap-1 text-[11px] font-bold transition-all cursor-pointer bg-white"
        >
          <PlusIcon size={16} />
          <span>Add More</span>
        </button>
      </div>
    </div>
  );
};

export default ProductImagesCard;
