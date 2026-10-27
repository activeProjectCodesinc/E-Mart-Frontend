import { useState, useMemo } from 'react';
import { ChevronDownIcon } from '@/icons';
import { SALES_ORDERS_TREND_DATA } from '@/mock/vendor/vendorAnalytics.mock';

export const SalesOrdersTrendChart = ({ data = null }) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('This Month');

  const chartData = useMemo(() => {
    if (data && Array.isArray(data) && data.length > 0) {
      return data.map((d) => ({
        label: d.label || (d.date ? new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'),
        sales: Number(d.revenue ?? d.sales ?? 0),
        orders: Number(d.orders ?? 0),
      }));
    }
    return SALES_ORDERS_TREND_DATA;
  }, [data]);

  const maxSales = useMemo(() => {
    const highest = Math.max(...chartData.map((d) => d.sales), 100);
    return Math.ceil(highest / 100) * 100 || 800;
  }, [chartData]);

  const maxOrders = useMemo(() => {
    const highest = Math.max(...chartData.map((d) => d.orders), 5);
    return Math.ceil(highest / 5) * 5 || 20;
  }, [chartData]);

  const leftYTicks = useMemo(() => {
    const step = maxSales / 4;
    return [maxSales, Math.round(step * 3), Math.round(step * 2), Math.round(step), 0];
  }, [maxSales]);

  const rightYTicks = useMemo(() => {
    const step = maxOrders / 4;
    return [maxOrders, Math.round(step * 3), Math.round(step * 2), Math.round(step), 0];
  }, [maxOrders]);

  const chartWidth = 520;
  const chartHeight = 170;

  const points = chartData.map((d, i) => {
    const x = chartData.length > 1 ? (i / (chartData.length - 1)) * chartWidth : chartWidth / 2;
    const y = chartHeight - (d.orders / Math.max(1, maxOrders)) * chartHeight;
    return { x, y };
  });

  const polylinePoints = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight">
          Sales & Orders Trend
        </h3>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="inline-flex items-center gap-1.5 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
              Sales (PKR)
            </span>
            <span className="inline-flex items-center gap-1.5 text-slate-600">
              <span className="w-3.5 h-0.5 bg-amber-500 rounded-full" />
              Orders
            </span>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 hover:border-slate-300 transition-colors cursor-pointer"
          >
            <span>{selectedPeriod}</span>
            <ChevronDownIcon size={14} className="text-slate-400" />
          </button>
        </div>
      </div>

      <div className="relative pt-2">
        <div className="relative h-52 sm:h-60 flex">
          <div className="flex flex-col justify-between pr-3 text-[11px] font-semibold text-slate-400 select-none pb-6">
            {leftYTicks.map((t) => (
              <span key={t}>Rs.{t}</span>
            ))}
          </div>

          <div className="relative flex-1 flex flex-col justify-between pb-6">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6">
              {leftYTicks.map((t) => (
                <div key={t} className="w-full border-b border-slate-100 last:border-slate-200" />
              ))}
            </div>

            <div className="relative z-10 h-full flex items-end justify-between px-2 sm:px-4">
              {chartData.map((item, idx) => {
                const heightPercent = Math.min(100, (item.sales / Math.max(1, maxSales)) * 100);
                const isHovered = hoveredIdx === idx;

                return (
                  <div
                    key={item.label || idx}
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    className="relative flex flex-col items-center h-full justify-end cursor-pointer group"
                  >
                    {isHovered && (
                      <div className="absolute -top-12 z-30 px-2.5 py-1.5 bg-slate-900 text-white text-[11px] font-semibold rounded-lg shadow-lg whitespace-nowrap animate-in fade-in">
                        <div>Sales: PKR {Number(item.sales || 0).toLocaleString()}</div>
                        <div className="text-amber-400">Orders: {item.orders}</div>
                      </div>
                    )}

                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-2.5 sm:w-3.5 rounded-t-sm bg-orange-500/85 hover:bg-orange-500 transition-all duration-300"
                    />
                  </div>
                );
              })}

              {chartData.length > 1 && (
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  className="absolute inset-x-2 sm:inset-x-4 top-2 bottom-6 w-[calc(100%-16px)] sm:w-[calc(100%-32px)] h-[calc(100%-32px)] pointer-events-none z-20 overflow-visible"
                  preserveAspectRatio="none"
                >
                  <polyline
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={polylinePoints}
                  />
                  {points.map((p, i) => (
                    <circle
                      key={i}
                      cx={p.x}
                      cy={p.y}
                      r={hoveredIdx === i ? 4.5 : 2.5}
                      className="fill-white stroke-amber-500 stroke-2 transition-all"
                    />
                  ))}
                </svg>
              )}
            </div>
          </div>

          <div className="flex flex-col justify-between pl-3 text-[11px] font-semibold text-slate-400 select-none pb-6 text-right">
            {rightYTicks.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </div>

        <div className="flex pl-10 sm:pl-12 pr-6 sm:pr-8 justify-between text-[11px] font-semibold text-slate-500 pt-2 border-t border-slate-200 overflow-x-auto">
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

export default SalesOrdersTrendChart;
