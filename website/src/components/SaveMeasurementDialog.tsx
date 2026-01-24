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
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [updateMeasurementId, setUpdateMeasurementId] = useState<number | null>(null);

  // Check if we're in update mode when dialog opens
  React.useEffect(() => {
    if (isOpen) {
      const updateId = sessionStorage.getItem('updateMeasurementId');
      const updateName = sessionStorage.getItem('updateMeasurementName');

      if (updateId && updateName) {
        setIsUpdateMode(true);
        setUpdateMeasurementId(parseInt(updateId));
        setName(updateName);
        console.log(`Update mode detected: ID=${updateId}, Name=${updateName}`);
      } else {
        setIsUpdateMode(false);
        setUpdateMeasurementId(null);
        setName('');
      }
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Please enter a name for this measurement');
      return;
    }

    setIsSaving(true);
    try {
      // ALWAYS CREATE a new measurement record (even in update mode)
      // This preserves measurement history for Body Tracker
      await ApiService.saveMeasurement(name.trim(), measurementData);

      if (isUpdateMode) {
        toast.success(`New measurement for "${name.trim()}" saved! Check Body Tracker for progress. 🎉`);
        // Clear update mode flags
        sessionStorage.removeItem('updateMeasurementId');
        sessionStorage.removeItem('updateMeasurementName');
      } else {
        toast.success(`Measurement saved as "${name.trim()}"! 🎉`);
      }
      setName('');
      onSaved();
      onClose();
    } catch (error: any) {
      const message = error?.response?.data?.detail || `Failed to ${isUpdateMode ? 'update' : 'save'} measurement`;
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
        className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-bento max-w-md w-full overflow-hidden"
        >
          {/* Header */}
          <div className="bg-indigo-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Save size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold">{isUpdateMode ? 'Update Measurement' : 'Save Measurement'}</h3>
                  <p className="text-white/80 text-sm">{isUpdateMode ? 'Update this measurement' : 'Give this measurement a name'}</p>
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
            <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-lg flex gap-3">
              <AlertCircle className="text-indigo-500 flex-shrink-0 mt-0.5" size={20} />
              <div className="text-sm text-slate-700">
                <p className="font-medium mb-1">Save your measurements</p>
                <p className="text-slate-600">
                  You can save multiple measurements and access them later. Each measurement needs a unique name.
                </p>
              </div>
            </div>

            {/* Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Measurement Name <span className="text-rose-500">*</span>
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
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
                disabled={isSaving}
                autoFocus
              />
              <p className="text-xs text-slate-500 mt-2">
                This name will help you identify this measurement set later
              </p>
            </div>

            {/* Measurement Summary */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-sm font-medium text-slate-700 mb-2">Measurement Summary</p>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
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
          <div className="p-6 bg-slate-50 flex gap-3">
            <button
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !name.trim()}
              className="flex-1 px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>{isUpdateMode ? 'Update Measurement' : 'Save Measurement'}</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
