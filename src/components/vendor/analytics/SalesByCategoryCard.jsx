import { useState, useEffect } from 'react';
import { CATEGORY_SALES_DATA } from '@/mock/vendor/vendorAnalytics.mock';
import DonutChart from './DonutChart';
import PeriodSelectDropdown from './PeriodSelectDropdown';

export const SalesByCategoryCard = ({
  data = CATEGORY_SALES_DATA,
  totalSales = 'PKR 0',
  period = 'This Month',
  onPeriodChange = null,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState(period);

  useEffect(() => {
    if (period) setSelectedPeriod(period);
  }, [period]);

  const handleSelectPeriod = (presetId, label) => {
    setSelectedPeriod(label);
    if (onPeriodChange) onPeriodChange(presetId, label);
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight">
          Sales by Category
        </h3>

        <PeriodSelectDropdown
          selectedPeriod={selectedPeriod}
          onSelectPeriod={handleSelectPeriod}
        />
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
