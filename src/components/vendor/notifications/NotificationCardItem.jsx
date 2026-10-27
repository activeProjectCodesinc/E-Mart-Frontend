import { useAnimatedIcon } from '@/utils/useAnimatedIcon';
import {
  ShieldAlertIcon,
  BadgeAlertIcon,
  TrashIcon,
  CartIcon,
  WalletIcon,
  MegaphoneIcon,
  StarIcon,
  TruckIcon,
  ArrowRightIcon,
} from '@/icons';

const ICON_CONFIG = {
  suspended: { icon: ShieldAlertIcon, bg: 'bg-rose-100/70 text-rose-500' },
  deactivated: { icon: BadgeAlertIcon, bg: 'bg-amber-100/70 text-amber-600' },
  removed: { icon: TrashIcon, bg: 'bg-rose-100/70 text-rose-500' },
  order: { icon: CartIcon, bg: 'bg-orange-50 text-orange-500' },
  payout: { icon: WalletIcon, bg: 'bg-emerald-50 text-emerald-500' },
  low_stock: { icon: BadgeAlertIcon, bg: 'bg-amber-50 text-amber-500' },
  promotion: { icon: MegaphoneIcon, bg: 'bg-purple-50 text-purple-500' },
  review: { icon: StarIcon, bg: 'bg-amber-50 text-amber-500' },
  delivery: { icon: TruckIcon, bg: 'bg-emerald-50 text-emerald-500' },
};

export const NotificationCardItem = ({ item, onViewDetails, onDelete, onMarkAsRead }) => {
  const [iconRef, trigger] = useAnimatedIcon();
  const conf = ICON_CONFIG[item.type] || ICON_CONFIG.order;
  const Icon = conf.icon;

  const isAlertCard = ['suspended', 'deactivated', 'removed'].includes(item.type);
  const cardBgClass =
    item.type === 'deactivated'
      ? 'bg-amber-50/40 border-amber-200/60'
      : isAlertCard
      ? 'bg-rose-50/40 border-rose-200/60'
      : item.unread
      ? 'bg-orange-50/20 border-orange-200/50'
      : 'bg-white border-slate-200/80';

  return (
    <div
      onMouseEnter={trigger.onMouseEnter}
      onMouseLeave={trigger.onMouseLeave}
      className={`rounded-2xl p-4 sm:p-5 border shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${cardBgClass}`}
    >
      <div className="flex items-start gap-3.5 min-w-0 flex-1">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${conf.bg}`}
        >
          <Icon ref={iconRef} size={20} animateOnHover={false} />
        </div>

        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-xs sm:text-sm font-semibold text-slate-900">
              {item.title}
            </h4>

            {item.status && (
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-semibold ${
                  item.statusColor === 'emerald'
                    ? 'bg-emerald-100/80 text-emerald-700'
                    : item.statusColor === 'amber'
                    ? 'bg-amber-100/80 text-amber-700'
                    : 'bg-rose-100/80 text-rose-600'
                }`}
              >
                {item.status}
              </span>
            )}
          </div>

          <p className="text-xs text-slate-600 font-normal leading-relaxed break-words">
            {item.message}
          </p>

          {item.meta && (
            <p className="text-[11px] text-slate-400 font-medium">
              {item.meta}
            </p>
          )}
        </div>
      </div>

      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">
            {item.time}
          </span>
          {item.unread && (
            <span
              onClick={() => onMarkAsRead?.(item.id)}
              title="Unread - click to mark read"
              className="w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0 cursor-pointer hover:scale-125 transition-transform"
            />
          )}
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(item.id)}
              className="p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer ml-1"
              title="Delete notification"
            >
              <TrashIcon size={14} />
            </button>
          )}
        </div>

        {item.hasDetails && (
          <button
            type="button"
            onClick={() => onViewDetails?.(item)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-700 transition-colors cursor-pointer group"
          >
            <span>View details</span>
            <ArrowRightIcon
              size={13}
              animateOnHover={false}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </button>
        )}
      </div>
    </div>
  );
};

export default NotificationCardItem;
