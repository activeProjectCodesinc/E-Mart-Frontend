import { useState } from 'react';
import { WalletIcon, XIcon, SendIcon } from '@/icons';
import RequestPayoutPresets from './RequestPayoutPresets';
import RequestPayoutMethodCard from './RequestPayoutMethodCard';

export const RequestPayoutModal = ({
  isOpen,
  availableBalance = 540.0,
  bankAccount,
  onClose,
  onSubmitPayout,
}) => {
  const [amount, setAmount] = useState(500);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSelectPreset = (val) => {
    setAmount(val);
    setError('');
  };

  const handleSelectMax = () => {
    setAmount(availableBalance);
    setError('');
  };

  const handleChangeAmount = (e) => {
    const val = parseFloat(e.target.value) || 0;
    setAmount(val);
    if (val < 500) {
      setError('Minimum payout amount is PKR 500.00.');
    } else if (val > availableBalance) {
      setError('Amount exceeds available balance.');
    } else {
      setError('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (amount < 500) {
      setError('Minimum payout amount is PKR 500.00.');
      return;
    }
    if (amount > availableBalance) {
      setError('Amount exceeds available balance.');
      return;
    }
    onSubmitPayout(amount, notes);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200/60 text-orange-500 flex items-center justify-center shrink-0 mt-0.5">
              <WalletIcon size={20} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight">
                Request Payout
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Enter the amount you want to withdraw to your store bank account.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <XIcon size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-orange-500/20">
              <WalletIcon size={20} />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-amber-800/80 uppercase tracking-wider">
                Available Balance
              </span>
              <p className="text-xl sm:text-2xl font-semibold text-slate-900">
                PKR {Number(availableBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Payout Amount (PKR)
            </label>
            <div className="relative">
              <input
                type="number"
                min="500"
                max={availableBalance}
                step="0.01"
                required
                value={amount}
                onChange={handleChangeAmount}
                className="w-full pl-4 pr-16 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 pointer-events-none">
                PKR
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-1">
              Minimum withdrawal amount is PKR 500.00.
            </p>
            {error && (
              <p className="text-xs text-rose-500 font-semibold mt-1">
                {error}
              </p>
            )}
          </div>

          <RequestPayoutPresets
            amount={amount}
            availableBalance={availableBalance}
            onSelectPreset={handleSelectPreset}
            onSelectMax={handleSelectMax}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Withdrawal Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Monthly earnings withdrawal"
              className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
          </div>

          <RequestPayoutMethodCard bankAccount={bankAccount} />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-98 text-white text-xs sm:text-sm font-semibold shadow-sm shadow-orange-500/20 transition-all cursor-pointer"
            >
              <SendIcon size={15} />
              <span>Request Payout</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestPayoutModal;
