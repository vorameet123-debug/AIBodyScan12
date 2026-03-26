import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Activity, Ruler, Sparkles } from 'lucide-react';
import { Measurement } from '../services/api';

interface MeasurementsDisplayProps {
  measurements: Measurement;
  selectedMeasurement?: string | null;
  onMeasurementClick?: (measurementKey: string) => void;
}

export const MeasurementsDisplay: React.FC<MeasurementsDisplayProps> = ({
  measurements,
  selectedMeasurement,
  onMeasurementClick,
}) => {
  const entries = Object.entries(measurements).sort((a, b) => b[1] - a[1]);

  // Key measurements with icons and colors
  const keyMeasurementsConfig = [
    { key: 'height', label: 'Height', icon: Ruler, gradient: 'from-violet-500 to-purple-600', glow: 'shadow-violet-500/25' },
    { key: 'chest_circumference', label: 'Chest', icon: Activity, gradient: 'from-fuchsia-500 to-pink-600', glow: 'shadow-fuchsia-500/25' },
    { key: 'waist_circumference', label: 'Waist', icon: TrendingUp, gradient: 'from-cyan-500 to-blue-600', glow: 'shadow-cyan-500/25' },
    { key: 'hip_circumference', label: 'Hip', icon: Sparkles, gradient: 'from-emerald-500 to-teal-600', glow: 'shadow-emerald-500/25' },
  ];

  const keyMeasurements = keyMeasurementsConfig
    .map(config => ({
      ...config,
      value: measurements[config.key as keyof Measurement] as number | undefined
    }))
    .filter(item => item.value !== undefined);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Key Metrics Grid - Premium Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {keyMeasurements.map((item, index) => (
          <motion.div
            key={item.key}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: index * 0.1, type: 'spring', bounce: 0.3 }}
            whileHover={{ scale: 1.02, y: -4 }}
            onClick={() => onMeasurementClick?.(item.key)}
            className={`relative overflow-hidden bg-slate-800/60 backdrop-blur-sm p-5 rounded-2xl border cursor-pointer transition-all duration-300 ${selectedMeasurement === item.key
                ? 'border-violet-500 shadow-lg shadow-violet-500/20'
                : 'border-white/10 hover:border-white/20'
              }`}
          >
            {/* Gradient Background Glow */}
            <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${item.gradient} opacity-20 blur-3xl rounded-full`} />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {item.label}
                </span>
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg ${item.glow}`}>
                  <item.icon size={14} className="text-white" />
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white tracking-tight">
                  {item.value?.toFixed(1)}
                </span>
                <span className="text-sm font-medium text-slate-500">cm</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* All Measurements Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="relative overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
            <TrendingUp className="text-white" size={20} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">All Measurements</h3>
            <p className="text-sm text-slate-400">{entries.length} measurements extracted</p>
          </div>
        </div>

        {/* Two Column Measurement Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Left Column */}
          <div className="space-y-2">
            {entries.slice(0, Math.ceil(entries.length / 2)).map(([name, value], index) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.02 }}
                onClick={() => onMeasurementClick?.(name)}
                className={`group flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 ${selectedMeasurement === name
                    ? 'bg-violet-500/20 border border-violet-500/50'
                    : 'bg-slate-800/40 border border-transparent hover:bg-slate-700/50 hover:border-white/10'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full transition-all ${selectedMeasurement === name ? 'bg-violet-400' : 'bg-slate-600 group-hover:bg-violet-400'
                    }`} />
                  <span className="text-sm text-slate-300 capitalize group-hover:text-white transition-colors">
                    {name.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className={`text-sm font-bold transition-colors ${selectedMeasurement === name ? 'text-violet-300' : 'text-white'
                    }`}>
                    {value.toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-500">cm</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Right Column */}
          <div className="space-y-2">
            {entries.slice(Math.ceil(entries.length / 2)).map(([name, value], index) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + (index + Math.ceil(entries.length / 2)) * 0.02 }}
                onClick={() => onMeasurementClick?.(name)}
                className={`group flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 ${selectedMeasurement === name
                    ? 'bg-violet-500/20 border border-violet-500/50'
                    : 'bg-slate-800/40 border border-transparent hover:bg-slate-700/50 hover:border-white/10'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full transition-all ${selectedMeasurement === name ? 'bg-violet-400' : 'bg-slate-600 group-hover:bg-violet-400'
                    }`} />
                  <span className="text-sm text-slate-300 capitalize group-hover:text-white transition-colors">
                    {name.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className={`text-sm font-bold transition-colors ${selectedMeasurement === name ? 'text-violet-300' : 'text-white'
                    }`}>
                    {value.toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-500">cm</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
