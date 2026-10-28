import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from '@/utils/toast';
import { XIcon, LockIcon } from '@/icons';
import { post } from '@/services/apiServices';
import { apiRoutes } from '@/services/apiRoutes';

export const TwoFactorModal = ({ isOpen, onClose, onComplete }) => {
  const [code, setCode] = useState('');
  const [setupData, setSetupData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSetupData(null);
      setCode('');
      return;
    }
    const fetchSetup = async () => {
      setIsLoading(true);
      try {
        const res = await post(apiRoutes.auth.admin2faSetup);
        const data = res?.data || res;
        setSetupData(data);
      } catch (err) {
        toast.error(err?.message || 'Failed to initialize two-factor setup.');
        onClose();
      } finally {
        setIsLoading(false);
      }
    };
    fetchSetup();
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopyKey = () => {
    if (!setupData?.secret) return;
    navigator.clipboard.writeText(setupData.secret);
    setCopied(true);
    toast.success('Setup key copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEnable2FA = async (e) => {
    e.preventDefault();
    if (code.length < 6) {
      toast.error('Please enter the 6-digit code from Google Authenticator.');
      return;
    }
    setIsVerifying(true);
    try {
      await post(apiRoutes.auth.admin2faEnable, { code });
      toast.success('Two-factor authentication enabled successfully!');
      onComplete();
      onClose();
    } catch (err) {
      toast.error(err?.message || 'Verification failed. Please recheck your code.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200/80 flex items-center justify-center text-orange-600 shrink-0">
              <LockIcon size={18} animateOnHover={false} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Set Up Two-Factor Auth
              </h3>
              <p className="text-xs text-slate-500">Google Authenticator Barcode</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <XIcon size={18} />
          </button>
        </div>

        {isLoading ? (
          <div className="p-10 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-500 font-medium">Generating barcode & secret key...</p>
          </div>
        ) : (
          <form onSubmit={handleEnable2FA} className="p-6 space-y-4">
            <p className="text-xs text-slate-600 text-center">
              Scan this barcode in Google Authenticator, then enter the 6-digit confirmation code.
            </p>

            {/* Barcode & Key Box */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col items-center">
              <div className="p-2.5 bg-white rounded-xl shadow-xs border border-slate-200">
                {setupData?.otpauthUrl ? (
                  <QRCodeSVG value={setupData.otpauthUrl} size={145} level="M" />
                ) : (
                  <div className="w-[145px] h-[145px] flex items-center justify-center text-xs text-slate-400">
                    Generating...
                  </div>
                )}
              </div>

              {setupData?.secret && (
                <div className="w-full mt-3">
                  <span className="text-[11px] text-slate-400 font-medium block mb-1 text-center">
                    Setup Key (Manual entry)
                  </span>
                  <div className="flex items-center justify-between gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs">
                    <span className="font-mono text-slate-700 tracking-wider truncate select-all font-semibold">
                      {setupData.secret}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyKey}
                      className="text-orange-600 hover:text-orange-700 font-semibold cursor-pointer shrink-0"
                    >
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                6-Digit Authenticator Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full px-3.5 py-2.5 text-center font-mono tracking-widest text-lg bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 shadow-2xs"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isVerifying || code.length < 6}
                className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-semibold shadow-xs shadow-orange-500/25 transition-all cursor-pointer"
              >
                {isVerifying ? 'Verifying...' : 'Enable 2FA'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default TwoFactorModal;
