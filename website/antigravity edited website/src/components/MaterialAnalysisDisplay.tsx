import React from 'react';
import { motion } from 'framer-motion';
import { Package, Wind, Droplet, Thermometer, AlertTriangle, CheckCircle } from 'lucide-react';
import { MaterialAnalysis } from '../services/api';

interface MaterialAnalysisDisplayProps {
  analysis: MaterialAnalysis;
}

export const MaterialAnalysisDisplay: React.FC<MaterialAnalysisDisplayProps> = ({ analysis }) => {
  const getSuitabilityColor = (suitability: string) => {
    switch (suitability.toLowerCase()) {
      case 'excellent':
        return 'from-green-500 to-emerald-500';
      case 'good':
        return 'from-blue-500 to-cyan-500';
      case 'fair':
        return 'from-yellow-500 to-orange-500';
      case 'poor':
        return 'from-red-500 to-pink-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotateX: -15 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 15 }}
      whileHover={{ scale: 1.01, y: -5 }}
      className="relative bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border-2 border-white/30 overflow-hidden group"
    >
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50/30 via-emerald-50/30 to-teal-50/30" />
      <motion.div
        animate={{
          background: [
            'radial-gradient(circle at 0% 0%, rgba(16, 185, 129, 0.15) 0%, transparent 50%)',
            'radial-gradient(circle at 100% 100%, rgba(5, 150, 105, 0.15) 0%, transparent 50%)',
            'radial-gradient(circle at 0% 0%, rgba(16, 185, 129, 0.15) 0%, transparent 50%)',
          ],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-0"
      />
      
      {/* Floating Sparkles */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 bg-green-400 rounded-full opacity-40"
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
          <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
            <Package className="text-white" size={28} />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Material Comfort
            </h3>
            <p className="text-gray-600 text-sm">Material properties and comfort analysis</p>
          </div>
        </div>

        {/* Overall Comfort Score - Enhanced */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">Comfort Score</span>
            <motion.span
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-3xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"
            >
              {analysis.comfort_score.toFixed(0)}%
            </motion.span>
          </div>
          <div className="relative w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${analysis.comfort_score}%` }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              className="relative h-full bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg"
            >
              {/* Shine effect */}
              <motion.div
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
              />
            </motion.div>
            {/* Glow effect */}
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 opacity-30 blur-md"
              style={{ width: `${analysis.comfort_score}%` }}
            />
          </div>
        </div>

        {/* Material Properties Grid - Enhanced with 3D Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[
            { icon: Wind, label: 'Breathability', value: analysis.breathability, color: 'from-blue-500 to-cyan-500', bg: 'from-blue-50 to-cyan-50', border: 'border-blue-200', iconColor: 'text-blue-600' },
            { icon: Droplet, label: 'Moisture Wicking', value: analysis.moisture_wicking, color: 'from-purple-500 to-pink-500', bg: 'from-purple-50 to-pink-50', border: 'border-purple-200', iconColor: 'text-purple-600' },
            { icon: Thermometer, label: 'Warmth', value: analysis.warmth, color: 'from-orange-500 to-red-500', bg: 'from-orange-50 to-red-50', border: 'border-orange-200', iconColor: 'text-orange-600' },
            { icon: Thermometer, label: 'Coolness', value: analysis.coolness, color: 'from-teal-500 to-cyan-500', bg: 'from-teal-50 to-cyan-50', border: 'border-teal-200', iconColor: 'text-teal-600' },
          ].map((prop, index) => {
            const Icon = prop.icon;
            return (
              <motion.div
                key={prop.label}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: index * 0.1, type: 'spring', stiffness: 200 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className={`relative p-5 bg-gradient-to-br ${prop.bg} rounded-2xl border-2 ${prop.border} shadow-lg group overflow-hidden`}
              >
                {/* Animated background */}
                <motion.div
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className={`absolute inset-0 bg-gradient-to-br ${prop.color} opacity-0 group-hover:opacity-10 transition-opacity`}
                />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    >
                      <Icon className={prop.iconColor} size={22} />
                    </motion.div>
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">{prop.label}</span>
                  </div>
                  <motion.p
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                    className={`text-3xl font-extrabold bg-gradient-to-r ${prop.color} bg-clip-text text-transparent`}
                  >
                    {prop.value}/100
                  </motion.p>
                  {/* Mini progress bar */}
                  <div className="mt-2 h-1 bg-white/50 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${prop.value}%` }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 1 }}
                      className={`h-full bg-gradient-to-r ${prop.color}`}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Suitability */}
        <div className={`mb-6 p-4 rounded-xl bg-gradient-to-r ${getSuitabilityColor(analysis.suitability)} text-white`}>
          <div className="flex items-center gap-3">
            {analysis.suitability === 'excellent' || analysis.suitability === 'good' ? (
              <CheckCircle size={24} />
            ) : (
              <AlertTriangle size={24} />
            )}
            <div>
              <p className="font-bold capitalize">{analysis.suitability} Suitability</p>
              <p className="text-sm opacity-90">
                Occasion: {analysis.occasion_suitability} • Climate: {analysis.climate_suitability}
              </p>
            </div>
          </div>
        </div>

        {/* Best For */}
        {analysis.best_for.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-bold text-gray-800 mb-3">Best For</h4>
            <div className="flex flex-wrap gap-2">
              {analysis.best_for.map((item, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="px-3 py-1.5 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-lg text-sm font-semibold border border-green-300"
                >
                  {item}
                </motion.span>
              ))}
            </div>
          </div>
        )}

        {/* Warnings */}
        {analysis.warnings.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <AlertTriangle className="text-orange-500" size={20} />
              Warnings
            </h4>
            <div className="space-y-2">
              {analysis.warnings.map((warning, index) => (
                <div
                  key={index}
                  className="p-3 bg-orange-50 border-l-4 border-orange-500 rounded-lg"
                >
                  <p className="text-sm text-orange-800">{warning}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Care Instructions */}
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
          <p className="text-sm font-semibold text-gray-700 mb-1">Care Instructions</p>
          <p className="text-sm text-gray-600">{analysis.care_instructions}</p>
          <p className="text-xs text-gray-500 mt-2">Shrinkage Risk: {analysis.shrinkage_risk}</p>
        </div>
      </div>
    </motion.div>
  );
};
