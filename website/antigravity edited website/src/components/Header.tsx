import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Zap, Brain, TrendingUp } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-6 shadow-lg">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="text-3xl"
            >
              <Brain size={32} />
            </motion.div>
            <div>
              <h1 className="text-3xl font-bold">BodyScan AI</h1>
              <p className="text-primary-100 text-sm">3D Body Measurement System</p>
            </div>
          </div>
          <div className="hidden md:flex gap-2 text-xs text-primary-100">
            <div className="flex items-center gap-1 bg-white/10 px-3 py-2 rounded-full">
              <Zap size={14} />
              <span>AI Powered</span>
            </div>
            <div className="flex items-center gap-1 bg-white/10 px-3 py-2 rounded-full">
              <TrendingUp size={14} />
              <span>21 Measurements</span>
            </div>
          </div>
        </motion.div>
      </div>
    </header>
  );
};

