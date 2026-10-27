import DateRangePickerDropdown from '@/components/vendor/analytics/DateRangePickerDropdown';

export const FinanceHeader = ({ currentRange, onRangeChange, dateRange }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
          Finance Overview
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Track your earnings, payouts, and transactions
        </p>
      </div>

      <div className="flex items-center gap-2">
        <DateRangePickerDropdown
          currentRange={currentRange || { from: '', to: '' }}
          onRangeChange={onRangeChange}
        />
      </div>
    </div>
  );
};

export default FinanceHeader;
