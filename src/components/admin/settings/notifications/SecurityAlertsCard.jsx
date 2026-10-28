import { CircleCheckIcon, LockIcon } from '@/icons';

export const SecurityAlertsCard = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900">
            Essential security alerts
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            New sign-ins, password changes, two-factor updates and admin access changes.
          </p>
        </div>

        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 shrink-0">
          Always on
        </span>
      </div>

      <div className="flex items-center justify-between gap-3 p-3.5 bg-slate-50/70 border border-slate-200/60 rounded-xl">
        <div className="flex items-center gap-2.5">
          <CircleCheckIcon className="w-4 h-4 text-emerald-600 shrink-0" />
          <p className="text-xs text-slate-600">
            Delivered in-app and by email. These alerts cannot be disabled to help keep your account and marketplace secure.
          </p>
        </div>
        <LockIcon size={16} className="text-slate-400 shrink-0" animateOnHover={false} />
      </div>
    </div>
  );
};

export default SecurityAlertsCard;
