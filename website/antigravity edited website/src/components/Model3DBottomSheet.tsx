import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize2 } from 'lucide-react';
import { Model3DViewerSMPL } from './Model3DViewerSMPL';

interface Model3DBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  model3D?: {
    vertices?: number[][];
    type: string;
  };
  measurements: any;
  gender?: string;
  selectedMeasurement?: string | null;
}

export const Model3DBottomSheet: React.FC<Model3DBottomSheetProps> = ({
  isOpen,
  onClose,
  model3D,
  measurements,
  gender,
  selectedMeasurement,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 bg-white/98 backdrop-blur-2xl rounded-t-3xl shadow-2xl z-50 lg:hidden border-t-2 border-primary-200/50"
            style={{ maxHeight: '90vh' }}
          >
            {/* Animated Gradient Background */}
            <motion.div
              animate={{
                background: [
                  'linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(168, 85, 247, 0.05))',
                  'linear-gradient(135deg, rgba(168, 85, 247, 0.05), rgba(236, 72, 153, 0.05))',
                  'linear-gradient(135deg, rgba(236, 72, 153, 0.05), rgba(99, 102, 241, 0.05))',
                ],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 rounded-t-3xl"
            />
            
            {/* Drag Handle */}
            <div className="flex justify-center pt-4 pb-2 relative z-10">
              <motion.div
                whileHover={{ scaleX: 1.2 }}
                className="w-12 h-1.5 bg-gradient-to-r from-primary-300 to-purple-300 rounded-full"
              />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 pb-4 relative z-10">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg"
                >
                  <Maximize2 className="text-white" size={22} />
                </motion.div>
                <div>
                  <h3 className="text-lg font-extrabold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                    3D Body Model
                  </h3>
                  <motion.p
                    key={selectedMeasurement || 'default'}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-gray-500"
                  >
                    {selectedMeasurement 
                      ? `Viewing: ${selectedMeasurement.replace(/_/g, ' ')}`
                      : 'Interactive 3D visualization'
                    }
                  </motion.p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-xl flex items-center justify-center transition-all shadow-md"
              >
                <X size={20} className="text-gray-700" />
              </motion.button>
            </div>

            {/* 3D Viewer */}
            <div className="px-4 pb-6 relative z-10" style={{ height: 'calc(90vh - 120px)' }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="h-full rounded-2xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 shadow-inner border border-gray-200/50"
              >
                <Model3DViewerSMPL
                  model3D={model3D}
                  measurements={measurements}
                  gender={gender}
                  selectedMeasurement={selectedMeasurement}
                />
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
