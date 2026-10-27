export const RequestPayoutPresets = ({
  amount,
  availableBalance,
  onSelectPreset,
  onSelectMax,
}) => {
  const PRESET_AMOUNTS = [500, 1000, 2500];

  return (
    <div className="grid grid-cols-4 gap-2">
      {PRESET_AMOUNTS.map((val) => {
        const isSelected = amount === val;
        return (
          <button
            key={val}
            type="button"
            onClick={() => onSelectPreset(val)}
            className={`py-2 px-3 text-xs font-semibold rounded-xl transition-all cursor-pointer border ${
              isSelected
                ? 'border-orange-500 bg-orange-50/50 text-orange-600 shadow-xs'
                : 'border-slate-200 text-slate-700 hover:border-slate-300 bg-white'
            }`}
          >
            PKR {val}
          </button>
        );
      })}
      <button
        type="button"
        onClick={onSelectMax}
        className={`py-2 px-3 text-xs font-semibold rounded-xl transition-all cursor-pointer border ${
          amount === availableBalance
            ? 'border-orange-500 bg-orange-50/50 text-orange-600 shadow-xs'
            : 'border-slate-200 text-slate-700 hover:border-slate-300 bg-white'
        }`}
      >
        Max (PKR {Math.floor(availableBalance)})
      </button>
    </div>
  );
};

export default RequestPayoutPresets;
