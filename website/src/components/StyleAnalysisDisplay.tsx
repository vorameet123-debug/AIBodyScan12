import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Award, CheckCircle, AlertCircle } from 'lucide-react';
import { StyleAnalysis } from '../services/api';

interface StyleAnalysisDisplayProps {
  analysis: StyleAnalysis;
}

export const StyleAnalysisDisplay: React.FC<StyleAnalysisDisplayProps> = ({ analysis }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 shadow-bento border border-slate-200/60"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
          <Sparkles className="text-purple-600" size={20} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">Style Analysis</h3>
          <p className="text-slate-500 text-sm">Style compatibility with your body type</p>
        </div>
      </div>

      {/* Body Type */}
      <div className="mb-5 p-4 bg-slate-50 rounded-xl border border-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">Body Type</p>
            <p className="text-xl font-bold text-slate-900 capitalize">
              {analysis.body_type.replace('_', ' ')}
            </p>
          </div>
          <Award className="text-indigo-400" size={28} />
        </div>
        <p className="text-sm text-slate-600 mt-2">{analysis.body_type_description}</p>
      </div>

      {/* Style Compatibility Score */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-600">Style Compatibility</span>
          <span className="text-2xl font-bold text-slate-900">
            {analysis.style_compatibility.toFixed(0)}%
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${analysis.style_compatibility}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-indigo-500"
          />
        </div>
      </div>

      {/* Description */}
      <div className="mb-5 p-4 bg-white rounded-xl border border-slate-100">
        <p className="text-slate-700 text-sm">{analysis.description}</p>
      </div>

      {/* Recommended Styles */}
      {analysis.recommended_styles.length > 0 && (
        <div className="mb-5">
          <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
            <CheckCircle className="text-emerald-500" size={14} />
            Recommended Styles
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {analysis.recommended_styles.map((style, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium border border-emerald-100"
              >
                {style}
              </motion.span>
            ))}
          </div>
        </div>
      )}

      {/* Styles to Avoid */}
      {analysis.styles_to_avoid.length > 0 && (
        <div className="mb-5">
          <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
            <AlertCircle className="text-amber-500" size={14} />
            Styles to Avoid
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {analysis.styles_to_avoid.map((style, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-medium border border-amber-100"
              >
                {style}
              </motion.span>
            ))}
          </div>
        </div>
      )}

      {/* Occasion Notes */}
      {analysis.occasion_notes.length > 0 && (
        <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 mb-4">
          <p className="text-xs text-blue-800 font-medium">
            {analysis.occasion_notes[0]}
          </p>
        </div>
      )}

      {/* Overall Recommendation */}
      <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
        <p className="text-sm font-medium text-indigo-900">{analysis.overall_recommendation}</p>
      </div>
    </motion.div>
  );
};
