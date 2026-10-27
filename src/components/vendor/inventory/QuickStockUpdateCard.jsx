import { useState, useRef } from 'react';
import { RefreshCwIcon, UploadIcon } from '@/icons';

export const QuickStockUpdateCard = ({
  product,
  onClose,
  onUpdateStock,
  onOpenCsvValidation,
}) => {
  const [mode, setMode] = useState('add');
  const [quantity, setQuantity] = useState('50');
  const [notes, setNotes] = useState('');
  const fileInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const qtyNum = parseInt(quantity, 10) || 0;
    const finalChange = mode === 'add' ? qtyNum : -qtyNum;
    onUpdateStock({
      productId: product.id,
      change: finalChange,
      notes: notes.trim(),
    });
  };

  const handleCsvFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onOpenCsvValidation(file);
      e.target.value = '';
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-4 shadow-2xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <RefreshCwIcon size={15} className="text-orange-600" />
          <h3 className="text-xs sm:text-sm font-semibold text-slate-900">
            Quick Stock Update
          </h3>
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200 transition-colors cursor-pointer"
          title="Upload CSV to update inventory"
        >
          <UploadIcon size={12} />
          <span>Upload CSV</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={handleCsvFileChange}
          className="hidden"
        />
      </div>

      <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
        <button
          type="button"
          onClick={() => setMode('add')}
          className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            mode === 'add'
              ? 'bg-white text-orange-600 shadow-xs border border-orange-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          + Add Stock
        </button>
        <button
          type="button"
          onClick={() => setMode('reduce')}
          className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            mode === 'reduce'
              ? 'bg-white text-rose-600 shadow-xs border border-rose-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          - Reduce Stock
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            {mode === 'add' ? 'Add Quantity' : 'Reduce Quantity'}
          </label>
          <div className="relative">
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full pl-3.5 pr-12 py-2 text-xs sm:text-sm bg-white border border-slate-200/90 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
              {typeof product.unit === 'object' && product.unit !== null ? (product.unit.name || product.unit.symbol || 'unit') : (product.unit || 'unit')}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Notes <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. New stock received from supplier..."
            className="w-full px-3 py-2 text-xs bg-white border border-slate-200/90 rounded-xl outline-none resize-none"
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-md shadow-orange-500/20 active:scale-98 transition-all cursor-pointer"
          >
            {mode === 'add' ? 'Add Stock' : 'Reduce Stock'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuickStockUpdateCard;
