import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Award, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { StyleAnalysis } from '../services/api';

interface StyleAnalysisDisplayProps {
  analysis: StyleAnalysis;
}

export const StyleAnalysisDisplay: React.FC<StyleAnalysisDisplayProps> = ({ analysis }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotateX: -15 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 15 }}
      whileHover={{ scale: 1.01, y: -5 }}
      className="relative bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border-2 border-white/30 overflow-hidden group"
    >
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 via-pink-50/30 to-primary-50/30" />
      <motion.div
        animate={{
          background: [
            'radial-gradient(circle at 0% 0%, rgba(168, 85, 247, 0.15) 0%, transparent 50%)',
            'radial-gradient(circle at 100% 100%, rgba(236, 72, 153, 0.15) 0%, transparent 50%)',
            'radial-gradient(circle at 0% 0%, rgba(168, 85, 247, 0.15) 0%, transparent 50%)',
          ],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-0"
      />
      
      {/* Floating Sparkles */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 bg-purple-400 rounded-full opacity-40"
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
          <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
            <Sparkles className="text-white" size={28} />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Style Analysis
            </h3>
            <p className="text-gray-600 text-sm">Style compatibility with your body type</p>
          </div>
        </div>

        {/* Body Type - Enhanced */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="mb-6 p-5 bg-gradient-to-br from-purple-50 via-pink-50 to-primary-50 rounded-2xl border-2 border-purple-200 shadow-lg group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">Body Type</p>
              <motion.p
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-2xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent capitalize"
              >
                {analysis.body_type.replace('_', ' ')}
              </motion.p>
            </div>
            <motion.div
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Award className="text-purple-600" size={36} />
            </motion.div>
          </div>
          <p className="text-sm text-gray-600 mt-3 font-medium">{analysis.body_type_description}</p>
        </motion.div>

        {/* Style Compatibility Score - Enhanced */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">Style Compatibility</span>
            <motion.span
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-3xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
            >
              {analysis.style_compatibility.toFixed(0)}%
            </motion.span>
          </div>
          <div className="relative w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${analysis.style_compatibility}%` }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              className="relative h-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg"
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
              className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-30 blur-md"
              style={{ width: `${analysis.style_compatibility}%` }}
            />
          </div>
        </div>

        {/* Description */}
        <div className="mb-6 p-4 bg-white/80 rounded-xl">
          <p className="text-gray-700">{analysis.description}</p>
        </div>

        {/* Recommended Styles */}
        {analysis.recommended_styles.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <CheckCircle className="text-green-500" size={20} />
              Recommended Styles
            </h4>
            <div className="flex flex-wrap gap-2">
              {analysis.recommended_styles.map((style, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="px-3 py-1.5 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-lg text-sm font-semibold border border-green-300"
                >
                  {style}
                </motion.span>
              ))}
            </div>
          </div>
        )}

        {/* Styles to Avoid */}
        {analysis.styles_to_avoid.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <AlertCircle className="text-orange-500" size={20} />
              Styles to Avoid
            </h4>
            <div className="flex flex-wrap gap-2">
              {analysis.styles_to_avoid.map((style, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="px-3 py-1.5 bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 rounded-lg text-sm font-semibold border border-orange-300"
                >
                  {style}
                </motion.span>
              ))}
            </div>
          </div>
        )}

        {/* Occasion Notes */}
        {analysis.occasion_notes.length > 0 && (
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
            <p className="text-sm text-blue-800 font-medium">
              {analysis.occasion_notes[0]}
            </p>
          </div>
        )}

        {/* Overall Recommendation */}
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl border border-purple-300">
          <p className="text-sm font-bold text-purple-800">{analysis.overall_recommendation}</p>
        </div>
      </div>
    </motion.div>
  );
};
