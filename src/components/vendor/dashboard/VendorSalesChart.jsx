import { useState } from 'react';
import { motion } from 'motion/react';

export const VendorSalesChart = ({ data = [] }) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const maxValue = Math.max(...data.map((d) => d.value), 100);

  return (
    <div className="flex flex-col justify-between p-3.5 sm:p-5 bg-white rounded-2xl border border-slate-100 shadow-xs h-full">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="text-sm sm:text-base font-semibold text-slate-900 tracking-tight">
          Sales Overview
        </h3>
        <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400">Weekly</span>
      </div>

      <div className="relative flex items-end justify-between gap-1.5 sm:gap-3 h-40 sm:h-48 px-1 sm:px-2 pt-6 pb-1">
        {data.map((item, idx) => {
          const heightPercent = Math.round((item.value / maxValue) * 100);
          const isHovered = hoveredIdx === idx;

          return (
            <div
              key={item.day}
              className="relative flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -top-7 px-1.5 py-0.5 rounded-md bg-slate-900 text-white text-[9px] sm:text-[10px] font-bold shadow-md pointer-events-none z-10 whitespace-nowrap"
                >
                  {item.revenue ? `PKR ${Number(item.revenue).toLocaleString()}` : `${item.value} orders`}
                </motion.div>
              )}

              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${heightPercent}%` }}
                transition={{ duration: 0.6, delay: idx * 0.05, ease: 'easeOut' }}
                className={`w-full max-w-[20px] sm:max-w-[28px] rounded-t-md sm:rounded-t-lg transition-colors duration-200 ${
                  isHovered ? 'bg-orange-600 shadow-md shadow-orange-500/30' : 'bg-orange-500'
                }`}
              />

              <span
                className={`mt-2 text-[10px] sm:text-xs font-semibold transition-colors ${
                  isHovered ? 'text-orange-600 font-bold' : 'text-slate-400'
                }`}
              >
                {item.day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VendorSalesChart;
