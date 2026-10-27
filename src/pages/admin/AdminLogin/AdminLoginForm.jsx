import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { LockIcon, EyeIcon, EyeOffIcon, MailIcon, ArrowRightIcon } from '@/icons';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Checkbox } from '@/components/common/Checkbox';
import { GoogleButton } from '@/components/common/GoogleButton';
import { toast } from '@/utils/toast';
import { slideUp } from '@/animation/animations';

import { post } from '@/services/apiServices';
import { setAccessToken, setRefreshToken } from '@/services/tokenService';

export const AdminLoginForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
    rememberMe: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = formData.identifier.trim();
    if (!email) {
      toast.error('Please enter your email address.');
      return;
    }
    if (!formData.password) {
      toast.error('Please enter your password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await post('/auth/admin/login', {
        email,
        password: formData.password,
      });

      const twoFactor = res?.data?.twoFactor || res?.twoFactor;
      const tokens = res?.data?.tokens || res?.tokens;
      const user = res?.data?.user || res?.user;
      const admin = res?.data?.admin || res?.admin;

      if (twoFactor) {
        toast.info(
          twoFactor.status === 'setup_required'
            ? 'Pair your Google Authenticator app.'
            : 'Enter 6-digit code from Google Authenticator.'
        );
        navigate('/admin/2fa', {
          state: {
            flow: 'login',
            email,
            setupRequired: twoFactor.status === 'setup_required',
            otpauthUrl: twoFactor.otpauthUrl,
            secret: twoFactor.secret,
            challengeToken: twoFactor.challengeToken,
            expiresInSec: twoFactor.expiresInSec,
          },
        });
      } else if (tokens?.accessToken) {
        setAccessToken(tokens.accessToken);
        if (tokens.refreshToken) {
          setRefreshToken(tokens.refreshToken);
        }
        if (user) {
          localStorage.setItem('adminUser', JSON.stringify(user));
        }
        if (admin) {
          localStorage.setItem('adminAccess', JSON.stringify(admin));
        }
        toast.success('Welcome back, Admin!');
        navigate('/admin/store/dashboard');
      } else {
        toast.success('Logged in successfully!');
        navigate('/admin/store/dashboard');
      }
    } catch (err) {
      toast.error(err?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    const emailToUse = formData.identifier.trim() || 'admin@emart.com';
    toast.info('Verification code sent for password recovery.');
    navigate('/admin/2fa', {
      state: { flow: 'forgot-password', email: emailToUse },
    });
  };

  return (
    <motion.div
      variants={slideUp}
      initial="hidden"
      animate="visible"
      className="w-full max-w-md bg-white rounded-3xl p-7 sm:p-10 shadow-2xl shadow-slate-900/10 border border-slate-100/80"
    >
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
          Welcome Back
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Login to your admin account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        <Input
          label="Email Address"
          type="email"
          placeholder="Enter your email address"
          value={formData.identifier}
          onChange={(e) => setFormData((prev) => ({ ...prev, identifier: e.target.value }))}
          icon={<MailIcon size={18} />}
          required
        />

        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Enter your password"
          value={formData.password}
          onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
          icon={<LockIcon size={18} />}
          required
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              tabIndex={-1}
            >
              {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
            </button>
          }
        />

        <div className="flex items-center justify-between text-xs pt-0.5">
          <Checkbox
            label="Remember me"
            checked={formData.rememberMe}
            onChange={(e) => setFormData((prev) => ({ ...prev, rememberMe: e.target.checked }))}
          />

          <button
            type="button"
            onClick={handleForgotPassword}
            className="font-semibold text-orange-600 hover:text-orange-700 transition-colors cursor-pointer"
          >
            Forgot Password?
          </button>
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full py-3 sm:py-3.5 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-orange-600/25 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Login</span>
            <ArrowRightIcon size={16} />
          </Button>
        </div>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 tracking-wider">
            OR
          </span>
        </div>
      </div>

      <GoogleButton onClick={() => toast.info('Google admin sign-in triggered.')} />
    </motion.div>
  );
};

export default AdminLoginForm;
