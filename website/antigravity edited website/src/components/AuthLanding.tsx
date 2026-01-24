import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthService } from '../services/auth';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { Brain, Sparkles, Zap, TrendingUp, BarChart3, ArrowRight, Stars } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Orbs */}
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-20 left-20 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, -60, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, 60, 0],
            y: [0, -80, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"
        />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-20" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Hero Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            className="text-white space-y-8"
          >
            {/* Logo & Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-4 mb-6"
            >
              <motion.div
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
                  scale: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
                }}
                className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl"
              >
                <Brain className="text-white" size={40} />
              </motion.div>
              <div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                  BodyScan AI
                </h1>
                <p className="text-purple-300 text-sm">3D Body Measurement System</p>
              </div>
            </motion.div>

            {/* Main Heading */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-6xl md:text-7xl font-extrabold leading-tight"
            >
              Measure Your Body
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-pulse">
                In 3D
              </span>
            </motion.h2>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-purple-200 leading-relaxed max-w-lg"
            >
              Get accurate body measurements using AI-powered 3D reconstruction. 
              Upload your photos and receive detailed measurements in seconds.
            </motion.p>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-2 gap-4 mt-8"
            >
              {[
                { icon: Zap, text: 'AI Powered', color: 'from-yellow-400 to-orange-500' },
                { icon: BarChart3, text: '21 Measurements', color: 'from-blue-400 to-cyan-500' },
                { icon: TrendingUp, text: 'Size Recommendations', color: 'from-green-400 to-emerald-500' },
                { icon: Sparkles, text: '3D Visualization', color: 'from-pink-400 to-purple-500' },
              ].map((feature, index) => (
                <motion.div
                  key={feature.text}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center`}>
                    <feature.icon className="text-white" size={20} />
                  </div>
                  <span className="text-white font-semibold">{feature.text}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="flex gap-8 pt-4"
            >
              <div>
                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  99.9%
                </div>
                <div className="text-sm text-purple-300">Accuracy</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                  &lt;30s
                </div>
                <div className="text-sm text-purple-300">Processing</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
                  21+
                </div>
                <div className="text-sm text-purple-300">Measurements</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side - Auth Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            className="flex justify-center lg:justify-end"
          >
            <div className="w-full max-w-md">
              {/* View Toggle */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-6 flex gap-2 bg-white/10 backdrop-blur-sm rounded-2xl p-1 border border-white/20"
              >
                <motion.button
                  onClick={() => setAuthView('login')}
                  className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 relative ${
                    authView === 'login'
                      ? 'text-white'
                      : 'text-purple-300 hover:text-white'
                  }`}
                >
                  {authView === 'login' && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10">Sign In</span>
                </motion.button>
                <motion.button
                  onClick={() => setAuthView('register')}
                  className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 relative ${
                    authView === 'register'
                      ? 'text-white'
                      : 'text-purple-300 hover:text-white'
                  }`}
                >
                  {authView === 'register' && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10">Sign Up</span>
                </motion.button>
              </motion.div>

              {/* Auth Forms */}
              <AnimatePresence mode="wait">
                {authView === 'login' ? (
                  <motion.div
                    key="login"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
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
                    transition={{ duration: 0.3 }}
                  >
                    <RegisterForm
                      onSuccess={handleAuthSuccess}
                      onSwitchToLogin={() => setAuthView('login')}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Trust Badge */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-6 flex items-center justify-center gap-2 text-purple-300 text-sm"
              >
                <Stars className="text-yellow-400" size={16} />
                <span>Secure & Private</span>
                <span>•</span>
                <span>No Data Storage</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Floating Particles */}
      {[...Array(20)].map((_, i) => {
        const randomX = Math.random() * 100;
        const randomDelay = Math.random() * 2;
        const randomDuration = Math.random() * 3 + 2;
        
        return (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            style={{
              left: `${randomX}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: randomDuration,
              repeat: Infinity,
              delay: randomDelay,
              ease: 'easeInOut',
            }}
          />
        );
      })}
    </div>
  );
};
