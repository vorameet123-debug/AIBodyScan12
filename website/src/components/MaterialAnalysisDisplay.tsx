import React from 'react';
import { motion } from 'framer-motion';
import { Package, Wind, Droplet, Thermometer, AlertTriangle, CheckCircle } from 'lucide-react';
import { MaterialAnalysis } from '../services/api';

interface MaterialAnalysisDisplayProps {
  analysis: MaterialAnalysis;
}

export const MaterialAnalysisDisplay: React.FC<MaterialAnalysisDisplayProps> = ({ analysis }) => {
  const getSuitabilityBg = (suitability: string) => {
    switch (suitability.toLowerCase()) {
      case 'excellent':
        return 'bg-emerald-50 text-emerald-900';
      case 'good':
        return 'bg-blue-50 text-blue-900';
      case 'fair':
        return 'bg-amber-50 text-amber-900';
      case 'poor':
        return 'bg-rose-50 text-rose-900';
      default:
        return 'bg-slate-50 text-slate-900';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900 rounded-2xl p-6 shadow-bento border border-slate-700/60"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
          <Package className="text-emerald-600" size={20} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">Material Comfort</h3>
          <p className="text-slate-500 text-sm">Material properties and comfort analysis</p>
        </div>
      </div>

      {/* Overall Comfort Score */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-600">Comfort Score</span>
          <span className="text-2xl font-bold text-slate-900">
            {analysis.comfort_score.toFixed(0)}%
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${analysis.comfort_score}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-emerald-500"
          />
        </div>
      </div>

      {/* Material Properties Grid */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {[
          { icon: Wind, label: 'Breathability', value: analysis.breathability, color: 'bg-blue-50', iconColor: 'text-blue-600' },
          { icon: Droplet, label: 'Moisture Wicking', value: analysis.moisture_wicking, color: 'bg-purple-50', iconColor: 'text-purple-600' },
          { icon: Thermometer, label: 'Warmth', value: analysis.warmth, color: 'bg-orange-50', iconColor: 'text-orange-600' },
          { icon: Thermometer, label: 'Coolness', value: analysis.coolness, color: 'bg-teal-50', iconColor: 'text-teal-600' },
        ].map((prop, index) => {
          const Icon = prop.icon;
          return (
            <motion.div
              key={prop.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 ${prop.color} rounded-xl border border-slate-100`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className={prop.iconColor} size={16} />
                <span className="text-xs font-medium text-slate-600">{prop.label}</span>
              </div>
              <p className="text-xl font-bold text-slate-900">
                {prop.value}/100
              </p>
              <div className="mt-2 h-1 bg-white/60 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${prop.value}%` }}
                  transition={{ delay: 0.3 + index * 0.1, duration: 0.8 }}
                  className="h-full bg-slate-400"
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Suitability */}
      <div className={`mb-5 p-4 rounded-xl ${getSuitabilityBg(analysis.suitability)}`}>
        <div className="flex items-center gap-3">
          {analysis.suitability === 'excellent' || analysis.suitability === 'good' ? (
            <CheckCircle size={20} />
          ) : (
            <AlertTriangle size={20} />
          )}
          <div>
            <p className="font-semibold capitalize text-sm">{analysis.suitability} Suitability</p>
            <p className="text-xs opacity-80">
              Occasion: {analysis.occasion_suitability} • Climate: {analysis.climate_suitability}
            </p>
          </div>
        </div>
      </div>

      {/* Best For */}
      {analysis.best_for.length > 0 && (
        <div className="mb-5">
          <h4 className="text-sm font-semibold text-slate-900 mb-2">Best For</h4>
          <div className="flex flex-wrap gap-1.5">
            {analysis.best_for.map((item, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium border border-emerald-100"
              >
                {item}
              </motion.span>
            ))}
          </div>
        </div>
      )}

      {/* Warnings */}
      {analysis.warnings.length > 0 && (
        <div className="mb-5">
          <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
            <AlertTriangle className="text-amber-500" size={14} />
            Warnings
          </h4>
          <div className="space-y-1.5">
            {analysis.warnings.map((warning, index) => (
              <div
                key={index}
                className="p-2.5 bg-amber-50 border-l-2 border-amber-400 rounded-lg"
              >
                <p className="text-xs text-amber-800">{warning}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Care Instructions */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
        <p className="text-xs font-medium text-slate-600 mb-1">Care Instructions</p>
        <p className="text-sm text-slate-700">{analysis.care_instructions}</p>
        <p className="text-xs text-slate-500 mt-2">Shrinkage Risk: {analysis.shrinkage_risk}</p>
      </div>
    </motion.div>
  );
};
