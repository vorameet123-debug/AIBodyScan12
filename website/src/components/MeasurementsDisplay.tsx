import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
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
  
  // Prepare data for chart
  const chartData = entries.slice(0, 10).map(([name, value]) => ({
    name: name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    value: Math.round(value * 10) / 10,
  }));

  // Key measurements
  const keyMeasurements = entries.filter(([name]) => 
    ['height', 'chest_circumference', 'waist_circumference', 'hip_circumference'].includes(name)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Key Metrics Grid */}
      <div className="grid md:grid-cols-4 gap-4">
        {keyMeasurements.map(([name, value], index) => (
          <motion.div
            key={name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gradient-to-br from-primary-50 to-blue-50 p-4 rounded-xl border border-primary-200"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                {name.replace(/_/g, ' ')}
              </p>
              <Activity size={16} className="text-primary-500" />
            </div>
            <p className="text-3xl font-bold text-primary-700">{value.toFixed(1)}</p>
            <p className="text-xs text-gray-500 mt-1">cm</p>
          </motion.div>
        ))}
      </div>

      {/* All Measurements Table - Two Column Layout */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl p-6 shadow-lg"
      >
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="text-primary-600" size={24} />
          <h3 className="text-xl font-bold text-gray-800">All Measurements</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Measurement</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Value (cm)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {entries.slice(0, Math.ceil(entries.length / 2)).map(([name, value], index) => (
                  <motion.tr
                    key={name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                    onClick={() => onMeasurementClick?.(name)}
                    className={`cursor-pointer transition ${
                      selectedMeasurement === name 
                        ? 'bg-cyan-100 hover:bg-cyan-200' 
                        : 'hover:bg-primary-50'
                    }`}
                  >
                    <td className="px-4 py-3 text-sm text-gray-700 capitalize">
                      {name.replace(/_/g, ' ')}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-primary-700">
                      {value.toFixed(2)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Right Column */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Measurement</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Value (cm)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {entries.slice(Math.ceil(entries.length / 2)).map(([name, value], index) => (
                  <motion.tr
                    key={name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (index + Math.ceil(entries.length / 2)) * 0.02 }}
                    onClick={() => onMeasurementClick?.(name)}
                    className={`cursor-pointer transition ${
                      selectedMeasurement === name 
                        ? 'bg-cyan-100 hover:bg-cyan-200' 
                        : 'hover:bg-primary-50'
                    }`}
                  >
                    <td className="px-4 py-3 text-sm text-gray-700 capitalize">
                      {name.replace(/_/g, ' ')}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-primary-700">
                      {value.toFixed(2)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
