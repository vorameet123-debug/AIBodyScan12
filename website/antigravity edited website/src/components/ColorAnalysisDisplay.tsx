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
      className="relative bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-pink-50/30 via-purple-50/30 to-blue-50/30" />
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
            <Palette className="text-white" size={28} />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Color Analysis
            </h3>
            <p className="text-gray-600 text-sm">Color compatibility with your skin tone</p>
          </div>
        </div>

        {/* Skin Tone */}
        <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-gray-700">Your Skin Tone (Auto-detected)</p>
            <div
              className="w-8 h-8 rounded-full border-2 border-white shadow-md"
              style={{
                backgroundColor: rgbToHex(
                  skinTone.rgb_values?.r || 170,
                  skinTone.rgb_values?.g || 140,
                  skinTone.rgb_values?.b || 120
                )
              }}
            />
          </div>
          <p className="text-lg font-bold text-gray-800">{skinTone.description || 'Medium (default)'}</p>
          <p className="text-xs text-gray-500 mt-1">
            Confidence: {skinTone.confidence ? (skinTone.confidence * 100).toFixed(0) : '50'}%
          </p>
        </div>

        {/* Color Match Score - Enhanced */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">Color Match Score</span>
            <motion.span
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-3xl font-extrabold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent"
            >
              {analysis.match_score.toFixed(0)}%
            </motion.span>
          </div>
          <div className="relative w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${analysis.match_score}%` }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              className={`relative h-full bg-gradient-to-r ${getCompatibilityColor(analysis.compatibility)} shadow-lg`}
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
              className={`absolute inset-0 bg-gradient-to-r ${getCompatibilityColor(analysis.compatibility)} opacity-30 blur-md`}
              style={{ width: `${analysis.match_score}%` }}
            />
          </div>
        </div>

        {/* Primary Color - Enhanced with 3D Effect */}
        <motion.div
          whileHover={{ scale: 1.02, y: -5 }}
          className="mb-6 p-5 bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-gray-200 shadow-xl group"
        >
          <div className="flex items-center gap-5">
            <motion.div
              animate={{
                boxShadow: [
                  '0 0 20px rgba(0,0,0,0.1)',
                  `0 0 30px ${rgbToHex(analysis.primary_color.rgb.r, analysis.primary_color.rgb.g, analysis.primary_color.rgb.b)}40`,
                  '0 0 20px rgba(0,0,0,0.1)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="relative w-20 h-20 rounded-2xl border-4 border-white shadow-2xl overflow-hidden"
              style={{
                backgroundColor: rgbToHex(
                  analysis.primary_color.rgb.r,
                  analysis.primary_color.rgb.g,
                  analysis.primary_color.rgb.b
                )
              }}
            >
              <motion.div
                animate={{ rotate: 45, scale: [1, 1.2, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent"
              />
            </motion.div>
            <div>
              <p className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-1">Primary Color</p>
              <motion.p
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-2xl font-extrabold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent"
              >
                {analysis.primary_color.name}
              </motion.p>
              {analysis.primary_color.percentage && (
                <p className="text-xs text-gray-500 mt-1 font-semibold">{analysis.primary_color.percentage.toFixed(1)}% of garment</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Recommendation */}
        <div className={`mb-6 p-4 rounded-xl bg-gradient-to-r ${getCompatibilityColor(analysis.compatibility)} text-white`}>
          <div className="flex items-center gap-3">
            {analysis.compatibility === 'excellent' || analysis.compatibility === 'good' ? (
              <CheckCircle size={24} />
            ) : (
              <AlertCircle size={24} />
            )}
            <p className="font-semibold">{analysis.recommendation}</p>
          </div>
        </div>

        {/* Alternative Colors */}
        {analysis.alternative_colors.length > 0 && (
          <div>
            <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Sparkles className="text-purple-500" size={20} />
              Alternative Color Suggestions
            </h4>
            <div className="grid grid-cols-5 gap-3">
              {analysis.alternative_colors.map((color, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div
                    className="w-full h-16 rounded-xl border-2 border-white shadow-md mb-2"
                    style={{
                      backgroundColor: rgbToHex(color.rgb.r, color.rgb.g, color.rgb.b)
                    }}
                  />
                  <p className="text-xs font-semibold text-gray-700">{color.name}</p>
                  <p className="text-xs text-gray-500">{color.match_score}% match</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
