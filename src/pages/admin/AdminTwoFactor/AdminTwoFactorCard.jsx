import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import { ShieldAlertIcon, ArrowRightIcon } from '@/icons';
import { Button } from '@/components/common/Button';
import { toast } from '@/utils/toast';
import { slideUp } from '@/animation/animations';
import { post } from '@/services/apiServices';
import { setAccessToken, setRefreshToken } from '@/services/tokenService';

export const AdminTwoFactorCard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const setupRequired = location.state?.setupRequired || false;
  const otpauthUrl = location.state?.otpauthUrl || '';
  const secret = location.state?.secret || '';
  const challengeToken = location.state?.challengeToken || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(location.state?.expiresInSec || 300);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((p) => p - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    if (digit && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const newOtp = pasted.split('').concat(Array(6).fill('')).slice(0, 6);
    setOtp(newOtp);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleCopyKey = () => {
    if (!secret) return;
    navigator.clipboard.writeText(secret);
    setCopied(true);
    toast.success('Setup key copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) {
      toast.error('Please enter the 6-digit code.');
      return;
    }

    setIsLoading(true);
    try {
      if (challengeToken) {
        const res = await post('/auth/admin/2fa/verify', { challengeToken, code });
        const tokens = res?.data?.tokens || res?.tokens;
        const user = res?.data?.user || res?.user;
        const adminAccess = res?.data?.admin || res?.admin;

        if (tokens?.accessToken) setAccessToken(tokens.accessToken);
        if (tokens?.refreshToken) setRefreshToken(tokens.refreshToken);
        if (user) localStorage.setItem('adminUser', JSON.stringify(user));
        if (adminAccess) localStorage.setItem('adminAccess', JSON.stringify(adminAccess));
      }
      toast.success('Admin identity verified! Entering dashboard.');
      navigate('/admin/dashboard');
    } catch {
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      variants={slideUp}
      initial="hidden"
      animate="visible"
      className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl shadow-slate-900/10 border border-slate-100/80 text-center"
    >
      <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 mb-3 mx-auto">
        <ShieldAlertIcon size={24} />
      </div>

      <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
        {setupRequired ? 'Set Up Two-Factor Auth' : 'Two-Factor Authentication'}
      </h2>
      <p className="text-xs sm:text-sm text-slate-500 mt-1">
        {setupRequired
          ? 'Scan this barcode with Google Authenticator or enter setup key.'
          : 'Enter the 6-digit code from your Google Authenticator app.'}
      </p>

      {setupRequired && (
        <div className="my-5 p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col items-center">
          <div className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-200">
            {otpauthUrl ? (
              <QRCodeSVG value={otpauthUrl} size={150} level="M" />
            ) : (
              <div className="w-[150px] h-[150px] flex items-center justify-center bg-slate-100 text-xs text-slate-400">
                Barcode / QR Code
              </div>
            )}
          </div>

          {secret && (
            <div className="w-full mt-3">
              <span className="text-[11px] text-slate-400 font-medium block mb-1">
                Setup Key (Manual entry)
              </span>
              <div className="flex items-center justify-between gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs">
                <span className="font-mono text-slate-700 tracking-wider truncate select-all font-semibold">
                  {secret}
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
      )}

      <form onSubmit={handleVerify} className="mt-5 space-y-5">
        <div className="flex items-center justify-center gap-2 sm:gap-2.5" onPaste={handlePaste}>
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => (inputRefs.current[idx] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e.key)}
              className="w-10 h-11 sm:w-12 sm:h-13 text-center text-lg sm:text-xl font-semibold text-slate-900 bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
          ))}
        </div>

        <div className="text-xs text-slate-500">
          Code expires in:{' '}
          <span className="font-semibold text-orange-600 font-mono">
            {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
          </span>
        </div>

        <Button
          type="submit"
          isLoading={isLoading}
          className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-orange-600/25 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <span>Verify & Enter Dashboard</span>
          <ArrowRightIcon size={16} />
        </Button>
      </form>
    </motion.div>
  );
};

export default AdminTwoFactorCard;
