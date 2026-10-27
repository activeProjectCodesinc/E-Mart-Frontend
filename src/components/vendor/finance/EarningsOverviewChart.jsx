import { useState, useMemo, useEffect } from 'react';
import { EARNINGS_CHART_DATA } from '@/mock/vendor/vendorFinance.mock';
import PeriodSelectDropdown from '@/components/vendor/analytics/PeriodSelectDropdown';

export const EarningsOverviewChart = ({
  data = EARNINGS_CHART_DATA,
  period = 'This Month',
  onPeriodChange = null,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState(period);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  useEffect(() => {
    if (period) setSelectedPeriod(period);
  }, [period]);

  const handleSelectPeriod = (presetId, label) => {
    setSelectedPeriod(label);
    if (onPeriodChange) onPeriodChange(presetId, label);
  };

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return EARNINGS_CHART_DATA;
    return data;
  }, [data]);

  const maxVal = useMemo(() => {
    const highest = Math.max(
      ...chartData.map((d) => Math.max(Number(d.sales || 0), Number(d.net || 0))),
      100
    );
    return Math.ceil(highest / 100) * 100 || 500;
  }, [chartData]);

  const yTicks = useMemo(() => {
    const step = maxVal / 4;
    return [maxVal, Math.round(step * 3), Math.round(step * 2), Math.round(step), 0];
  }, [maxVal]);

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight">
          Earnings Overview
        </h3>

        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="inline-flex items-center gap-1.5 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
              Total Sales
            </span>
            <span className="inline-flex items-center gap-1.5 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-300" />
              Net Earnings
            </span>
          </div>

          <PeriodSelectDropdown
            selectedPeriod={selectedPeriod}
            onSelectPeriod={handleSelectPeriod}
          />
        </div>
      </div>

      <div className="relative pt-4 pb-2">
        <div className="relative h-56 sm:h-64 flex">
          <div className="flex flex-col justify-between pr-3 sm:pr-4 text-[10px] sm:text-xs font-semibold text-slate-400 select-none pb-6">
            {yTicks.map((tick) => (
              <span key={tick}>Rs. {tick}</span>
            ))}
          </div>

          <div className="relative flex-1 flex flex-col justify-between pb-6">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6">
              {yTicks.map((tick) => (
                <div
                  key={tick}
                  className="w-full border-b border-slate-100 first:border-transparent last:border-slate-200"
                />
              ))}
            </div>

            <div className="relative z-10 h-full flex items-end justify-between px-2 sm:px-6">
              {chartData.map((item, idx) => {
                const salesHeight = `${Math.min(100, (Number(item.sales || 0) / maxVal) * 100)}%`;
                const netHeight = `${Math.min(100, (Number(item.net || 0) / maxVal) * 100)}%`;
                const isHovered = hoveredIndex === idx;

                return (
                  <div
                    key={item.label || idx}
                    className="group relative flex flex-col items-center h-full justify-end cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    {isHovered && (
                      <div className="absolute -top-14 z-20 px-2.5 py-1.5 bg-slate-900 text-white text-[11px] font-semibold rounded-lg shadow-lg whitespace-nowrap animate-in fade-in">
                        <div>Sales: PKR {Number(item.sales || 0).toLocaleString()}</div>
                        <div className="text-orange-300">Net: PKR {Number(item.net || 0).toLocaleString()}</div>
                      </div>
                    )}

                    <div className="flex items-end gap-1 sm:gap-1.5">
                      <div
                        style={{ height: salesHeight }}
                        className="w-2.5 sm:w-3.5 bg-orange-500 rounded-t-sm group-hover:brightness-110 transition-all duration-300"
                      />
                      <div
                        style={{ height: netHeight }}
                        className="w-2.5 sm:w-3.5 bg-orange-300 rounded-t-sm group-hover:brightness-110 transition-all duration-300"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex pl-10 sm:pl-12 pr-2 sm:px-6 justify-between text-[11px] font-semibold text-slate-500 pt-2 border-t border-slate-200 overflow-x-auto">
          {chartData.map((item, idx) => (
            <span key={item.label || idx} className="truncate px-1">
              {item.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EarningsOverviewChart;
