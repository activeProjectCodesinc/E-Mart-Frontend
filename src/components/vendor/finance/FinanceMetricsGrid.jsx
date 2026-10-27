import { useMemo } from 'react';
import { useAnimatedIcon } from '@/utils/useAnimatedIcon';
import {
  TrendingUpIcon,
  BadgePercentIcon,
  WalletIcon,
  ClockIcon,
} from '@/icons';

const DEFAULT_METRIC_CARDS = [
  {
    key: 'totalSales',
    title: 'Total Sales',
    value: 'PKR 0.00',
    icon: TrendingUpIcon,
    iconBg: 'bg-sky-50 text-sky-500 border-sky-100',
    badgeText: '0 delivered orders',
    badgeColor: 'text-slate-500',
  },
  {
    key: 'commissionFee',
    title: 'Commission Fee',
    value: 'PKR 0.00',
    icon: BadgePercentIcon,
    iconBg: 'bg-amber-50 text-amber-500 border-amber-100',
    badgeText: '10% of sales',
    badgeColor: 'text-slate-500',
  },
  {
    key: 'netEarnings',
    title: 'Net Earnings',
    value: 'PKR 0.00',
    icon: WalletIcon,
    iconBg: 'bg-emerald-50 text-emerald-500 border-emerald-100',
    badgeText: 'Earnings after platform commission',
    badgeColor: 'text-emerald-600',
  },
  {
    key: 'pendingPayout',
    title: 'Pending Payout',
    value: 'PKR 0.00',
    icon: ClockIcon,
    iconBg: 'bg-rose-50 text-rose-500 border-rose-100',
    badgeText: 'Next payout cycle',
    badgeColor: 'text-slate-500',
  },
];

const FinanceMetricCardItem = ({ card }) => {
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
        <p className={`text-xs mt-1 font-semibold ${card.badgeColor}`}>
          {card.badgeText}
        </p>
      </div>
    </div>
  );
};

export const FinanceMetricsGrid = ({ metrics = null }) => {
  const cards = useMemo(() => {
    if (Array.isArray(metrics)) return metrics;
    if (metrics && typeof metrics === 'object') {
      const formatPKR = (v) =>
        `PKR ${Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

      return [
        {
          key: 'totalSales',
          title: metrics.totalSales?.label || 'Total Sales',
          value: formatPKR(metrics.totalSales?.value ?? metrics.totalSales?.raw),
          icon: TrendingUpIcon,
          iconBg: 'bg-sky-50 text-sky-500 border-sky-100',
          badgeText:
            metrics.totalSales?.subtitle ||
            `${metrics.totalSales?.change != null ? (metrics.totalSales.change >= 0 ? '+' : '') + metrics.totalSales.change + '% ' : ''}delivered orders`,
          badgeColor: (metrics.totalSales?.change ?? 0) >= 0 ? 'text-emerald-600' : 'text-rose-600',
        },
        {
          key: 'commissionFee',
          title: metrics.commissionFee?.label || 'Commission Fee',
          value: formatPKR(metrics.commissionFee?.value ?? metrics.commissionFee?.raw),
          icon: BadgePercentIcon,
          iconBg: 'bg-amber-50 text-amber-500 border-amber-100',
          badgeText: metrics.commissionFee?.subtitle || `${metrics.commissionFee?.rate || '10%'} of sales`,
          badgeColor: 'text-slate-500',
        },
        {
          key: 'netEarnings',
          title: metrics.netEarnings?.label || 'Net Earnings',
          value: formatPKR(metrics.netEarnings?.value ?? metrics.netEarnings?.raw),
          icon: WalletIcon,
          iconBg: 'bg-emerald-50 text-emerald-500 border-emerald-100',
          badgeText:
            metrics.netEarnings?.subtitle ||
            `${metrics.netEarnings?.change != null ? (metrics.netEarnings.change >= 0 ? '+' : '') + metrics.netEarnings.change + '% ' : ''}after commission`,
          badgeColor: (metrics.netEarnings?.change ?? 0) >= 0 ? 'text-emerald-600' : 'text-rose-600',
        },
        {
          key: 'pendingPayout',
          title: metrics.pendingPayout?.label || 'Pending Payout',
          value: formatPKR(metrics.pendingPayout?.value ?? metrics.pendingPayout?.raw),
          icon: ClockIcon,
          iconBg: 'bg-rose-50 text-rose-500 border-rose-100',
          badgeText: metrics.pendingPayout?.subtitle || 'Next payout cycle',
          badgeColor: 'text-slate-500',
        },
      ];
    }
    return DEFAULT_METRIC_CARDS;
  }, [metrics]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
      {cards.map((card) => (
        <FinanceMetricCardItem key={card.key} card={card} />
      ))}
    </div>
  );
};

export default FinanceMetricsGrid;
