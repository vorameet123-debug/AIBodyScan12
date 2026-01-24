import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Package, Shirt, Scissors } from 'lucide-react';
import { SizeRecommendation } from '../services/api';

interface SizeRecommendationsProps {
  recommendations: SizeRecommendation;
}

export const SizeRecommendations: React.FC<SizeRecommendationsProps> = ({
  recommendations,
}) => {
  const categories = Object.entries(recommendations);

  const getCategoryIcon = (category: string) => {
    const lower = category.toLowerCase();
    if (lower.includes('top') || lower.includes('shirt')) return <Shirt size={16} />;
    if (lower.includes('pant') || lower.includes('bottom') || lower.includes('trouser')) return <Scissors size={16} />;
    if (lower.includes('dress')) return <ShoppingBag size={16} />;
    return <Package size={16} />;
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
      className="bg-white rounded-2xl p-6 shadow-bento border border-slate-200/60"
    >
      <div className="flex items-center gap-2 mb-6">
        <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center">
          <ShoppingBag className="text-indigo-600" size={18} />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Size Recommendations</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {categories.map(([category, sizeData], index) => {
          const sizeString = getSizeString(sizeData);
          const confidence = getConfidence(sizeData);
          
          return (
            <motion.div
              key={category}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-slate-900 p-5 rounded-xl text-white hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-slate-300 capitalize">
                  {category.replace(/_/g, ' ')}
                </h3>
                <div className="text-slate-400">
                  {getCategoryIcon(category)}
                </div>
              </div>
              <p className="text-3xl font-bold">{sizeString}</p>
              <div className="flex items-center justify-between mt-2">
                <p className="text-slate-400 text-xs">Recommended size</p>
                {confidence !== null && (
                  <p className="text-indigo-400 text-xs font-medium">
                    {(confidence > 1 ? confidence : confidence * 100).toFixed(0)}% confidence
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

