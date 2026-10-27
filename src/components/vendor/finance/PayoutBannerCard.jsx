import { useAnimatedIcon } from '@/utils/useAnimatedIcon';
import { CreditCardIcon } from '@/icons';

export const PayoutBannerCard = ({
  amount = 'PKR 0.00',
  nextDate = 'Next Cycle',
  onRequestPayout,
}) => {
  const [iconRef, trigger] = useAnimatedIcon();

  return (
    <div
      onMouseEnter={trigger.onMouseEnter}
      onMouseLeave={trigger.onMouseLeave}
      className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
    >
      <div className="flex items-center gap-3.5 sm:gap-4">
        <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-200/70 text-orange-500 flex items-center justify-center shrink-0">
          <CreditCardIcon ref={iconRef} size={24} animateOnHover={false} />
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Available Payout
          </span>
          <p className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
            {amount}
          </p>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Next cycle: {nextDate}
          </p>
        </div>
      </div>

      <div className="flex flex-col items-start sm:items-end gap-1">
        <button
          type="button"
          onClick={onRequestPayout}
          className="w-full sm:w-auto px-5 py-2.5 bg-orange-500 hover:bg-orange-600 active:scale-98 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-sm shadow-orange-500/20 transition-all cursor-pointer"
        >
          Request New Payout
        </button>
        <span className="text-[11px] text-slate-400 font-medium">
          Available if balance is at least PKR 500.00
        </span>
      </div>
    </div>
  );
};

export default PayoutBannerCard;
