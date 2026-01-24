import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, X, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { ApiService, MeasurementResponse } from '../services/api';

interface SaveMeasurementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  measurementData: MeasurementResponse;
  onSaved: () => void;
}

export const SaveMeasurementDialog: React.FC<SaveMeasurementDialogProps> = ({
  isOpen,
  onClose,
  measurementData,
  onSaved,
}) => {
  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Please enter a name for this measurement');
      return;
    }

    setIsSaving(true);
    try {
      await ApiService.saveMeasurement(name.trim(), measurementData);
      toast.success(`Measurement saved as "${name.trim()}"! 🎉`);
      setName('');
      onSaved();
      onClose();
    } catch (error: any) {
      const message = error?.response?.data?.detail || 'Failed to save measurement';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-500 to-purple-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Save size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Save Measurement</h3>
                  <p className="text-white/80 text-sm">Give this measurement a name</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Info */}
            <div className="bg-blue-50 border-l-4 border-primary-500 p-4 rounded-lg flex gap-3">
              <AlertCircle className="text-primary-500 flex-shrink-0 mt-0.5" size={20} />
              <div className="text-sm text-gray-700">
                <p className="font-semibold mb-1">Save your measurements</p>
                <p className="text-gray-600">
                  You can save multiple measurements and access them later. Each measurement needs a unique name.
                </p>
              </div>
            </div>

            {/* Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Measurement Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && name.trim() && !isSaving) {
                    handleSave();
                  }
                }}
                placeholder="e.g., My Current Measurements, January 2024, etc."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all"
                disabled={isSaving}
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-2">
                This name will help you identify this measurement set later
              </p>
            </div>

            {/* Measurement Summary */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Measurement Summary</p>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div>
                  <span className="font-medium">Measurements:</span>{' '}
                  {Object.keys(measurementData.measurements || {}).length}
                </div>
                {measurementData.metadata?.gender && (
                  <div>
                    <span className="font-medium">Gender:</span>{' '}
                    {measurementData.metadata.gender}
                  </div>
                )}
                {measurementData.metadata?.user_height_cm && (
                  <div>
                    <span className="font-medium">Height:</span>{' '}
                    {measurementData.metadata.user_height_cm} cm
                  </div>
                )}
                {measurementData.size_recommendations && (
                  <div>
                    <span className="font-medium">Sizes:</span>{' '}
                    {Object.keys(measurementData.size_recommendations).length} categories
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 bg-gray-50 flex gap-3">
            <button
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 px-4 py-3 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !name.trim()}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>Save Measurement</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
