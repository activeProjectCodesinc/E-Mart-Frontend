import { useState, useRef, useEffect } from 'react';
import { CalendarDaysIcon, ChevronDownIcon, CheckIcon } from '@/icons';
import { DATE_PRESETS, getPresetDates, formatDisplayDateRange } from '@/utils/datePresets';

export const DateRangePickerDropdown = ({
  currentRange, // { from: 'YYYY-MM-DD', to: 'YYYY-MM-DD', label?: string }
  onRangeChange, // ({ from, to, label }) => void
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [customFrom, setCustomFrom] = useState(currentRange?.from || '');
  const [customTo, setCustomTo] = useState(currentRange?.to || '');

  // Keep local custom inputs synced with currentRange prop
  useEffect(() => {
    if (currentRange?.from) setCustomFrom(currentRange.from);
    if (currentRange?.to) setCustomTo(currentRange.to);
  }, [currentRange]);

  // Close when clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectPreset = (presetId) => {
    const range = getPresetDates(presetId);
    onRangeChange(range);
    setIsOpen(false);
  };

  const handleApplyCustom = (e) => {
    e.preventDefault();
    if (!customFrom || !customTo) return;
    onRangeChange({
      from: customFrom,
      to: customTo,
      label: 'Custom',
    });
    setIsOpen(false);
  };

  const displayLabel = formatDisplayDateRange(currentRange?.from, currentRange?.to);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200/90 hover:border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50/70 transition-all cursor-pointer"
      >
        <CalendarDaysIcon size={16} className="text-slate-500 shrink-0" />
        <span>{displayLabel || 'Select Date Range'}</span>
        <ChevronDownIcon
          size={14}
          className={`text-slate-400 transition-transform duration-200 ml-0.5 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Floating Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-slate-200/90 z-50 p-3.5 space-y-3 animate-in fade-in zoom-in-95 duration-150">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 px-1">
              Date Presets
            </span>
            <div className="space-y-1">
              {DATE_PRESETS.map((preset) => {
                const target = getPresetDates(preset.id);
                const isSelected =
                  currentRange?.from === target.from && currentRange?.to === target.to;

                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset.id)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-orange-50 text-orange-600 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{preset.label}</span>
                    {isSelected && <CheckIcon size={14} className="text-orange-500" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 px-1">
              Custom Range
            </span>
            <form onSubmit={handleApplyCustom} className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-medium text-slate-500 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={customFrom}
                    onChange={(e) => setCustomFrom(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-orange-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-slate-500 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    value={customTo}
                    onChange={(e) => setCustomTo(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-orange-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-lg shadow-xs shadow-orange-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  Apply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePickerDropdown;
