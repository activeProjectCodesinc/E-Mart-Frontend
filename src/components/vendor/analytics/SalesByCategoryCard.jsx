import { useState } from 'react';
import { ChevronDownIcon } from '@/icons';
import { CATEGORY_SALES_DATA } from '@/mock/vendor/vendorAnalytics.mock';
import DonutChart from './DonutChart';

export const SalesByCategoryCard = ({
  data = CATEGORY_SALES_DATA,
  totalSales = 'PKR 0',
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState('This Month');

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight">
          Sales by Category
        </h3>

        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 hover:border-slate-300 transition-colors cursor-pointer"
        >
          <span>{selectedPeriod}</span>
          <ChevronDownIcon size={14} className="text-slate-400" />
        </button>
      </div>

      <DonutChart
        data={data && data.length > 0 ? data : CATEGORY_SALES_DATA}
        centerPrimary={totalSales}
        centerSecondary="CATEGORY SALES"
      />
    </div>
  );
};

export default SalesByCategoryCard;
