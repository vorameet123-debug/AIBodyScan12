import React from 'react';
import { motion } from 'framer-motion';
import { Palette, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';
import { ColorAnalysis } from '../services/api';

interface ColorAnalysisDisplayProps {
  analysis: ColorAnalysis;
}

export const ColorAnalysisDisplay: React.FC<ColorAnalysisDisplayProps> = ({ analysis }) => {
  // Safe defaults for skin tone
  const skinTone = analysis.skin_tone || {
    tone_category: 'medium',
    description: 'Medium (default)',
    rgb_values: { r: 170, g: 140, b: 120 },
    confidence: 0.5
  };

  const getCompatibilityColor = (compatibility: string) => {
    switch (compatibility.toLowerCase()) {
      case 'excellent':
        return 'bg-emerald-500';
      case 'good':
        return 'bg-blue-500';
      case 'fair':
        return 'bg-amber-500';
      case 'poor':
        return 'bg-rose-500';
      default:
        return 'bg-slate-500';
    }
  };

  const getCompatibilityBg = (compatibility: string) => {
    switch (compatibility.toLowerCase()) {
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

  const rgbToHex = (r: number, g: number, b: number) => {
    return `#${[r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900 rounded-2xl p-6 shadow-bento border border-slate-700/60"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-accent-50 rounded-xl flex items-center justify-center">
          <Palette className="text-accent-500" size={20} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">Color Analysis</h3>
          <p className="text-slate-500 text-sm">Color compatibility with your skin tone</p>
        </div>
      </div>

      {/* Skin Tone */}
      <div className="mb-5 p-4 bg-slate-50 rounded-xl border border-slate-200/60">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-slate-600">Your Skin Tone (Auto-detected)</p>
          <div
            className="w-7 h-7 rounded-lg border-2 border-white shadow-sm"
            style={{
              backgroundColor: rgbToHex(
                skinTone.rgb_values?.r || 170,
                skinTone.rgb_values?.g || 140,
                skinTone.rgb_values?.b || 120
              )
            }}
          />
        </div>
        <p className="text-base font-bold text-slate-900">{skinTone.description || 'Medium (default)'}</p>
        <p className="text-xs text-slate-500 mt-1">
          Confidence: {skinTone.confidence ? (skinTone.confidence * 100).toFixed(0) : '50'}%
        </p>
      </div>

      {/* Color Match Score */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-600">Color Match Score</span>
          <span className="text-2xl font-bold text-slate-900">
            {analysis.match_score.toFixed(0)}%
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${analysis.match_score}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`h-full ${getCompatibilityColor(analysis.compatibility)}`}
          />
        </div>
      </div>

      {/* Primary Color */}
      <div className="mb-5 p-4 bg-slate-800 rounded-xl border border-slate-700/60">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-xl border-2 border-white shadow-sm"
            style={{
              backgroundColor: rgbToHex(
                analysis.primary_color.rgb.r,
                analysis.primary_color.rgb.g,
                analysis.primary_color.rgb.b
              )
            }}
          />
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Primary Color</p>
            <p className="text-lg font-bold text-slate-900">
              {analysis.primary_color.name}
            </p>
            {analysis.primary_color.percentage && (
              <p className="text-xs text-slate-500">{analysis.primary_color.percentage.toFixed(1)}% of garment</p>
            )}
          </div>
        </div>
      </div>

      {/* Recommendation */}
      <div className={`mb-5 p-4 rounded-xl ${getCompatibilityBg(analysis.compatibility)}`}>
        <div className="flex items-center gap-3">
          {analysis.compatibility === 'excellent' || analysis.compatibility === 'good' ? (
            <CheckCircle size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          <p className="font-medium text-sm">{analysis.recommendation}</p>
        </div>
      </div>

      {/* Alternative Colors */}
      {analysis.alternative_colors.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <Sparkles className="text-accent-500" size={16} />
            Alternative Color Suggestions
          </h4>
          <div className="grid grid-cols-5 gap-2">
            {analysis.alternative_colors.map((color, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="text-center"
              >
                <div
                  className="w-full h-12 rounded-lg border border-slate-200/60 mb-1.5"
                  style={{
                    backgroundColor: rgbToHex(color.rgb.r, color.rgb.g, color.rgb.b)
                  }}
                />
                <p className="text-xs font-medium text-slate-700 truncate">{color.name}</p>
                <p className="text-xs text-slate-500">{color.match_score}%</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};
