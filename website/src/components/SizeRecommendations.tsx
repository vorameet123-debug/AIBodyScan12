import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Package, Shirt, Scissors, Sparkles } from 'lucide-react';
import { SizeRecommendation } from '../services/api';

interface SizeRecommendationsProps {
  recommendations: SizeRecommendation;
}

export const SizeRecommendations: React.FC<SizeRecommendationsProps> = ({
  recommendations,
}) => {
  const categories = Object.entries(recommendations);

  const getCategoryConfig = (category: string) => {
    const lower = category.toLowerCase();
    if (lower.includes('top') || lower.includes('shirt')) {
      return { icon: Shirt, gradient: 'from-violet-500 to-purple-600', glow: 'shadow-violet-500/20' };
    }
    if (lower.includes('pant') || lower.includes('bottom') || lower.includes('trouser')) {
      return { icon: Scissors, gradient: 'from-cyan-500 to-blue-600', glow: 'shadow-cyan-500/20' };
    }
    if (lower.includes('dress')) {
      return { icon: ShoppingBag, gradient: 'from-fuchsia-500 to-pink-600', glow: 'shadow-fuchsia-500/20' };
    }
    return { icon: Package, gradient: 'from-emerald-500 to-teal-600', glow: 'shadow-emerald-500/20' };
  };

  // Extract the actual size string from the value (could be string or object)
  const getSizeString = (value: any): string => {
    if (typeof value === 'string') {
      return value;
    }
    if (typeof value === 'object' && value !== null) {
      return value.recommended_size || value.size || 'N/A';
    }
    return 'N/A';
  };

  // Extract confidence if available
  const getConfidence = (value: any): number | null => {
    if (typeof value === 'object' && value !== null && typeof value.confidence === 'number') {
      return value.confidence;
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-600 flex items-center justify-center shadow-lg shadow-fuchsia-500/25">
          <ShoppingBag className="text-white" size={20} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Size Recommendations</h2>
          <p className="text-sm text-slate-400">AI-powered sizing across {categories.length} categories</p>
        </div>
      </div>

      {/* Size Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map(([category, sizeData], index) => {
          const sizeString = getSizeString(sizeData);
          const confidence = getConfidence(sizeData);
          const config = getCategoryConfig(category);
          const IconComponent = config.icon;

          return (
            <motion.div
              key={category}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: index * 0.1, type: 'spring', bounce: 0.3 }}
              whileHover={{ scale: 1.03, y: -4 }}
              className={`relative overflow-hidden bg-slate-800/60 backdrop-blur-sm p-5 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300 group`}
            >
              {/* Gradient Background Glow */}
              <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${config.gradient} opacity-20 blur-3xl rounded-full group-hover:opacity-30 transition-opacity`} />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {category.replace(/_/g, ' ')}
                  </span>
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-lg ${config.glow}`}>
                    <IconComponent size={14} className="text-white" />
                  </div>
                </div>

                <div className="mb-3">
                  <span className="text-4xl font-bold text-white tracking-tight">{sizeString}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Recommended</span>
                  {confidence !== null && (
                    <div className="flex items-center gap-1">
                      <Sparkles size={10} className="text-violet-400" />
                      <span className="text-xs font-medium text-violet-400">
                        {(confidence > 1 ? confidence : confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
