import { CartIcon, CheckIcon, ClockIcon } from '@/icons';

export const TakeAwayInfoCard = ({ order }) => {
  const isDelivered = order.status === 'Delivered' || order.status === 'Completed';

  return (
    <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-xs h-full flex flex-col justify-between hover:shadow-md transition-shadow">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
            Order Fulfillment
          </h3>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            Take Away
          </span>
        </div>

        <div className="flex items-start gap-3.5 mb-3">
          <div className="w-11 h-11 rounded-2xl bg-orange-50 text-[#f95900] flex items-center justify-center shrink-0 border border-orange-100">
            <CartIcon size={20} />
          </div>

          <div className="space-y-1 min-w-0">
            <h4 className="text-sm font-bold text-slate-900">
              Counter Pickup Order
            </h4>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              {order.deliveryInstructions || 'POS Counter Order (Take Away)'}
            </p>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium">Pickup Status</span>
          <span
            className={`font-bold flex items-center gap-1 ${
              isDelivered ? 'text-emerald-600' : 'text-amber-600'
            }`}
          >
            {isDelivered ? <CheckIcon size={14} /> : <ClockIcon size={13} />}
            <span>{isDelivered ? 'Collected at Counter' : 'Ready for Collection'}</span>
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium">Delivery Fee</span>
          <span className="font-semibold text-slate-700">Rs. 0.00 (Self Pickup)</span>
        </div>
      </div>
    </div>
  );
};

export default TakeAwayInfoCard;
