import { useState, useRef } from 'react';
import { UploadIcon, XIcon, PlusIcon } from '@/icons';

export const getImageUrl = (img) => {
  if (!img) return '';
  if (typeof img === 'string') return img;
  if (typeof img === 'object') return img.url || img.imageUrl || '';
  return '';
};

export const ProductImagesCard = ({
  formData,
  onChange,
  onDeleteExistingImage,
}) => {
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

    const newImageItems = validImageFiles.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      isNew: true,
    }));

    const nextImages = [...(formData.images || []), ...newImageItems];
    onChange('images', nextImages);
    onChange(
      'imageFiles',
      nextImages.filter((i) => i.file).map((i) => i.file)
    );
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
    const itemToRemove = (formData.images || [])[indexToRemove];
    if (onDeleteExistingImage && itemToRemove?.id && !itemToRemove?.isNew) {
      onDeleteExistingImage(itemToRemove.id);
    }

    const nextImages = (formData.images || []).filter((_, idx) => idx !== indexToRemove);
    onChange('images', nextImages);
    onChange(
      'imageFiles',
      nextImages.filter((i) => i.file).map((i) => i.file)
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
        {(formData.images || []).map((img, idx) => {
          const srcUrl = getImageUrl(img);
          const isMain = idx === 0 || img?.isMain;

          return (
            <div
              key={img?.id || idx}
              className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 bg-slate-100 group shadow-2xs ${
                isMain ? 'border-orange-500' : 'border-slate-200'
              }`}
            >
              <img
                src={srcUrl}
                alt={formData.name || 'Product'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src =
                    'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=100';
                }}
              />
              {isMain && (
                <span className="absolute bottom-1 left-1 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-orange-600 text-white rounded shadow-xs pointer-events-none">
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
                title="Remove image"
              >
                <XIcon size={10} />
              </button>
            </div>
          );
        })}

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
