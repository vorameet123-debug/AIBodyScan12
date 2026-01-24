import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { 
  Sparkles, Zap, TrendingUp, BarChart3, Target, ShoppingBag, 
  Brain, Package, Eye, Shield, Star, CheckCircle, ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

interface AuthLandingProps {
  onAuthSuccess: () => void;
}

export const AuthLanding: React.FC<AuthLandingProps> = ({ onAuthSuccess }) => {
  const [authView, setAuthView] = useState<'login' | 'register'>('login');

  const handleAuthSuccess = () => {
    toast.success('Welcome to BodyScan AI! 🚀');
    onAuthSuccess();
  };

  const features = [
    { icon: Target, text: 'AI Body Scan', color: 'from-violet-500 to-purple-500' },
    { icon: ShoppingBag, text: 'FitChecker AI', color: 'from-fuchsia-500 to-pink-500' },
    { icon: Brain, text: 'Fashion IQ', color: 'from-purple-500 to-indigo-500' },
    { icon: TrendingUp, text: 'Body Tracker', color: 'from-indigo-500 to-blue-500' },
    { icon: Package, text: 'Wardrobe Analytics', color: 'from-blue-500 to-cyan-500' },
    { icon: Eye, text: '3D Visualization', color: 'from-cyan-500 to-teal-500' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden flex">
      {/* Background Effects */}
      <div className="absolute inset-0">
        {/* Gradient Mesh */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-violet-600/20 via-purple-600/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-fuchsia-600/15 via-pink-600/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-gradient-to-br from-indigo-600/10 to-transparent rounded-full blur-3xl" />
        </div>
        
        {/* Dot Grid Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
        
        {/* Scan Lines Effect */}
        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.1)_50%)] bg-[size:100%_4px] opacity-10 pointer-events-none" />
      </div>

      {/* Left Panel - Branding & Features */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="hidden lg:flex lg:w-3/5 relative z-10 flex-col justify-between p-12 xl:p-16"
      >
        {/* Logo */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-4"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl blur-xl opacity-60" />
            <div className="relative w-14 h-14 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center border border-white/10">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">BodyScan</h1>
            <p className="text-xs font-medium text-violet-400 uppercase tracking-widest">AI Platform</p>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-center max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-violet-500/10 border border-violet-500/20 rounded-full text-violet-400 text-sm font-medium mb-8">
              <Zap className="w-4 h-4" />
              AI-Powered Body Intelligence
            </span>
            
            <h2 className="text-5xl xl:text-6xl font-bold text-white leading-tight mb-6">
              Your Body.{' '}
              <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
                Decoded.
              </span>
            </h2>
            
            <p className="text-xl text-slate-400 leading-relaxed mb-12">
              Get 21+ precise measurements from just 2 photos. Track your body changes,
              check clothing fits, and build your fashion intelligence — all powered by AI.
            </p>
          </motion.div>

          {/* Feature Pills */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 xl:grid-cols-3 gap-3 mb-12"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.text}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + index * 0.05 }}
                className="group flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 hover:border-white/10 transition-all cursor-default"
              >
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg`}>
                  <feature.icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
                  {feature.text}
                </span>
              </motion.div>
            ))}
          </motion.div>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex gap-8 xl:gap-12"
          >
            {[
              { value: '21+', label: 'Measurements' },
              { value: '<30s', label: 'Processing' },
              { value: '99.9%', label: 'Accuracy' },
            ].map((stat, idx) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl xl:text-4xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Footer Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex items-center gap-6 text-sm text-slate-500"
        >
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span>Secure & Private</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span>No Credit Card</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Right Panel - Auth Form */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full lg:w-2/5 relative z-10 flex items-center justify-center p-6 lg:p-12"
      >
        {/* Form Container */}
        <div className="w-full max-w-md">
          {/* Mobile Logo (shown only on mobile) */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:hidden flex items-center justify-center gap-3 mb-8"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">BodyScan AI</h1>
              <p className="text-xs text-violet-400">Body Intelligence Platform</p>
            </div>
          </motion.div>

          {/* Auth Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl"
          >
            {/* Tab Toggle */}
            <div className="flex gap-1 p-1 bg-slate-800/50 rounded-2xl mb-8">
              <button
                onClick={() => setAuthView('login')}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all relative ${
                  authView === 'login'
                    ? 'text-white'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                {authView === 'login' && (
                  <motion.div
                    layoutId="authTab"
                    className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl"
                    transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                  />
                )}
                <span className="relative z-10">Sign In</span>
              </button>
              <button
                onClick={() => setAuthView('register')}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all relative ${
                  authView === 'register'
                    ? 'text-white'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                {authView === 'register' && (
                  <motion.div
                    layoutId="authTab"
                    className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl"
                    transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                  />
                )}
                <span className="relative z-10">Sign Up</span>
              </button>
            </div>

            {/* Auth Forms */}
            <AnimatePresence mode="wait">
              {authView === 'login' ? (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <LoginForm
                    onSuccess={handleAuthSuccess}
                    onSwitchToRegister={() => setAuthView('register')}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="register"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <RegisterForm
                    onSuccess={handleAuthSuccess}
                    onSwitchToLogin={() => setAuthView('login')}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-8 text-center"
          >
            <div className="flex items-center justify-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-sm text-slate-500">
              Trusted by <span className="text-slate-400 font-medium">10,000+</span> users worldwide
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Animated Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-violet-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 0.8, 0],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </div>
  );
};
