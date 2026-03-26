import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { AuthService } from '../services/auth';
import { Mail, Lock, User, Eye, EyeOff, UserPlus, ArrowRight, Loader2, Phone } from 'lucide-react';
import toast from 'react-hot-toast';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '643891790108-lcj3pd5fllo90ai6hord7j2q44sh1c65.apps.googleusercontent.com';

// ============================================
// TYPES
// ============================================
interface RegisterFormProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

// ============================================
// MAIN COMPONENT
// ============================================
export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onSwitchToLogin }) => {
  // ========== STATE (PRESERVED) ==========
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Google Sign-In handler
  const handleGoogleAuth = useCallback(async (credentialResponse: any) => {
    setGoogleLoading(true);
    try {
      await AuthService.googleAuth(credentialResponse.credential);
      toast.success('Account created with Google!');
      onSuccess();
    } catch (error: any) {
      const message = error?.response?.data?.detail || 'Google sign-up failed';
      toast.error(message);
    } finally {
      setGoogleLoading(false);
    }
  }, [onSuccess]);

  // Initialize Google Sign-In
  useEffect(() => {
    const initGoogle = () => {
      if ((window as any).google?.accounts?.id) {
        (window as any).google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleAuth,
        });
        const btnContainer = document.getElementById('google-signin-btn-register');
        if (btnContainer) {
          (window as any).google.accounts.id.renderButton(btnContainer, {
            theme: 'filled_black',
            size: 'large',
            width: '100%',
            text: 'signup_with',
            shape: 'pill',
          });
        }
      }
    };

    if ((window as any).google?.accounts?.id) {
      initGoogle();
    } else {
      const timer = setInterval(() => {
        if ((window as any).google?.accounts?.id) {
          clearInterval(timer);
          initGoogle();
        }
      }, 200);
      return () => clearInterval(timer);
    }
  }, [handleGoogleAuth]);

  // ========== HANDLERS (PRESERVED) ==========
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Email and password are required');
      return;
    }

    setIsLoading(true);
    try {
      await AuthService.register({
        email,
        password,
        full_name: fullName || undefined,
        phone_number: phoneNumber || undefined
      });
      toast.success('Account created successfully!');
      onSuccess();
    } catch (error: any) {
      console.error('Registration error:', error);
      console.error('Error response:', error?.response);
      const message = error?.response?.data?.detail || error?.message || 'Registration failed. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // ========== RENDER ==========
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bento-card-premium p-8 max-w-md w-full"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.1 }}
          className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-4 shadow-lg shadow-purple-500/25"
        >
          <UserPlus className="w-8 h-8 text-white" />
        </motion.div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Create Account</h2>
        <p className="text-slate-300 mt-2 text-sm">Join BodyScan AI to save your measurements</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Full Name */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">
            Full Name <span className="text-slate-400">(Optional)</span>
          </label>
          <div className="flex items-center gap-3 bg-white rounded-xl border border-slate-200 px-4 py-3.5 focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all duration-300">
            <User className="text-slate-400 w-5 h-5 flex-shrink-0" />
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="flex-1 bg-transparent text-slate-900 placeholder:text-slate-400 outline-none"
              placeholder="John Doe"
            />
          </div>
        </div>

        {/* Phone Number */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">
            WhatsApp Number <span className="text-slate-400">(Recommended)</span>
          </label>
          <div className="flex items-center gap-3 bg-white rounded-xl border border-slate-200 px-4 py-3.5 focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all duration-300">
            <Phone className="text-slate-400 w-5 h-5 flex-shrink-0" />
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="flex-1 bg-transparent text-slate-900 placeholder:text-slate-400 outline-none"
              placeholder="+91 98765 43210"
            />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Get payment receipts and updates on WhatsApp
          </p>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">
            Email <span className="text-rose-400">*</span>
          </label>
          <div className="flex items-center gap-3 bg-white rounded-xl border border-slate-200 px-4 py-3.5 focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all duration-300">
            <Mail className="text-slate-400 w-5 h-5 flex-shrink-0" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-transparent text-slate-900 placeholder:text-slate-400 outline-none"
              placeholder="you@example.com"
              required
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">
            Password <span className="text-rose-400">*</span>
          </label>
          <div className="flex items-center gap-3 bg-white rounded-xl border border-slate-200 px-4 py-3.5 focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all duration-300">
            <Lock className="text-slate-400 w-5 h-5 flex-shrink-0" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 bg-transparent text-slate-900 placeholder:text-slate-400 outline-none"
              placeholder="••••••••"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-slate-500 hover:text-slate-700 transition-colors flex-shrink-0"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-2">Minimum 6 characters</p>
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isLoading}
          whileHover={{ scale: isLoading ? 1 : 1.01 }}
          whileTap={{ scale: isLoading ? 1 : 0.99 }}
          className="btn-gradient w-full py-4 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Creating account...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              Create Account
              <ArrowRight className="w-5 h-5" />
            </span>
          )}
        </motion.button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-slate-700/50" />
        <span className="text-xs text-slate-400">or</span>
        <div className="flex-1 h-px bg-slate-700/50" />
      </div>

      {/* Google Sign-Up */}
      <div className="flex justify-center">
        <div id="google-signin-btn-register" style={{ minHeight: 44 }} />
      </div>
      {googleLoading && (
        <div className="flex items-center justify-center gap-2 mt-3 text-sm text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          Creating account with Google...
        </div>
      )}

      {/* Switch to Login */}
      <div className="mt-8 pt-6 border-t border-slate-700/50 text-center">
        <p className="text-sm text-slate-400">
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-accent-400 hover:text-accent-300 font-semibold transition-colors"
          >
            Sign In
          </button>
        </p>
      </div>
    </motion.div>
  );
};

export default RegisterForm;
