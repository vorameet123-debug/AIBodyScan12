import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { AuthService } from '../services/auth';
import { Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '643891790108-lcj3pd5fllo90ai6hord7j2q44sh1c65.apps.googleusercontent.com';

// ============================================
// TYPES
// ============================================
interface LoginFormProps {
  onSuccess: () => void;
  onSwitchToRegister: () => void;
}

// ============================================
// MAIN COMPONENT
// ============================================
export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onSwitchToRegister }) => {
  // ========== STATE (PRESERVED) ==========
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Google Sign-In handler
  const handleGoogleAuth = useCallback(async (credentialResponse: any) => {
    setGoogleLoading(true);
    try {
      await AuthService.googleAuth(credentialResponse.credential);
      toast.success('Signed in with Google!');
      onSuccess();
    } catch (error: any) {
      const message = error?.response?.data?.detail || 'Google sign-in failed';
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
        const btnContainer = document.getElementById('google-signin-btn-login');
        if (btnContainer) {
          (window as any).google.accounts.id.renderButton(btnContainer, {
            theme: 'filled_black',
            size: 'large',
            width: '100%',
            text: 'signin_with',
            shape: 'pill',
          });
        }
      }
    };

    // Wait for script to load
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
      await AuthService.login({ email, password });
      toast.success('Logged in successfully!');
      onSuccess();
    } catch (error: any) {
      const message = error?.response?.data?.detail || 'Login failed';
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
      className="bento-card-premium p-6 max-w-md w-full"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.1 }}
          className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-accent-500 to-purple-500 rounded-2xl mb-4 shadow-lg shadow-accent-500/25"
        >
          <Sparkles className="w-8 h-8 text-white" />
        </motion.div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Welcome Back</h2>
        <p className="text-slate-300 mt-2 text-sm">Sign in to access your measurements</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">
            Email
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
            Password
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
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-slate-500 hover:text-slate-700 transition-colors flex-shrink-0"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Forgot Password */}
        <div className="text-right -mt-2">
          <a href="/forgot-password" className="text-xs text-accent-400 hover:text-accent-300 transition-colors">
            Forgot password?
          </a>
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
              Signing in...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              Sign In
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

      {/* Google Sign-In */}
      <div className="flex justify-center">
        <div id="google-signin-btn-login" style={{ minHeight: 44 }} />
      </div>
      {googleLoading && (
        <div className="flex items-center justify-center gap-2 mt-3 text-sm text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          Signing in with Google...
        </div>
      )}

      {/* Switch to Register */}
      <div className="mt-8 pt-6 border-t border-slate-700/50 text-center">
        <p className="text-sm text-slate-400">
          Don't have an account?{' '}
          <button
            onClick={onSwitchToRegister}
            className="text-accent-400 hover:text-accent-300 font-semibold transition-colors"
          >
            Sign Up
          </button>
        </p>
      </div>
    </motion.div>
  );
};

export default LoginForm;
