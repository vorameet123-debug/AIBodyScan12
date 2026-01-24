import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, TrendingUp, TrendingDown, Ruler } from 'lucide-react';
import { FitAnalysis } from '../services/api';

interface FitAnalysisDisplayProps {
  analysis: FitAnalysis;
}

export const FitAnalysisDisplay: React.FC<FitAnalysisDisplayProps> = ({ analysis }) => {
  const getFitStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'perfect':
        return 'from-green-500 to-emerald-500';
      case 'good':
        return 'from-blue-500 to-cyan-500';
      case 'fair':
        return 'from-yellow-500 to-orange-500';
      case 'tight':
        return 'from-red-500 to-orange-500';
      case 'loose':
        return 'from-yellow-400 to-orange-400';
      case 'poor':
        return 'from-red-500 to-pink-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getFitStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'perfect':
        return CheckCircle;
      case 'good':
        return CheckCircle;
      case 'fair':
        return AlertTriangle;
      case 'tight':
        return TrendingDown;
      case 'loose':
        return TrendingUp;
      case 'poor':
        return XCircle;
      default:
        return AlertTriangle;
    }
  };

  const StatusIcon = getFitStatusIcon(analysis.fit_status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotateX: -15 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 15 }}
      whileHover={{ scale: 1.01, y: -5 }}
      className="relative bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border-2 border-white/30 overflow-hidden group"
    >
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-purple-50/30 to-pink-50/30" />
      <motion.div
        animate={{
          background: [
            'radial-gradient(circle at 0% 0%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
            'radial-gradient(circle at 100% 100%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)',
            'radial-gradient(circle at 0% 0%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
          ],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-0"
      />

      {/* Floating Sparkles */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 bg-blue-400 rounded-full opacity-40"
          style={{
            left: `${20 + i * 15}%`,
            top: `${10 + i * 20}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.4, 0.8, 0.4],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.3,
            ease: 'easeInOut',
          }}
        />
      ))}

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
            <Ruler className="text-white" size={28} />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Fit Analysis
            </h3>
            <p className="text-gray-600 text-sm">How well this clothing will fit you</p>
          </div>
        </div>

        {/* Fit Confidence Score - Enhanced Circular Gauge */}
        <div className="mb-8 flex flex-col items-center justify-center">
          <div className="relative w-48 h-48">
            <svg className="w-full h-full transform -rotate-90">
              {/* Background Circle */}
              <circle
                cx="96"
                cy="96"
                r="88"
                className="stroke-gray-100"
                strokeWidth="12"
                fill="none"
              />
              {/* Progress Circle */}
              <motion.circle
                cx="96"
                cy="96"
                r="88"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                strokeLinecap="round"
                className={`text-${analysis.fit_status === 'perfect' ? 'green' : analysis.fit_status === 'good' ? 'blue' : analysis.fit_status === 'fair' ? 'yellow' : 'red'}-500 drop-shadow-lg`}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: analysis.fit_confidence / 100 }}
                transition={{ duration: 2, ease: "easeOut" }}
                style={{
                  strokeDasharray: "1 1", // Using pathLength for simplicity
                }}
              />
            </svg>

            {/* Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-5xl font-black bg-gradient-to-br from-gray-800 to-gray-600 bg-clip-text text-transparent"
              >
                {analysis.fit_confidence.toFixed(0)}%
              </motion.span>
              <span className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">Match</span>
            </div>

            {/* Orbiting Particle */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0"
            >
              <div className="w-full h-full relative">
                <motion.div
                  className={`absolute top-0 left-1/2 -translate-x-1/2 -mt-1 w-4 h-4 rounded-full bg-gradient-to-r ${getFitStatusColor(analysis.fit_status)} shadow-lg border-2 border-white`}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Fit Status */}
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className={`mb-6 p-4 rounded-xl bg-gradient-to-r ${getFitStatusColor(analysis.fit_status)} text-white`}
        >
          <div className="flex items-center gap-3">
            <StatusIcon size={24} />
            <div>
              <p className="font-bold text-lg capitalize">{analysis.fit_status} Fit</p>
              <p className="text-sm opacity-90">
                {analysis.fit_status.toLowerCase() === 'perfect' && 'This size should fit you perfectly! All measurements align well.'}
                {analysis.fit_status.toLowerCase() === 'good' && 'This size should fit you well. Minor variations are within acceptable range.'}
                {analysis.fit_status.toLowerCase() === 'tight' && 'This garment runs tight compared to your measurements. Consider sizing up.'}
                {analysis.fit_status.toLowerCase() === 'loose' && 'This garment runs large. You might prefer a smaller size for a fitted look.'}
                {['fair', 'poor'].includes(analysis.fit_status.toLowerCase()) && (
                  analysis.problem_areas.length > 0
                    ? 'This size has fit issues. See problem areas below for specific details.'
                    : 'This size may not be ideal based on the measurements.'
                )}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Problem Areas */}
        {analysis.problem_areas.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <AlertTriangle className="text-orange-500" size={20} />
              Problem Areas
            </h4>
            <div className="space-y-2">
              {analysis.problem_areas.map((area, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-3 rounded-lg border-l-4 ${area.severity === 'high'
                    ? 'bg-red-50 border-red-500'
                    : 'bg-yellow-50 border-yellow-500'
                    }`}
                >
                  <p className="font-semibold text-gray-800">{area.area}</p>
                  <p className="text-sm text-gray-600">{area.issue}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Alternative Sizes */}
        {analysis.alternative_sizes.length > 0 && (
          <div>
            <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <TrendingUp className="text-primary-500" size={20} />
              Alternative Sizes
            </h4>
            <div className="grid grid-cols-3 gap-3">
              {analysis.alternative_sizes.map((alt, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-gradient-to-br from-primary-50 to-purple-50 rounded-xl border-2 border-primary-200 text-center"
                >
                  <p className="text-2xl font-extrabold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent mb-1">
                    {alt.size}
                  </p>
                  <p className="text-sm font-semibold text-gray-700">
                    {alt.fit_confidence.toFixed(0)}% fit
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {alt.difference > 0 ? `+${alt.difference.toFixed(1)}cm` : `${alt.difference.toFixed(1)}cm`}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
