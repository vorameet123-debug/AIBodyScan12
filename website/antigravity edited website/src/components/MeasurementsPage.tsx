import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MeasurementForm } from './MeasurementForm';
import { MeasurementsDisplay } from './MeasurementsDisplay';
import { SizeRecommendations } from './SizeRecommendations';
import { Model3DViewerSMPL } from './Model3DViewerSMPL';
import { Model3DBottomSheet } from './Model3DBottomSheet';
import { SaveMeasurementDialog } from './SaveMeasurementDialog';
import { ApiService, MeasurementResponse } from '../services/api';
import { CheckCircle, RotateCcw, Save, Database, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

export const MeasurementsPage: React.FC = () => {
  const location = useLocation();
  const [result, setResult] = useState<MeasurementResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMeasurement, setSelectedMeasurement] = useState<string | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showMobile3D, setShowMobile3D] = useState(false);
  const [isSavedMeasurement, setIsSavedMeasurement] = useState(false);

  // Check for loaded measurement from saved measurements
  // Run whenever location changes (navigation) or component mounts
  useEffect(() => {
    const checkForLoadedMeasurement = () => {
      const loadedMeasurementData = sessionStorage.getItem('loadedMeasurement');
      if (loadedMeasurementData) {
        try {
          const data = JSON.parse(loadedMeasurementData);
          console.log('Loading measurement from sessionStorage:', data);
          
          const measurementResponse: MeasurementResponse = {
            success: true,
            measurements: data.measurements || {},
            size_recommendations: data.size_recommendations,
            metadata: data.metadata,
            model_3d: data.model_3d,
          };
          
          setResult(measurementResponse);
          
          // Check if this is a saved measurement (has an id)
          if (data.id) {
            setIsSavedMeasurement(true);
            toast.success(`Loaded "${data.name}"`);
          } else {
            setIsSavedMeasurement(false);
          }
          
          // Clear the sessionStorage after loading
          sessionStorage.removeItem('loadedMeasurement');
        } catch (error) {
          console.error('Failed to parse loaded measurement:', error);
          sessionStorage.removeItem('loadedMeasurement');
          toast.error('Failed to load measurement data');
          setIsSavedMeasurement(false);
        }
      } else {
        // No loaded measurement, so it's a new measurement
        setIsSavedMeasurement(false);
      }
    };

    // Check immediately
    checkForLoadedMeasurement();
    
    // Also check after a short delay in case of timing issues
    const timeoutId = setTimeout(checkForLoadedMeasurement, 100);
    
    return () => clearTimeout(timeoutId);
  }, [location.pathname]);

  const handleSuccess = (data: MeasurementResponse) => {
    setResult(data);
    setIsSavedMeasurement(false); // New measurement, not saved yet
  };

  const handleReset = () => {
    setResult(null);
    setIsLoading(false);
    setIsSavedMeasurement(false);
  };

  return (
    <div className="space-y-8">
      <AnimatePresence mode="wait">
        {/* Main Form View */}
        {!result && (
          <motion.div
            key="form"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="relative bg-white/95 backdrop-blur-xl rounded-3xl p-8 md:p-10 shadow-2xl border border-white/20 overflow-hidden"
          >
            {/* Decorative Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 via-purple-50/50 to-pink-50/50" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary-400/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-purple-400/10 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
              {/* Header Section */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-center mb-10"
              >
                <motion.div
                  animate={{ 
                    rotate: [0, 360],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
                    scale: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
                  }}
                  className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl mb-6 shadow-lg"
                >
                  <Database className="text-white" size={40} />
                </motion.div>
                <h2 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                  Get Your Body Measurements
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Upload your photos and enter your details to receive accurate body measurements powered by AI
                </p>
              </motion.div>

              <MeasurementForm
                onSuccess={handleSuccess}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
              />
            </div>
          </motion.div>
        )}

        {/* Results View */}
        {result && result.success && (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="space-y-8"
          >
            {/* Success Banner */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="relative bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 p-8 rounded-3xl text-white shadow-2xl overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
              <div className="relative z-10 flex items-center gap-6">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30"
                >
                  <CheckCircle size={40} />
                </motion.div>
                <div>
                  <h3 className="text-2xl font-extrabold mb-2">Measurements Extracted Successfully! 🎉</h3>
                  <p className="text-green-50 text-base">
                    {Object.keys(result.measurements).length} accurate measurements extracted using AI
                  </p>
                </div>
              </div>
            </motion.div>

            {/* 3D Body Model Viewer - At the Top */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative bg-white/95 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary-50/30 via-purple-50/30 to-pink-50/30" />
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-400/20 to-transparent rounded-full blur-3xl" />
              <div className="relative z-10">
                <Model3DViewerSMPL 
                  model3D={result.model_3d} 
                  measurements={result.measurements} 
                  gender={result.metadata?.gender}
                  selectedMeasurement={selectedMeasurement}
                />
              </div>
            </motion.div>

            {/* Measurements Display - Horizontal Layout */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="relative bg-white/95 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-purple-50/30 to-pink-50/30" />
              <div className="relative z-10">
                <MeasurementsDisplay 
                  measurements={result.measurements}
                  selectedMeasurement={selectedMeasurement}
                  onMeasurementClick={(name) => {
                    setSelectedMeasurement(name);
                    // Auto-open bottom sheet on mobile when measurement is clicked
                    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                      setShowMobile3D(true);
                    }
                  }}
                />
              </div>
            </motion.div>

            {/* Mobile: Bottom Sheet 3D Viewer */}
            <Model3DBottomSheet
              isOpen={showMobile3D}
              onClose={() => setShowMobile3D(false)}
              model3D={result.model_3d}
              measurements={result.measurements}
              gender={result.metadata?.gender}
              selectedMeasurement={selectedMeasurement}
            />

            {/* Size Recommendations */}
            {result.size_recommendations && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="relative bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 via-pink-50/30 to-primary-50/30" />
                <div className="relative z-10">
                  <SizeRecommendations recommendations={result.size_recommendations} />
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex gap-4 justify-center flex-wrap"
            >
              {/* Only show Save button for new measurements, not saved ones */}
              {!isSavedMeasurement && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => setShowSaveDialog(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-8 rounded-xl transition transform hover:scale-105 shadow-lg"
                >
                  <Save size={20} />
                  Save Measurement
                </motion.button>
              )}
              <button
                onClick={handleReset}
                className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-8 rounded-xl transition transform hover:scale-105"
              >
                <RotateCcw size={20} />
                {isSavedMeasurement ? 'Back to Measurements' : 'Measure Another Person'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save Measurement Dialog */}
      {result && result.success && (
        <SaveMeasurementDialog
          isOpen={showSaveDialog}
          onClose={() => setShowSaveDialog(false)}
          measurementData={result}
          onSaved={() => {
            toast.success('Measurement saved successfully!');
          }}
        />
      )}
    </div>
  );
};
