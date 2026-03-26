/**
 * Forgot Password + Reset Password Pages
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowLeft, Loader2, Check, Eye, EyeOff } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AuthService } from '../services/auth';

// ============================================
// FORGOT PASSWORD
// ============================================
export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email');
    setLoading(true);
    try {
      await AuthService.forgotPassword(email);
      setSent(true);
      toast.success('Reset link sent! Check your email.');
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </button>

        <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-700/60 p-8">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-violet-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Mail className="w-7 h-7 text-violet-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Forgot Password?</h1>
            <p className="text-slate-400 mt-2 text-sm">Enter your email and we'll send you a reset link</p>
          </div>

          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-3 bg-slate-800 rounded-xl px-4 py-3 border border-slate-700 focus-within:border-accent-500 transition-colors">
                <Mail className="w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 bg-transparent text-white placeholder:text-slate-500 outline-none text-sm"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 text-sm font-semibold text-white btn-gradient rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                Send Reset Link
              </button>
            </form>
          ) : (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-7 h-7 text-emerald-400" />
              </div>
              <p className="text-white font-medium">Check your email!</p>
              <p className="text-slate-400 text-sm mt-2">We've sent a password reset link to <strong className="text-white">{email}</strong></p>
              <p className="text-slate-500 text-xs mt-4">Didn't receive it? Check your spam folder or
                <button onClick={() => setSent(false)} className="text-accent-400 hover:text-accent-300 ml-1">try again</button>
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// ============================================
// RESET PASSWORD
// ============================================
export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return toast.error('Password must be at least 6 characters');
    if (password !== confirm) return toast.error('Passwords do not match');
    if (!token) return toast.error('Invalid reset link');

    setLoading(true);
    try {
      await AuthService.resetPassword(token, password);
      setDone(true);
      toast.success('Password reset! You can now log in.');
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to reset password. Link may be expired.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-white text-lg font-medium">Invalid reset link</p>
          <button onClick={() => navigate('/forgot-password')} className="text-accent-400 mt-4">Request a new one</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-700/60 p-8">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-violet-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock className="w-7 h-7 text-violet-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Set New Password</h1>
          </div>

          {!done ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">New Password</label>
                <div className="flex items-center gap-3 bg-slate-800 rounded-xl px-4 py-3 border border-slate-700 focus-within:border-accent-500 transition-colors">
                  <Lock className="w-4 h-4 text-slate-400" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="flex-1 bg-transparent text-white placeholder:text-slate-500 outline-none text-sm"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="text-slate-400 hover:text-white">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Confirm Password</label>
                <div className="flex items-center gap-3 bg-slate-800 rounded-xl px-4 py-3 border border-slate-700 focus-within:border-accent-500 transition-colors">
                  <Lock className="w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Confirm password"
                    className="flex-1 bg-transparent text-white placeholder:text-slate-500 outline-none text-sm"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 text-sm font-semibold text-white btn-gradient rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Reset Password
              </button>
            </form>
          ) : (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-7 h-7 text-emerald-400" />
              </div>
              <p className="text-white font-medium">Password Reset!</p>
              <button
                onClick={() => navigate('/')}
                className="mt-4 px-6 py-2.5 text-sm font-semibold text-white btn-gradient rounded-xl"
              >
                Go to Login
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
