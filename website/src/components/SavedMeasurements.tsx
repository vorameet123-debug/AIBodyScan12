import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Database, Trash2, Eye, Calendar, User, TrendingUp } from 'lucide-react';
import { ConfirmModal } from './ui/ConfirmModal';
import { ApiService, SavedMeasurement } from '../services/api';
import toast from 'react-hot-toast';

interface SavedMeasurementsProps {
  onLoadMeasurement?: (measurement: SavedMeasurement) => void;
}

export const SavedMeasurements: React.FC<SavedMeasurementsProps> = ({ onLoadMeasurement }) => {
  const navigate = useNavigate();
  const [measurements, setMeasurements] = useState<SavedMeasurement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; name: string } | null>(null);

  const loadMeasurements = async () => {
    setIsLoading(true);
    try {
      const response = await ApiService.getMyMeasurements();
      setMeasurements(response.measurements);
    } catch (error: any) {
      toast.error('Failed to load saved measurements');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMeasurements();
  }, []);

  const handleDelete = async (id: number, name: string) => {
    setDeleteConfirm({ id, name });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    const { id, name } = deleteConfirm;
    setDeletingId(id);
    try {
      await ApiService.deleteMeasurement(id);
      toast.success('Measurement deleted successfully');
      loadMeasurements();
    } catch (error: any) {
      toast.error('Failed to delete measurement');
      console.error(error);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="bg-slate-900 rounded-2xl p-8 shadow-bento border border-slate-700/60">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="ml-3 text-slate-400">Loading saved measurements...</span>
        </div>
      </div>
    );
  }

  if (measurements.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900 rounded-2xl p-8 shadow-bento border border-slate-700/60"
      >
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Database className="text-slate-400" size={32} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Saved Measurements</h3>
          <p className="text-slate-500">
            Save your measurements after processing to access them here later.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900 rounded-2xl p-6 shadow-bento border border-slate-700/60"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
            <Database className="text-accent-500" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Saved Measurements</h2>
            <p className="text-sm text-slate-500">{measurements.length} measurement{measurements.length !== 1 ? 's' : ''} saved</p>
          </div>
        </div>
        <button
          onClick={loadMeasurements}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors text-sm font-medium"
        >
          Refresh
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <AnimatePresence>
          {measurements.map((measurement, index) => (
            <motion.div
              key={measurement.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.03 }}
              className="bg-slate-50 border border-slate-200 rounded-xl p-5 hover:border-indigo-200 transition-colors"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900 mb-1">{measurement.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Calendar size={14} />
                    <span>{formatDate(measurement.created_at)}</span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(measurement.id, measurement.name);
                  }}
                  disabled={deletingId === measurement.id}
                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                  aria-label={`Delete measurement ${measurement.name}`}
                >
                  {deletingId === measurement.id ? (
                    <div className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Trash2 size={18} />
                  )}
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="text-accent-500" size={14} />
                    <span className="text-xs font-medium text-slate-600">Measurements</span>
                  </div>
                  <p className="text-xl font-bold text-white">
                    {Object.keys(measurement.measurements || {}).length}
                  </p>
                </div>
                {measurement.size_recommendations && (
                  <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="text-purple-600" size={14} />
                      <span className="text-xs font-medium text-slate-600">Sizes</span>
                    </div>
                    <p className="text-xl font-bold text-white">
                      {Object.keys(measurement.size_recommendations).length}
                    </p>
                  </div>
                )}
              </div>

              {/* Key Measurements Preview */}
              {measurement.measurements && Object.keys(measurement.measurements).length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-slate-600 mb-2">Key Measurements:</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(measurement.measurements)
                      .slice(0, 3)
                      .map(([key, value]) => (
                        <div
                          key={key}
                          className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs font-medium"
                        >
                          {key.replace(/_/g, ' ').substring(0, 15)}: {value.toFixed(1)}cm
                        </div>
                      ))}
                    {Object.keys(measurement.measurements).length > 3 && (
                      <div className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">
                        +{Object.keys(measurement.measurements).length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <button
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  try {
                    // Get full measurement data
                    const fullMeasurement = await ApiService.getMeasurement(measurement.id);

                    // Store in sessionStorage to pass to measurements page
                    const dataToStore = {
                      id: fullMeasurement.id,
                      name: fullMeasurement.name,
                      measurements: fullMeasurement.measurements || {},
                      size_recommendations: fullMeasurement.size_recommendations || {},
                      metadata: fullMeasurement.metadata || {},
                      model_3d: fullMeasurement.model_3d,
                    };

                    sessionStorage.setItem('loadedMeasurement', JSON.stringify(dataToStore));

                    // Navigate to measurements page
                    navigate('/measurements', { replace: true });

                    // Call callback if provided (but don't let it block navigation)
                    if (onLoadMeasurement) {
                      onLoadMeasurement(measurement);
                    }
                  } catch (error: any) {
                    toast.error('Failed to load measurement details');
                    console.error('Error loading measurement:', error);
                  }
                }}
                className="w-full flex items-center justify-center gap-2 bg-accent-500 hover:bg-accent-600 text-white font-medium py-2.5 rounded-xl transition-colors"
              >
                <Eye size={16} />
                View Details
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteConfirm}
        title="Delete Measurement"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm(null)}
        variant="danger"
        confirmText="Delete"
        cancelText="Cancel"
      />
    </motion.div>
  );
};
