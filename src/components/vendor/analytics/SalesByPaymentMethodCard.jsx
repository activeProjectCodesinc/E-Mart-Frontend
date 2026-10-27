import { PAYMENT_METHOD_DATA } from '@/mock/vendor/vendorAnalytics.mock';
import DonutChart from './DonutChart';

export const SalesByPaymentMethodCard = ({
  data = PAYMENT_METHOD_DATA,
  totalSales = 'PKR 0',
}) => {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
      <div className="mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight">
          Sales by Payment Method
        </h3>
      </div>

      <DonutChart
        data={data && data.length > 0 ? data : PAYMENT_METHOD_DATA}
        centerPrimary={totalSales}
        centerSecondary="PAYMENT TOTAL"
      />
    </div>
  );
};

export default SalesByPaymentMethodCard;
