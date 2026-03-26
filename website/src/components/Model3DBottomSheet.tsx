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
            className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 bg-slate-900 rounded-t-2xl shadow-bento z-50 lg:hidden border-t border-slate-700"
            style={{ maxHeight: '90vh' }}
          >
            {/* Drag Handle */}
            <div className="flex justify-center pt-4 pb-2">
              <div className="w-12 h-1.5 bg-slate-600 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent-50 rounded-xl flex items-center justify-center">
                  <Maximize2 className="text-accent-500" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    3D Body Model
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedMeasurement
                      ? `Viewing: ${selectedMeasurement.replace(/_/g, ' ')}`
                      : 'Interactive 3D visualization'
                    }
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center transition-colors"
              >
                <X size={20} className="text-slate-600" />
              </button>
            </div>

            {/* 3D Viewer */}
            <div className="px-4 pb-6" style={{ height: 'calc(90vh - 120px)' }}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="h-full rounded-xl overflow-hidden bg-slate-50 border border-slate-200"
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
