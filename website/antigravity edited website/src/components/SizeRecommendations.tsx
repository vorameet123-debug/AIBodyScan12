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
      className="bg-white rounded-2xl p-8 shadow-lg"
    >
      <div className="flex items-center gap-2 mb-8">
        <ShoppingBag className="text-primary-600" size={28} />
        <h2 className="text-2xl font-bold text-gray-800">Size Recommendations</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {categories.map(([category, sizeData], index) => {
          const sizeString = getSizeString(sizeData);
          const confidence = getConfidence(sizeData);
          
          return (
            <motion.div
              key={category}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gradient-to-br from-primary-500 to-primary-700 p-6 rounded-xl text-white shadow-lg hover:shadow-xl transition"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold capitalize">
                  {category.replace(/_/g, ' ')}
                </h3>
                <div className="text-primary-100">
                  {getCategoryIcon(category)}
                </div>
              </div>
              <p className="text-4xl font-bold">{sizeString}</p>
              <div className="flex items-center justify-between mt-2">
                <p className="text-primary-100 text-sm">Recommended size</p>
                {confidence !== null && (
                  <p className="text-primary-100 text-xs">
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

