import { useState } from 'react';
import { ChevronDownIcon, CheckIcon } from '@/icons';
import { useAnimatedIcon } from '@/utils/useAnimatedIcon';

const TAKE_AWAY_STEPS = [
  { id: 'placed', label: 'Order Placed (Counter)' },
  { id: 'prepared', label: 'Order Packed & Prepared' },
  { id: 'delivered', label: 'Handed Over & Collected' },
];

const DELIVERY_STEPS = [
  { id: 'placed', label: 'Order Placed' },
  { id: 'preparing', label: 'Preparing Items' },
  { id: 'assigned', label: 'Rider Assigned' },
  { id: 'out_delivery', label: 'Out for Delivery' },
  { id: 'delivered', label: 'Delivered to Customer' },
];

const STATUS_OPTIONS = [
  'New Order',
  'Processing',
  'Ready for Pickup',
  'Out for Delivery',
  'Delivered',
];

export const OrderStatusStepper = ({
  currentStatus,
  onStatusChange,
  deliveryType = 'take_away',
  timeline = [],
  placedAt = null,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [chevronRef, chevronTrigger] = useAnimatedIcon();

  const isTakeAway = deliveryType === 'take_away';
  const steps = isTakeAway ? TAKE_AWAY_STEPS : DELIVERY_STEPS;

  const isDelivered =
    currentStatus === 'Delivered' ||
    currentStatus === 'Completed' ||
    String(currentStatus).toLowerCase() === 'delivered';

  const getStepState = (stepIndex) => {
    if (isDelivered) return 'completed';
    const s = String(currentStatus || '').toLowerCase();
    if (isTakeAway) {
      if (s === 'processing' || s === 'preparing') return stepIndex <= 1 ? 'completed' : 'pending';
      return stepIndex === 0 ? 'completed' : 'pending';
    } else {
      if (s === 'out_for_delivery' || s === 'out for delivery') return stepIndex <= 3 ? 'completed' : 'pending';
      if (s === 'ready_for_pickup' || s === 'ready for pickup') return stepIndex <= 2 ? 'completed' : 'pending';
      if (s === 'processing' || s === 'preparing') return stepIndex <= 1 ? 'completed' : 'pending';
      return stepIndex === 0 ? 'completed' : 'pending';
    }
  };

  const formatStepTime = (idx) => {
    if (timeline && timeline.length > 0) {
      const match = timeline[idx] || timeline.find((t) => t.event?.toLowerCase() === steps[idx]?.id);
      if (match?.at) {
        return new Date(match.at).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });
      }
    }
    if (placedAt) {
      return new Date(placedAt).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    }
    return 'Completed';
  };

  return (
    <div
      onMouseEnter={chevronTrigger.onMouseEnter}
      onMouseLeave={chevronTrigger.onMouseLeave}
      className="p-5 bg-white rounded-2xl border border-slate-100 shadow-xs h-full flex flex-col justify-between hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
          Order Status
        </h3>

        {isDelivered ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            <CheckIcon size={12} />
            <span>Delivered & Finalized</span>
          </span>
        ) : (
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-orange-200 bg-orange-50/70 text-orange-600 font-semibold text-xs hover:bg-orange-100 transition-colors cursor-pointer"
            >
              <span>Update Status</span>
              <ChevronDownIcon ref={chevronRef} animateOnHover={false} size={12} />
            </button>

            {isOpen && (
              <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-20">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      onStatusChange(opt);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs transition-colors cursor-pointer ${
                      currentStatus === opt
                        ? 'bg-orange-500 text-white font-bold'
                        : 'text-slate-700 hover:bg-orange-50 hover:text-orange-600'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-4 relative pl-2">
        <div className="absolute top-2.5 bottom-3 left-[14px] w-0.5 bg-emerald-300 -z-0" />

        {steps.map((step, idx) => {
          const isDone = getStepState(idx) === 'completed';

          return (
            <div key={step.id} className="relative flex items-start gap-3.5 z-1">
              <div
                className={`w-3.5 h-3.5 rounded-full shrink-0 mt-0.5 transition-all ${
                  isDone
                    ? 'bg-emerald-500 ring-4 ring-emerald-100 shadow-xs'
                    : 'bg-slate-200 ring-2 ring-slate-100'
                }`}
              />

              <div className="min-w-0">
                <p
                  className={`text-xs font-bold leading-tight ${
                    isDone ? 'text-slate-900' : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {isDone ? formatStepTime(idx) : 'Pending'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderStatusStepper;
