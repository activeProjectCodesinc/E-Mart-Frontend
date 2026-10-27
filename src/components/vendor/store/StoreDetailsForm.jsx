import { useState, useRef, useEffect, useMemo } from 'react';
import {
  ChevronDownIcon,
  CheckIcon,
  MapPinIcon,
  ClockIcon,
  TruckIcon,
} from '@/icons';
import { STORE_CATEGORIES } from '@/mock/vendor/vendorStore.mock';
import { useCategories } from '@/hooks/useCategories';
import { toast } from '@/utils/toast';

export const StoreDetailsForm = ({
  formData,
  onChange,
}) => {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const dropdownRef = useRef(null);

  const { categories: apiCategories = [] } = useCategories();

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsCategoryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const availableCategories = useMemo(() => {
    const list = [];
    const seen = new Set();

    if (Array.isArray(apiCategories)) {
      apiCategories.forEach((cat) => {
        const name = cat?.name || (typeof cat === 'string' ? cat : '');
        if (name && !seen.has(name.toLowerCase())) {
          seen.add(name.toLowerCase());
          list.push({ id: cat.id || '', name });
        }
      });
    }

    STORE_CATEGORIES.forEach((name) => {
      if (!seen.has(name.toLowerCase())) {
        seen.add(name.toLowerCase());
        list.push({ id: '', name });
      }
    });

    if (formData.category && !seen.has(formData.category.toLowerCase())) {
      list.unshift({ id: formData.categoryId || '', name: formData.category });
    }

    return list;
  }, [apiCategories, formData.category, formData.categoryId]);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }

    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsDetectingLocation(false);
        onChange('latitude', position.coords.latitude.toFixed(6));
        onChange('longitude', position.coords.longitude.toFixed(6));
        toast.success('Live GPS coordinates detected successfully!');
      },
      (error) => {
        setIsDetectingLocation(false);
        toast.error(`Unable to detect location: ${error.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="space-y-6 pt-2">
      {/* 1. Store Operations & Availability Status Card */}
      <div className="p-4 sm:p-5 bg-slate-50/90 border border-slate-200/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all">
        <div className="flex items-start gap-3.5">
          <div className="pt-1">
            <span
              className={`block w-3.5 h-3.5 rounded-full ${
                formData.isOpen
                  ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50 animate-pulse'
                  : 'bg-slate-300'
              }`}
            />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-sm font-semibold text-slate-800">
                Store Operations:{' '}
                <span className={formData.isOpen ? 'text-emerald-600' : 'text-slate-500'}>
                  {formData.isOpen ? 'Open for Orders' : 'Temporarily Closed'}
                </span>
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wide ${
                  formData.status === 'active'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {formData.status || 'Active'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {formData.isOpen
                ? 'Store is active and open. Customers can place delivery and pickup orders.'
                : 'Store is paused. Customers will view your catalog but cannot place new orders.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center">
          <span className="text-xs font-semibold text-slate-600 hidden sm:inline">
            {formData.isOpen ? 'Accepting Orders' : 'Store Paused'}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={formData.isOpen}
            onClick={() => onChange('isOpen', !formData.isOpen)}
            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500/30 ${
              formData.isOpen ? 'bg-emerald-500' : 'bg-slate-300'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                formData.isOpen ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* 2. Basic Store Information */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          General Details
        </h3>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Store Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              required
              maxLength={60}
              value={formData.name || ''}
              onChange={(e) => onChange('name', e.target.value)}
              placeholder="e.g. E-Mart Official Store"
              className="w-full px-3.5 py-2.5 sm:py-3 pr-16 bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-2xs"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 pointer-events-none">
              {(formData.name || '').length}/60
            </span>
          </div>
        </div>

        {/* Store Category Dropdown */}
        <div ref={dropdownRef} className="relative">
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Store Category <span className="text-rose-500">*</span>
          </label>
          <button
            type="button"
            onClick={() => setIsCategoryOpen((prev) => !prev)}
            className="w-full flex items-center justify-between px-3.5 py-2.5 sm:py-3 bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-2xs cursor-pointer text-left"
          >
            <span>{formData.category || 'Select a category'}</span>
            <ChevronDownIcon
              size={16}
              className={`text-slate-400 transition-transform ${
                isCategoryOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {isCategoryOpen && (
            <div className="absolute left-0 right-0 top-full mt-1.5 z-30 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden py-1 max-h-56 overflow-y-auto animate-in fade-in">
              {availableCategories.map((cat) => {
                const isSelected =
                  formData.category?.toLowerCase() === cat.name.toLowerCase();
                return (
                  <button
                    key={cat.id || cat.name}
                    type="button"
                    onClick={() => {
                      onChange('category', cat.name);
                      if (cat.id) {
                        onChange('categoryId', cat.id);
                      }
                      setIsCategoryOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-xs sm:text-sm font-semibold transition-colors cursor-pointer text-left ${
                      isSelected
                        ? 'bg-orange-50 text-orange-600'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{cat.name}</span>
                    {isSelected && <CheckIcon size={15} className="text-orange-600" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Store Description
          </label>
          <div className="relative">
            <textarea
              rows={3}
              maxLength={300}
              value={formData.description || ''}
              onChange={(e) => onChange('description', e.target.value)}
              placeholder="Provide a short description of what your store sells..."
              className="w-full px-3.5 py-2.5 sm:py-3 pb-8 bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-2xs resize-none"
            />
            <span className="absolute right-3.5 bottom-2.5 text-xs font-semibold text-slate-400 pointer-events-none">
              {(formData.description || '').length}/300
            </span>
          </div>
        </div>
      </div>

      {/* 3. Delivery Configuration */}
      <div className="space-y-4 pt-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Delivery Configuration
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Estimated Delivery Time <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={formData.deliveryTime || ''}
                onChange={(e) => onChange('deliveryTime', e.target.value)}
                placeholder="e.g. 30-45 mins"
                className="w-full pl-9 pr-3.5 py-2.5 sm:py-3 bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-2xs"
              />
              <ClockIcon
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Estimated time shown to customers at checkout.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Delivery Fee (PKR) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="1"
                required
                value={formData.deliveryFee !== undefined && formData.deliveryFee !== null ? formData.deliveryFee : ''}
                onChange={(e) => onChange('deliveryFee', e.target.value)}
                placeholder="e.g. 150"
                className="w-full pl-12 pr-3.5 py-2.5 sm:py-3 bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-2xs"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                Rs.
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Flat delivery fee charged per delivery order.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Location & Address Details */}
      <div className="space-y-4 pt-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Store Location & Coordinates
        </h3>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Full Address Line <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              required
              value={formData.addressLine || ''}
              onChange={(e) => onChange('addressLine', e.target.value)}
              placeholder="e.g. Main Boulevard, Gulberg III, Lahore"
              className="w-full pl-9 pr-3.5 py-2.5 sm:py-3 bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-2xs"
            />
            <MapPinIcon
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              City <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              list="pakistan-cities-list"
              value={formData.city || ''}
              onChange={(e) => onChange('city', e.target.value)}
              placeholder="e.g. Lahore"
              className="w-full px-3.5 py-2.5 sm:py-3 bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-2xs"
            />
            <datalist id="pakistan-cities-list">
              <option value="Lahore" />
              <option value="Karachi" />
              <option value="Islamabad" />
              <option value="Rawalpindi" />
              <option value="Faisalabad" />
              <option value="Multan" />
              <option value="Peshawar" />
              <option value="Quetta" />
              <option value="Sialkot" />
              <option value="Gujranwala" />
            </datalist>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Area / Zone <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              list="lahore-areas-list"
              value={formData.area || ''}
              onChange={(e) => onChange('area', e.target.value)}
              placeholder="e.g. Gulberg"
              className="w-full px-3.5 py-2.5 sm:py-3 bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-2xs"
            />
            <datalist id="lahore-areas-list">
              <option value="Gulberg" />
              <option value="DHA Phase 1" />
              <option value="DHA Phase 5" />
              <option value="DHA Phase 6" />
              <option value="Johar Town" />
              <option value="Model Town" />
              <option value="Bahria Town" />
              <option value="Cantt" />
              <option value="Faisal Town" />
              <option value="Garden Town" />
              <option value="Clifton" />
              <option value="Blue Area" />
            </datalist>
          </div>
        </div>

        {/* GPS Coordinates & Auto-Detection */}
        <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold text-slate-800">
                GPS Geolocation Coordinates
              </span>
              <p className="text-[11px] text-slate-500">
                Accurate latitude and longitude assist delivery riders in locating your store.
              </p>
            </div>
            <button
              type="button"
              disabled={isDetectingLocation}
              onClick={handleDetectLocation}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-orange-50 text-orange-600 border border-orange-200/80 rounded-xl text-xs font-semibold shadow-2xs transition-all cursor-pointer active:scale-95 disabled:opacity-50 shrink-0 self-start sm:self-auto"
            >
              <span>📍</span>
              <span>{isDetectingLocation ? 'Detecting GPS...' : 'Detect Current Location'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Latitude
              </label>
              <input
                type="number"
                step="any"
                value={formData.latitude !== undefined && formData.latitude !== null ? formData.latitude : ''}
                onChange={(e) => onChange('latitude', e.target.value)}
                placeholder="e.g. 31.5204"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Longitude
              </label>
              <input
                type="number"
                step="any"
                value={formData.longitude !== undefined && formData.longitude !== null ? formData.longitude : ''}
                onChange={(e) => onChange('longitude', e.target.value)}
                placeholder="e.g. 74.3587"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreDetailsForm;
