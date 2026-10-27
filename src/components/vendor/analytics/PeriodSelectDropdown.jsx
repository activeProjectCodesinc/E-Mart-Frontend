import { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, CheckIcon } from '@/icons';
import { DATE_PRESETS } from '@/utils/datePresets';

export const PeriodSelectDropdown = ({
  selectedPeriod = 'This Month',
  onSelectPeriod,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50/70 transition-colors cursor-pointer shadow-2xs"
      >
        <span>{selectedPeriod}</span>
        <ChevronDownIcon
          size={14}
          className={`text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-40 bg-white rounded-xl shadow-xl border border-slate-200/90 z-50 p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-150">
          {DATE_PRESETS.map((preset) => {
            const isSelected = selectedPeriod.toLowerCase() === preset.label.toLowerCase();

            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  onSelectPeriod(preset.id, preset.label);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-orange-50 text-orange-600 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{preset.label}</span>
                {isSelected && <CheckIcon size={12} className="text-orange-500" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PeriodSelectDropdown;
