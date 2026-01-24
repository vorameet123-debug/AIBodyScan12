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
        return 'from-emerald-500 to-emerald-600';
      case 'good':
        return 'from-blue-500 to-indigo-500';
      case 'fair':
        return 'from-amber-500 to-orange-500';
      case 'tight':
        return 'from-red-500 to-rose-500';
      case 'loose':
        return 'from-amber-400 to-orange-400';
      case 'poor':
        return 'from-red-500 to-red-600';
      default:
        return 'from-slate-500 to-slate-600';
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-2xl p-6 shadow-bento border border-slate-200/60"
    >
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
            <Ruler className="text-indigo-600" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Fit Analysis</h3>
            <p className="text-slate-500 text-sm">How well this clothing will fit you</p>
          </div>
        </div>

        {/* Fit Confidence Score - Clean Circular Gauge */}
        <div className="mb-6 flex flex-col items-center justify-center">
          <div className="relative w-40 h-40">
            <svg className="w-full h-full transform -rotate-90">
              {/* Background Circle */}
              <circle
                cx="80"
                cy="80"
                r="72"
                className="stroke-slate-100"
                strokeWidth="10"
                fill="none"
              />
              {/* Progress Circle */}
              <motion.circle
                cx="80"
                cy="80"
                r="72"
                stroke="currentColor"
                strokeWidth="10"
                fill="none"
                strokeLinecap="round"
                className={`${analysis.fit_status === 'perfect' ? 'text-emerald-500' : analysis.fit_status === 'good' ? 'text-blue-500' : analysis.fit_status === 'fair' ? 'text-amber-500' : 'text-red-500'}`}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: analysis.fit_confidence / 100 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </svg>

            {/* Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-4xl font-bold text-slate-900"
              >
                {analysis.fit_confidence.toFixed(0)}%
              </motion.span>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide mt-1">Match</span>
            </div>
          </div>
        </div>

        {/* Fit Status */}
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className={`mb-5 p-4 rounded-xl bg-gradient-to-r ${getFitStatusColor(analysis.fit_status)} text-white`}
        >
          <div className="flex items-center gap-3">
            <StatusIcon size={22} />
            <div>
              <p className="font-bold capitalize">{analysis.fit_status} Fit</p>
              <p className="text-sm opacity-90">
                {analysis.fit_status.toLowerCase() === 'perfect' && 'This size should fit you perfectly!'}
                {analysis.fit_status.toLowerCase() === 'good' && 'This size should fit you well.'}
                {analysis.fit_status.toLowerCase() === 'tight' && 'This garment runs tight. Consider sizing up.'}
                {analysis.fit_status.toLowerCase() === 'loose' && 'This garment runs large. Consider sizing down.'}
                {['fair', 'poor'].includes(analysis.fit_status.toLowerCase()) && 'This size may not be ideal.'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Problem Areas */}
        {analysis.problem_areas.length > 0 && (
          <div className="mb-5">
            <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <AlertTriangle className="text-amber-500" size={16} />
              Problem Areas
            </h4>
            <div className="space-y-2">
              {analysis.problem_areas.map((area, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-3 rounded-xl border-l-4 ${area.severity === 'high'
                    ? 'bg-red-50 border-red-500'
                    : 'bg-amber-50 border-amber-500'
                    }`}
                >
                  <p className="font-semibold text-slate-800 text-sm">{area.area}</p>
                  <p className="text-xs text-slate-600">{area.issue}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Alternative Sizes */}
        {analysis.alternative_sizes.length > 0 && (
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <TrendingUp className="text-indigo-500" size={16} />
              Alternative Sizes
            </h4>
            <div className="grid grid-cols-3 gap-3">
              {analysis.alternative_sizes.map((alt, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-center"
                >
                  <p className="text-xl font-bold text-slate-900 mb-1">
                    {alt.size}
                  </p>
                  <p className="text-xs font-semibold text-indigo-600">
                    {alt.fit_confidence.toFixed(0)}% fit
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
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
