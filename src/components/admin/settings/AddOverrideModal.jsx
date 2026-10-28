import { useState, useEffect } from 'react';
import { XIcon } from '@/icons';

const CATEGORY_OPTIONS = [
  'Groceries',
  'Dairy & Eggs',
  'Fruits & Vegetables',
  'Meat & Seafood',
  'Beverages',
  'Snacks & Confectionery',
  'Personal Care',
  'Household',
];

const VENDOR_OPTIONS = [
  'Fresh Mart',
  'Green Valley Grocers',
  'Pure Organic Store',
  'City Supermarket',
  'Daily Essentials',
];

export const AddOverrideModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [type, setType] = useState('Category');
  const [name, setName] = useState('');
  const [rate, setRate] = useState(10);

  useEffect(() => {
    if (initialData) {
      setType(initialData.type || 'Category');
      setName(initialData.name || '');
      setRate(initialData.rate ?? 10);
    } else {
      setType('Category');
      setName(CATEGORY_OPTIONS[0]);
      setRate(10);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      id: initialData?.id || `ovr-${Date.now()}`,
      name: name.trim(),
      type,
      rate: Number(rate) || 0,
    });
    onClose();
  };

  const options = type === 'Category' ? CATEGORY_OPTIONS : VENDOR_OPTIONS;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {initialData ? 'Edit Commission Override' : 'Add Commission Override'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Specific commission rate for a category or vendor.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <XIcon size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Override Type
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
              {['Category', 'Vendor'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setType(t);
                    setName(t === 'Category' ? CATEGORY_OPTIONS[0] : VENDOR_OPTIONS[0]);
                  }}
                  className={`py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    type === t
                      ? 'bg-white text-orange-600 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {type === 'Category' ? 'Select Category' : 'Select Vendor'}
            </label>
            <select
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 shadow-2xs"
            >
              {options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Commission Rate
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 shadow-2xs pr-10"
                placeholder="10"
                required
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 pointer-events-none">
                %
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold shadow-xs shadow-orange-500/25 transition-all cursor-pointer"
            >
              {initialData ? 'Save Changes' : 'Add Override'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddOverrideModal;
