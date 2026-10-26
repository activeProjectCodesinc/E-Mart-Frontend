import { motion } from 'motion/react';
import {
  CartIcon,
  DollarSignIcon,
  BoxesIcon,
  TruckIcon,
  UserIcon,
  TrendingUpIcon,
} from '@/icons';
import { ADMIN_STAT_CARDS } from '@/mock/admin/adminDashboard.mock';
import { useAnimatedIcon } from '@/utils/useAnimatedIcon';
import { staggerContainer, slideUp } from '@/animation/animations';

const STAT_ICONS = {
  orders: CartIcon,
  revenue: DollarSignIcon,
  vendors: BoxesIcon,
  riders: TruckIcon,
  customers: UserIcon,
};

const StatCardItem = ({ card }) => {
  const [iconRef, trigger] = useAnimatedIcon();
  const IconComponent = STAT_ICONS[card.id] || CartIcon;

  return (
    <motion.div
      variants={slideUp}
      onMouseEnter={trigger.onMouseEnter}
      onMouseLeave={trigger.onMouseLeave}
      className={`bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all cursor-pointer ${card.accentBorder} border-l-[3.5px] flex flex-col justify-between`}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[11px] font-medium text-slate-500 block">
            {card.title}
          </span>
          <h3 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight mt-1">
            {card.value}
          </h3>
        </div>

        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.iconBg} border border-current/15`}>
          <IconComponent ref={iconRef} size={18} />
        </div>
      </div>

      <div className="mt-3.5 flex items-center gap-1.5 text-[11px]">
        <span className="inline-flex items-center gap-0.5 text-emerald-600 font-semibold">
          <TrendingUpIcon size={12} />
          <span>{card.trend}</span>
        </span>
        <span className="text-slate-400">vs last week</span>
      </div>
    </motion.div>
  );
};

export const AdminStatCards = ({ stats = ADMIN_STAT_CARDS }) => {
  return (
    <motion.div
      variants={staggerContainer(0.08, 0.1)}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"
    >
      {stats.map((card) => (
        <StatCardItem key={card.id} card={card} />
      ))}
    </motion.div>
  );
};

export default AdminStatCards;
