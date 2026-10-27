import { useRef } from 'react';
import { useAnimatedIcon } from '@/utils/useAnimatedIcon';
import { CameraIcon, UploadIcon } from '@/icons';
import { useSettings } from '@/hooks/useSettings';
import storeBannerImg from '@/assets/images/storeBanner.jpg';

export const StoreBannerUpload = ({ bannerUrl, onBannerChange }) => {
  const fileInputRef = useRef(null);
  const [cameraRef, cameraTrigger] = useAnimatedIcon();
  const [uploadRef, uploadTrigger] = useAnimatedIcon();
  const { uploadStoreBanner, isUploadingStoreBanner } = useSettings();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      onBannerChange(event.target.result);
    };
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await uploadStoreBanner(formData);
      if (res?.data?.url) {
        onBannerChange(res.data.url);
      }
    } catch {
      // Handled by hook
    }
  };

  const handleOpenPicker = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-slate-700">
        Store Banner
      </label>

      <div className="relative w-full h-44 sm:h-52 md:h-60 rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/90 shadow-inner group">
        <img
          src={bannerUrl || storeBannerImg}
          alt="Store Banner"
          className="w-full h-full object-cover object-center group-hover:scale-[1.01] transition-transform duration-500"
        />

        {isUploadingStoreBanner && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-xs sm:text-sm font-semibold z-20">
            Uploading banner to Cloudinary...
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

        <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 z-10">
          <button
            type="button"
            disabled={isUploadingStoreBanner}
            onClick={handleOpenPicker}
            onMouseEnter={cameraTrigger.onMouseEnter}
            onMouseLeave={cameraTrigger.onMouseLeave}
            className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 bg-white/95 hover:bg-white text-slate-800 text-xs sm:text-sm font-semibold rounded-xl shadow-md backdrop-blur-xs transition-all cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <CameraIcon ref={cameraRef} size={16} animateOnHover={false} />
            <span>{isUploadingStoreBanner ? 'Uploading...' : 'Change Banner'}</span>
          </button>
        </div>

        <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 z-10">
          <button
            type="button"
            disabled={isUploadingStoreBanner}
            onClick={handleOpenPicker}
            onMouseEnter={uploadTrigger.onMouseEnter}
            onMouseLeave={uploadTrigger.onMouseLeave}
            className="w-9 h-9 sm:w-10 sm:h-10 bg-white/95 hover:bg-white text-slate-800 rounded-full shadow-md backdrop-blur-xs flex items-center justify-center transition-all cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <UploadIcon ref={uploadRef} size={16} animateOnHover={false} />
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/webp"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      <p className="text-[11px] text-slate-400 font-medium">
        Recommended size: 1200 × 300px (JPG, PNG, WebP)
      </p>
    </div>
  );
};

export default StoreBannerUpload;
