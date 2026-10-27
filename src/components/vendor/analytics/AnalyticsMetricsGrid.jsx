import { useMemo } from 'react';
import { useAnimatedIcon } from '@/utils/useAnimatedIcon';
import { CartIcon, BoxIcon, TrendingUpIcon } from '@/icons';

const MetricCardItem = ({ card }) => {
  const [iconRef, trigger] = useAnimatedIcon();
  const Icon = card.icon;

  return (
    <div
      onMouseEnter={trigger.onMouseEnter}
      onMouseLeave={trigger.onMouseLeave}
      className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs sm:text-sm font-medium text-slate-500">
          {card.title}
        </span>
        <div
          className={`w-9 h-9 rounded-xl border flex items-center justify-center ${card.iconBg}`}
        >
          <Icon ref={iconRef} size={18} animateOnHover={false} />
        </div>
      </div>

      <div className="mt-3">
        <p className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
          {card.value}
        </p>
        <p
          className={`text-xs mt-1 font-semibold ${
            card.isNegative ? 'text-rose-600' : 'text-emerald-600'
          }`}
        >
          {card.changeText}
        </p>
      </div>
    </div>
  );
};

export const AnalyticsMetricsGrid = ({ totals = null, metrics = null }) => {
  const cards = useMemo(() => {
    if (metrics && Array.isArray(metrics)) return metrics;

    if (totals) {
      const formatPKR = (val) =>
        `PKR ${Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

      const formatChange = (change) => {
        if (change == null) return 'Current month';
        const isUp = Number(change) >= 0;
        return `${isUp ? '↑ +' : '↓ '}${change}% from last period`;
      };

      return [
        {
          key: 'totalSales',
          title: 'Total Sales',
          value: formatPKR(totals.sales?.value),
          icon: CartIcon,
          iconBg: 'bg-orange-50 text-orange-500 border-orange-100',
          changeText: formatChange(totals.sales?.change),
          isNegative: (totals.sales?.change ?? 0) < 0,
        },
        {
          key: 'totalOrders',
          title: 'Total Orders',
          value: Number(totals.orders?.value ?? 0).toLocaleString(),
          icon: BoxIcon,
          iconBg: 'bg-emerald-50 text-emerald-500 border-emerald-100',
          changeText: formatChange(totals.orders?.change),
          isNegative: (totals.orders?.change ?? 0) < 0,
        },
        {
          key: 'avgOrderValue',
          title: 'Avg. Order Value (AOV)',
          value: formatPKR(totals.averageOrderValue?.value),
          icon: TrendingUpIcon,
          iconBg: 'bg-amber-50 text-amber-500 border-amber-100',
          changeText: formatChange(totals.averageOrderValue?.change),
          isNegative: (totals.averageOrderValue?.change ?? 0) < 0,
        },
      ];
    }

    return [
      {
        key: 'totalSales',
        title: 'Total Sales',
        value: 'PKR 0.00',
        icon: CartIcon,
        iconBg: 'bg-orange-50 text-orange-500 border-orange-100',
        changeText: '0% from last month',
      },
      {
        key: 'totalOrders',
        title: 'Total Orders',
        value: '0',
        icon: BoxIcon,
        iconBg: 'bg-emerald-50 text-emerald-500 border-emerald-100',
        changeText: '0% from last month',
      },
      {
        key: 'avgOrderValue',
        title: 'Avg. Order Value',
        value: 'PKR 0.00',
        icon: TrendingUpIcon,
        iconBg: 'bg-amber-50 text-amber-500 border-amber-100',
        changeText: '0% from last month',
      },
    ];
  }, [totals, metrics]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
      {cards.map((card) => (
        <MetricCardItem key={card.key} card={card} />
      ))}
    </div>
  );
};

export default AnalyticsMetricsGrid;
