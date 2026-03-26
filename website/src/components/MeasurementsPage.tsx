import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MeasurementForm } from './MeasurementForm';
import { MeasurementsDisplay } from './MeasurementsDisplay';
import { SizeRecommendations } from './SizeRecommendations';
import { Model3DViewerSMPL } from './Model3DViewerSMPL';
import { Model3DBottomSheet } from './Model3DBottomSheet';
import { SaveMeasurementDialog } from './SaveMeasurementDialog';
import { ApiService, MeasurementResponse } from '../services/api';
import { CheckCircle, RotateCcw, Save, Database, Eye } from 'lucide-react';
import { Button } from './ui/Button';
import toast from 'react-hot-toast';
import { useInvalidateBodyIntelligence } from '../contexts/BodyIntelligenceContext';

export const MeasurementsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const invalidateBodyIntelligence = useInvalidateBodyIntelligence();
  const [result, setResult] = useState<MeasurementResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMeasurement, setSelectedMeasurement] = useState<string | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showMobile3D, setShowMobile3D] = useState(false);
  const [isSavedMeasurement, setIsSavedMeasurement] = useState(false);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [updateMeasurementId, setUpdateMeasurementId] = useState<number | null>(null);
  const [updateMeasurementName, setUpdateMeasurementName] = useState<string>('');

  // Check for loaded measurement from saved measurements
  // Run whenever location changes (navigation) or component mounts
  useEffect(() => {
    const checkForLoadedMeasurement = () => {
      const loadedMeasurementData = sessionStorage.getItem('loadedMeasurement');
      if (loadedMeasurementData) {
        try {
          const data = JSON.parse(loadedMeasurementData);

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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="bg-slate-900 rounded-2xl p-6 shadow-bento border border-slate-700/60"
          >
            {/* Header Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-center mb-10"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl mb-6 shadow-lg shadow-violet-500/25">
                <Database className="text-white" size={28} />
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">
                Get Your Body Measurements
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto">
                Upload your photos and enter your details to receive accurate body measurements powered by AI
              </p>
            </motion.div>

            <MeasurementForm
              onSuccess={handleSuccess}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
          </motion.div>
        )}

        {/* Results View */}
        {result && result.success && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {/* Success Banner */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-emerald-500 p-6 rounded-2xl text-white"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <CheckCircle size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">Measurements Extracted Successfully!</h3>
                  <p className="text-emerald-100 text-sm">
                    {Object.keys(result.measurements).length} accurate measurements extracted using AI
                  </p>
                </div>
              </div>
            </motion.div>

            {/* 3D Body Model Viewer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-900 rounded-2xl p-6 shadow-bento border border-slate-700/60"
            >
              <Model3DViewerSMPL
                model3D={result.model_3d}
                measurements={result.measurements}
                gender={result.metadata?.gender}
                selectedMeasurement={selectedMeasurement}
              />
            </motion.div>

            {/* Measurements Display - Horizontal Layout */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-900 rounded-2xl p-6 shadow-bento border border-slate-700/60"
            >
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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-slate-900 rounded-2xl p-6 shadow-bento border border-slate-700/60"
              >
                <SizeRecommendations recommendations={result.size_recommendations} />
              </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex gap-3 justify-center flex-wrap"
            >
              {/* Show Update button if in update mode, otherwise show Save button for new measurements */}
              {isUpdateMode ? (
                <motion.button
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={async () => {
                    if (!result || !updateMeasurementId) return;

                    try {
                      await ApiService.saveMeasurement(updateMeasurementName, result);
                      toast.success(`"${updateMeasurementName}" updated successfully! 🎉`);
                      // Invalidate body intelligence cache so Body Tracker will refresh
                      invalidateBodyIntelligence();
                      // Clear update mode flags
                      sessionStorage.removeItem('updateMeasurementId');
                      sessionStorage.removeItem('updateMeasurementName');
                      setIsUpdateMode(false);
                      // Navigate back to My Measurements
                      setTimeout(() => {
                        navigate('/my-measurements');
                      }, 1000);
                    } catch (error: any) {
                      toast.error(error?.response?.data?.detail || 'Failed to update measurement');
                    }
                  }}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 px-6 rounded-xl transition-colors"
                >
                  <Save size={18} />
                  Save New Measurement
                </motion.button>
              ) : !isSavedMeasurement && (
                <Button
                  variant="primary"
                  onClick={() => setShowSaveDialog(true)}
                >
                  <Save size={18} />
                  Save Measurement
                </Button>
              )}
              <Button
                variant="primary"
                onClick={handleReset}
              >
                <RotateCcw size={18} />
                {isSavedMeasurement || isUpdateMode ? 'Back to Measurements' : 'Measure Another Person'}
              </Button>
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
            // Invalidate body intelligence cache so Body Tracker will refresh
            invalidateBodyIntelligence();
          }}
        />
      )}
    </div>
  );
};
