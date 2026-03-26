import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Zap, Brain, TrendingUp, Activity } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="relative overflow-hidden">
      {/* Premium Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900" />

      {/* Subtle mesh overlay */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto px-6 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between py-5"
        >
          {/* Logo & Brand */}
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 400 }}
              className="relative"
            >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent-400 to-purple-600 rounded-2xl blur-xl opacity-60" />

              {/* Icon container */}
              <div className="relative w-12 h-12 bg-gradient-to-br from-white to-slate-100 rounded-2xl flex items-center justify-center shadow-xl">
                <Sparkles className="text-slate-900 w-6 h-6" />
              </div>
            </motion.div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                BodyScan AI
              </h1>
              <p className="text-slate-400 text-xs font-medium tracking-wide">
                3D Body Intelligence
              </p>
            </div>
          </div>

          {/* Status Pills */}
          <div className="hidden md:flex items-center gap-3">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full border border-white/10"
            >
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-slate-300">AI Powered</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full border border-white/10"
            >
              <Activity className="w-3.5 h-3.5 text-accent-400" />
              <span className="text-xs font-medium text-slate-300">21 Metrics</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-accent-500/20 to-purple-500/20 backdrop-blur-sm rounded-full border border-accent-500/30"
            >
              <TrendingUp className="w-3.5 h-3.5 text-accent-400" />
              <span className="text-xs font-semibold text-white">99.9% Accuracy</span>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
    </header>
  );
};

