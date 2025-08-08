import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Lock, CheckCircle, AlertCircle, Shield, Eye, EyeOff, Timer } from 'lucide-react';
import { authAPI } from '../services/api';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    email: location.state?.email || '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpInputsRef = useRef([]);

  const canResend = useMemo(() => resendCooldown === 0, [resendCooldown]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
    if (message) setMessage(null);
  };

  const requestCode = async (e) => {
    e?.preventDefault();
    if (!form.email) {
      setError({ message: 'Email is required' });
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await authAPI.requestPasswordReset(form.email);
      setMessage({ type: 'info', text: 'Verification code sent to your email (expires in 5 minutes).' });
      setStep(2);
      setResendCooldown(60);
      // Focus first OTP input if using segmented UI
      if (otpInputsRef.current[0]) {
        otpInputsRef.current[0].focus();
      }
    } catch (err) {
      const data = err.response?.data;
      if (data?.errorCode === 'RESEND_COOLDOWN' && typeof data.timeRemaining === 'number') {
        setResendCooldown(data.timeRemaining);
      }
      setError({ message: data?.message || 'Failed to send code' });
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    if (!form.email) return setError({ message: 'Email is required' });
    if (!form.otp) return setError({ message: 'Verification code is required' });
    if (!form.newPassword) return setError({ message: 'New password is required' });
    if (form.newPassword.length < 8) return setError({ message: 'Password must be at least 8 characters long' });
    if (!/[a-z]/.test(form.newPassword)) return setError({ message: 'Password must include at least one lowercase letter' });
    if (!/[A-Z]/.test(form.newPassword)) return setError({ message: 'Password must include at least one uppercase letter' });
    if (!/[0-9]/.test(form.newPassword)) return setError({ message: 'Password must include at least one number' });
    if (!/[^A-Za-z0-9]/.test(form.newPassword)) return setError({ message: 'Password must include at least one special character' });
    if (!form.confirmPassword) return setError({ message: 'Please confirm your new password' });
    if (form.confirmPassword !== form.newPassword) return setError({ message: 'Passwords do not match' });
    setLoading(true);
    setError(null);
    try {
      await authAPI.resetPasswordWithOTP({
        email: form.email,
        otp: form.otp,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword
      });
      setMessage({ type: 'success', text: 'Password reset successful. You can now sign in.' });
      setTimeout(() => navigate('/login', { state: { email: form.email, clearErrors: true } }), 800);
    } catch (err) {
      const data = err.response?.data;
      setError({ message: data?.message || 'Failed to reset password', extra: data?.suggestions?.[0] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#FAF7F2' }}>
      <div className="w-full max-w-md">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
          <Link to="/login" className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <div className="text-3xl font-bold text-gray-900 mb-2">FitMe+</div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Forgot Password</h1>
            <p className="text-gray-600">Reset your password securely with email verification</p>
          </div>

          {message && (
            <div className={`mb-4 rounded-lg p-3 text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
              <div className="flex items-center gap-2">
                {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                <span>{message.text}</span>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-lg p-3 text-sm bg-red-50 text-red-700">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{error.message}</span>
              </div>
            </div>
          )}

          {step === 1 && (
            <form onSubmit={requestCode} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={onChange}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none"
                  />
                </div>
              </div>
              <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.98 }} className="w-full bg-black text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50">
                {loading ? 'Sending...' : 'Send Verification Code'}
              </motion.button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={resetPassword} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Verification code</label>
                <div className="grid grid-cols-6 gap-2">
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpInputsRef.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      className="text-center text-lg py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none"
                      value={form.otp[idx] || ''}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, '').slice(0, 1);
                        const next = (form.otp || '').split('');
                        next[idx] = v;
                        const joined = next.join('');
                        setForm((prev) => ({ ...prev, otp: joined }));
                        if (v && idx < 5 && otpInputsRef.current[idx + 1]) {
                          otpInputsRef.current[idx + 1].focus();
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !form.otp[idx] && idx > 0) {
                          otpInputsRef.current[idx - 1]?.focus();
                        }
                      }}
                    />
                  ))}
                </div>
                <p className="mt-2 text-xs text-gray-500">Enter the 6-digit code sent to {form.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="newPassword"
                    value={form.newPassword}
                    onChange={onChange}
                    placeholder="Enter new password"
                    className="w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 border-gray-300"
                  />
                  <button type="button" aria-label="Toggle password visibility" className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600" onClick={() => setShowPassword((s) => !s)}>
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm new password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={onChange}
                    placeholder="Re-enter new password"
                    className="w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 border-gray-300"
                  />
                  <button type="button" aria-label="Toggle confirm password visibility" className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600" onClick={() => setShowConfirm((s) => !s)}>
                    {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.98 }} className="w-full bg-black text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50">
                {loading ? 'Resetting...' : 'Reset Password'}
              </motion.button>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <span className="inline-flex items-center gap-1">
                  <Timer className="w-4 h-4" />
                  {canResend ? 'You can resend a new code.' : `You can resend in ${resendCooldown}s`}
                </span>
                <button
                  type="button"
                  disabled={!canResend}
                  onClick={requestCode}
                  className={`underline ${canResend ? 'text-gray-900 hover:opacity-80' : 'text-gray-400 cursor-not-allowed'}`}
                >
                  Resend
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword;


