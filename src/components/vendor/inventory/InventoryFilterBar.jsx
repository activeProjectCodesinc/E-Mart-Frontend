import { useState, useRef, useEffect } from 'react';
import { SearchIcon, ChevronDownIcon, UploadIcon, DownloadIcon } from '@/icons';
import { downloadSampleInventoryCsv } from '@/utils/csvInventoryHelper';

const FILTER_OPTIONS = ['All Products', 'In Stock', 'Low Stock', 'Out of Stock'];

export const InventoryFilterBar = ({
  searchQuery,
  onSearchChange,
  stockFilter,
  onStockFilterChange,
  onOpenCsvModal,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && onOpenCsvModal) {
      onOpenCsvModal(file);
      e.target.value = '';
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="relative flex-1 max-w-md">
        <SearchIcon
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search products by name or SKU..."
          className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white border border-slate-200/90 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-xs"
        />
      </div>

      <div className="flex items-center gap-2.5 self-end sm:self-auto">
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white border border-slate-200/90 rounded-xl hover:bg-slate-50 transition-all shadow-xs cursor-pointer"
          >
            <span>{stockFilter}</span>
            <ChevronDownIcon size={14} className="text-slate-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-44 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-30 animate-in fade-in zoom-in-95">
              {FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    onStockFilterChange(opt);
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                    stockFilter === opt
                      ? 'bg-orange-50 text-orange-600 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={downloadSampleInventoryCsv}
          className="inline-flex items-center gap-1.5 px-3 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-xl shadow-xs transition-colors cursor-pointer"
          title="Download official CSV sample template"
        >
          <DownloadIcon size={14} className="text-slate-500" />
          <span className="hidden sm:inline">Download Template</span>
          <span className="sm:hidden">Template</span>
        </button>

        {onOpenCsvModal && (
          <>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs sm:text-sm font-bold text-orange-600 bg-orange-50 hover:bg-orange-100/80 border border-orange-200 rounded-xl shadow-xs transition-colors cursor-pointer"
              title="Import inventory stock from CSV"
            >
              <UploadIcon size={14} />
              <span>CSV Import</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </>
        )}
      </div>
    </div>
  );
};

export default InventoryFilterBar;
