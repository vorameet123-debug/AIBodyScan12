import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Maximize2 } from 'lucide-react';

interface Model3DViewerProps {
  measurements: any;
  gender?: string;
}

type BodyPart = 'head' | 'neck' | 'chest' | 'waist' | 'hip' | 'arm' | 'leg' | 'foot' | null;

export const Model3DViewer: React.FC<Model3DViewerProps> = ({
  measurements,
  gender,
}) => {
  const [selectedPart, setSelectedPart] = useState<BodyPart>(null);

  // Map measurement names to body parts
  const getMeasurementPart = (measurement: string): BodyPart => {
    const lower = measurement.toLowerCase();
    if (lower.includes('head')) return 'head';
    if (lower.includes('neck')) return 'neck';
    if (lower.includes('chest') || lower.includes('shoulder')) return 'chest';
    if (lower.includes('waist')) return 'waist';
    if (lower.includes('hip')) return 'hip';
    if (lower.includes('arm') || lower.includes('bicep') || lower.includes('forearm')) return 'arm';
    if (lower.includes('thigh') || lower.includes('leg') || lower.includes('calf')) return 'leg';
    if (lower.includes('ankle') || lower.includes('foot')) return 'foot';
    return null;
  };

  // Get color for body part based on selection
  const getPartColor = (part: BodyPart): string => {
    if (selectedPart === part) return '#ef4444'; // Red when selected
    if (gender === 'female') return '#ec4899'; // Pink for female
    return '#3b82f6'; // Blue for male
  };

  // Top measurements to show as interactive buttons
  const keyMeasurements = [
    { key: 'head_circumference', label: 'Head' },
    { key: 'neck_circumference', label: 'Neck' },
    { key: 'chest_circumference', label: 'Chest' },
    { key: 'waist_circumference', label: 'Waist' },
    { key: 'hip_circumference', label: 'Hip' },
    { key: 'arm_right_length', label: 'Arm' },
    { key: 'thigh_left_circumference', label: 'Thigh' },
    { key: 'ankle_left_circumference', label: 'Ankle' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl p-6 shadow-bento border border-slate-200/60 overflow-hidden"
    >
      <div className="flex items-center gap-2 mb-6">
        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
          <Maximize2 className="text-indigo-600" size={20} />
        </div>
        <h3 className="text-xl font-bold text-slate-900">3D Body Model</h3>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left: SVG 3D Body Visualization */}
        <div className="md:col-span-2 flex justify-center items-center bg-white rounded-xl p-6">
          <svg viewBox="0 0 200 400" className="w-full max-w-xs h-auto" xmlns="http://www.w3.org/2000/svg">
            {/* Head */}
            <circle
              cx="100"
              cy="50"
              r="25"
              fill={getPartColor('head')}
              stroke={selectedPart === 'head' ? '#dc2626' : 'none'}
              strokeWidth={selectedPart === 'head' ? 4 : 0}
              className="transition-all cursor-pointer hover:opacity-80"
              onClick={() => setSelectedPart(selectedPart === 'head' ? null : 'head')}
            />

            {/* Neck */}
            <rect
              x="92"
              y="75"
              width="16"
              height="15"
              fill={getPartColor('neck')}
              stroke={selectedPart === 'neck' ? '#dc2626' : 'none'}
              strokeWidth={selectedPart === 'neck' ? 3 : 0}
              className="transition-all cursor-pointer hover:opacity-80"
              onClick={() => setSelectedPart(selectedPart === 'neck' ? null : 'neck')}
            />

            {/* Chest/Torso */}
            <ellipse
              cx="100"
              cy="130"
              rx="35"
              ry="50"
              fill={getPartColor('chest')}
              stroke={selectedPart === 'chest' ? '#dc2626' : 'none'}
              strokeWidth={selectedPart === 'chest' ? 4 : 0}
              className="transition-all cursor-pointer hover:opacity-80"
              onClick={() => setSelectedPart(selectedPart === 'chest' ? null : 'chest')}
            />

            {/* Waist */}
            <ellipse
              cx="100"
              cy="150"
              rx="28"
              ry="12"
              fill={getPartColor('waist')}
              stroke={selectedPart === 'waist' ? '#dc2626' : 'none'}
              strokeWidth={selectedPart === 'waist' ? 4 : 0}
              className="transition-all cursor-pointer hover:opacity-80"
              onClick={() => setSelectedPart(selectedPart === 'waist' ? null : 'waist')}
              opacity="0.7"
            />

            {/* Hip */}
            <ellipse
              cx="100"
              cy="200"
              rx="32"
              ry="30"
              fill={getPartColor('hip')}
              stroke={selectedPart === 'hip' ? '#dc2626' : 'none'}
              strokeWidth={selectedPart === 'hip' ? 4 : 0}
              className="transition-all cursor-pointer hover:opacity-80"
              onClick={() => setSelectedPart(selectedPart === 'hip' ? null : 'hip')}
            />

            {/* Left Arm */}
            <g
              className="transition-all cursor-pointer hover:opacity-80"
              onClick={() => setSelectedPart(selectedPart === 'arm' ? null : 'arm')}
            >
              <rect x="50" y="110" width="18" height="80" rx="9" fill={getPartColor('arm')} />
              <circle cx="59" cy="190" r="9" fill={getPartColor('arm')} />
            </g>

            {/* Right Arm */}
            <g
              className="transition-all cursor-pointer hover:opacity-80"
              onClick={() => setSelectedPart(selectedPart === 'arm' ? null : 'arm')}
            >
              <rect x="132" y="110" width="18" height="80" rx="9" fill={getPartColor('arm')} />
              <circle cx="141" cy="190" r="9" fill={getPartColor('arm')} />
            </g>

            {/* Left Leg */}
            <g
              className="transition-all cursor-pointer hover:opacity-80"
              onClick={() => setSelectedPart(selectedPart === 'leg' ? null : 'leg')}
            >
              <rect x="78" y="230" width="15" height="100" rx="7.5" fill={getPartColor('leg')} />
              <ellipse cx="85.5" cy="335" rx="10" ry="12" fill={getPartColor('foot')} />
            </g>

            {/* Right Leg */}
            <g
              className="transition-all cursor-pointer hover:opacity-80"
              onClick={() => setSelectedPart(selectedPart === 'leg' ? null : 'leg')}
            >
              <rect x="107" y="230" width="15" height="100" rx="7.5" fill={getPartColor('leg')} />
              <ellipse cx="114.5" cy="335" rx="10" ry="12" fill={getPartColor('foot')} />
            </g>
          </svg>
        </div>

        {/* Right: Interactive Measurements List */}
        <div className="bg-slate-50 rounded-xl p-4 overflow-y-auto max-h-96">
          <h4 className="font-semibold text-slate-700 mb-4 text-sm">Click to Highlight</h4>
          <div className="space-y-2">
            {keyMeasurements.map((measure) => {
              const value = measurements[measure.key];
              const part = getMeasurementPart(measure.key);
              if (!value) return null;

              return (
                <motion.button
                  key={measure.key}
                  onClick={() => setSelectedPart(selectedPart === part ? null : part)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full px-3 py-2 rounded-lg transition-all text-left text-sm ${
                    selectedPart === part
                      ? 'bg-indigo-100 border border-indigo-400 font-semibold text-indigo-700'
                      : 'bg-white border border-slate-200 hover:border-indigo-300 text-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span>{measure.label}</span>
                    <span className="font-bold">{value.toFixed(1)}</span>
                  </div>
                  <div className="text-xs opacity-70">cm</div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-4 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200/60">
        <p>💡 Click on any measurement or body part in the 3D model to highlight it</p>
      </div>
    </motion.div>
  );
};
