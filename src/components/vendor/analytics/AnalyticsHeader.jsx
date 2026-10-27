import { useAnimatedIcon } from '@/utils/useAnimatedIcon';
import { CalendarDaysIcon, ChevronDownIcon, DownloadIcon } from '@/icons';

export const AnalyticsHeader = ({
  dateRange = 'Oct 1, 2026 - Oct 31, 2026',
  onExport = null,
  isExporting = false,
}) => {
  const [calRef, calTrigger] = useAnimatedIcon();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
          Reports & Analytics
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Track store performance, AOV, category shares, and customer habits
        </p>
      </div>

      <div className="flex items-center gap-2.5">
        <div className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 shadow-xs">
          <CalendarDaysIcon
            ref={calRef}
            size={16}
            animateOnHover={false}
            className="text-slate-500"
          />
          <span>{dateRange}</span>
        </div>

        {onExport && (
          <button
            type="button"
            onClick={onExport}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200/90 hover:bg-slate-50 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            <DownloadIcon
              size={15}
              className={isExporting ? 'animate-bounce text-orange-500' : 'text-slate-500'}
            />
            <span>{isExporting ? 'Exporting...' : 'Export CSV'}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default AnalyticsHeader;
