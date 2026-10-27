import { useState, useMemo, useEffect } from 'react';
import { SALES_ORDERS_TREND_DATA } from '@/mock/vendor/vendorAnalytics.mock';
import PeriodSelectDropdown from './PeriodSelectDropdown';

export const SalesOrdersTrendChart = ({
  data = null,
  period = 'This Month',
  onPeriodChange = null,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState(period);

  useEffect(() => {
    if (period) setSelectedPeriod(period);
  }, [period]);

  const handleSelectPeriod = (presetId, label) => {
    setSelectedPeriod(label);
    if (onPeriodChange) {
      onPeriodChange(presetId, label);
    }
  };

  const chartData = useMemo(() => {
    if (data && Array.isArray(data) && data.length > 0) {
      return data.map((d) => ({
        label: d.label || (d.date ? new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'),
        fullDate: d.date ? new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : d.label,
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

  const chartWidth = 600;
  const chartHeight = 180;
  const paddingY = 14;
  const plotHeight = chartHeight - paddingY * 2;

  const salesPoints = useMemo(() => {
    return chartData.map((d, i) => {
      const x = chartData.length > 1 ? (i / (chartData.length - 1)) * chartWidth : chartWidth / 2;
      const y = chartHeight - paddingY - (d.sales / Math.max(1, maxSales)) * plotHeight;
      return { x, y };
    });
  }, [chartData, maxSales, plotHeight]);

  const ordersPoints = useMemo(() => {
    return chartData.map((d, i) => {
      const x = chartData.length > 1 ? (i / (chartData.length - 1)) * chartWidth : chartWidth / 2;
      const y = chartHeight - paddingY - (d.orders / Math.max(1, maxOrders)) * plotHeight;
      return { x, y };
    });
  }, [chartData, maxOrders, plotHeight]);

  const salesPolyline = useMemo(() => {
    return salesPoints.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  }, [salesPoints]);

  const ordersPolyline = useMemo(() => {
    return ordersPoints.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  }, [ordersPoints]);

  const salesAreaPoints = useMemo(() => {
    if (salesPoints.length === 0) return '';
    return [
      `0,${chartHeight}`,
      ...salesPoints.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`),
      `${chartWidth},${chartHeight}`,
    ].join(' ');
  }, [salesPoints]);

  // Generate evenly spaced legible X-axis date ticks (5-6 ticks) to avoid overlapping / truncation
  const visibleXTicks = useMemo(() => {
    if (chartData.length <= 7) {
      return chartData.map((d, i) => ({ index: i, label: d.label }));
    }
    const count = 6;
    const step = (chartData.length - 1) / (count - 1);
    const ticks = [];
    for (let k = 0; k < count; k++) {
      const idx = Math.min(chartData.length - 1, Math.round(k * step));
      ticks.push({ index: idx, label: chartData[idx]?.label });
    }
    return ticks;
  }, [chartData]);

  const hoveredItem = hoveredIdx !== null ? chartData[hoveredIdx] : null;

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight">
          Sales & Orders Trend
        </h3>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="inline-flex items-center gap-1.5 text-slate-600">
              <span className="w-3 h-0.5 bg-orange-500 rounded-full" />
              Sales (PKR)
            </span>
            <span className="inline-flex items-center gap-1.5 text-slate-600">
              <span className="w-3 h-0.5 bg-sky-500 rounded-full" />
              Orders
            </span>
          </div>

          <PeriodSelectDropdown
            selectedPeriod={selectedPeriod}
            onSelectPeriod={handleSelectPeriod}
          />
        </div>
      </div>

      <div className="relative pt-2">
        <div className="relative h-56 sm:h-64 flex">
          {/* Left Y-Axis: Sales */}
          <div className="flex flex-col justify-between pr-3 text-xs font-medium text-slate-400 select-none pb-7">
            {leftYTicks.map((t) => (
              <span key={t}>Rs.{t}</span>
            ))}
          </div>

          {/* Central Chart Canvas */}
          <div className="relative flex-1 flex flex-col justify-between pb-7">
            {/* Background Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-7">
              {leftYTicks.map((t) => (
                <div key={t} className="w-full border-b border-slate-100 last:border-slate-200" />
              ))}
            </div>

            {/* SVG Line Chart */}
            <div className="relative z-10 w-full h-full">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full h-full overflow-visible"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="salesTrendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity="0.25" />
                    <stop offset="85%" stopColor="#f97316" stopOpacity="0.03" />
                    <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Sales Gradient Area */}
                {salesAreaPoints && (
                  <polygon
                    points={salesAreaPoints}
                    fill="url(#salesTrendGradient)"
                  />
                )}

                {/* Sales Line */}
                {salesPolyline && (
                  <polyline
                    fill="none"
                    stroke="#f97316"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={salesPolyline}
                  />
                )}

                {/* Orders Line */}
                {ordersPolyline && (
                  <polyline
                    fill="none"
                    stroke="#0ea5e9"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={ordersPolyline}
                  />
                )}

                {/* Hover Guideline & Data Points */}
                {hoveredIdx !== null && salesPoints[hoveredIdx] && ordersPoints[hoveredIdx] && (
                  <g pointerEvents="none">
                    <line
                      x1={salesPoints[hoveredIdx].x}
                      y1={0}
                      x2={salesPoints[hoveredIdx].x}
                      y2={chartHeight}
                      stroke="#cbd5e1"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />
                    <circle
                      cx={salesPoints[hoveredIdx].x}
                      cy={salesPoints[hoveredIdx].y}
                      r="5"
                      className="fill-orange-500 stroke-white stroke-2 shadow-md"
                    />
                    <circle
                      cx={ordersPoints[hoveredIdx].x}
                      cy={ordersPoints[hoveredIdx].y}
                      r="4.5"
                      className="fill-sky-500 stroke-white stroke-2 shadow-md"
                    />
                  </g>
                )}
              </svg>

              {/* Invisible interactive hover slices */}
              <div className="absolute inset-0 flex">
                {chartData.map((_, idx) => (
                  <div
                    key={idx}
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    className="flex-1 h-full cursor-crosshair"
                  />
                ))}
              </div>

              {/* Floating Tooltip */}
              {hoveredItem && hoveredIdx !== null && (
                <div
                  style={{
                    left: `${chartData.length > 1 ? (hoveredIdx / (chartData.length - 1)) * 100 : 50}%`,
                    transform: hoveredIdx > chartData.length * 0.7 ? 'translateX(-105%)' : hoveredIdx < chartData.length * 0.3 ? 'translateX(5%)' : 'translateX(-50%)',
                  }}
                  className="absolute top-2 z-30 px-3 py-2 bg-slate-900/95 text-white text-xs rounded-xl shadow-xl pointer-events-none whitespace-nowrap backdrop-blur-xs transition-transform duration-75"
                >
                  <div className="font-semibold text-slate-300 text-[11px] mb-1">
                    {hoveredItem.fullDate || hoveredItem.label}
                  </div>
                  <div className="flex items-center gap-1.5 text-orange-400 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-orange-500" />
                    Sales: PKR {Number(hoveredItem.sales || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                  <div className="flex items-center gap-1.5 text-sky-400 font-semibold mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-sky-500" />
                    Orders: {hoveredItem.orders}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Y-Axis: Orders */}
          <div className="flex flex-col justify-between pl-3 text-xs font-medium text-slate-400 select-none pb-7 text-right">
            {rightYTicks.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </div>

        {/* X-Axis Date Labels with clean non-overlapping spacing */}
        <div className="relative pl-12 sm:pl-14 pr-8 sm:pr-10 pt-2 border-t border-slate-200 h-7 select-none">
          {visibleXTicks.map((tick) => {
            const leftPercent = chartData.length > 1 ? (tick.index / (chartData.length - 1)) * 100 : 50;
            let transformClass = '-translate-x-1/2';
            if (tick.index === 0) transformClass = 'translate-x-0';
            else if (tick.index === chartData.length - 1) transformClass = '-translate-x-full';

            return (
              <span
                key={tick.index}
                style={{ left: `${leftPercent}%` }}
                className={`absolute text-xs font-medium text-slate-400 whitespace-nowrap ${transformClass}`}
              >
                {tick.label}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SalesOrdersTrendChart;
