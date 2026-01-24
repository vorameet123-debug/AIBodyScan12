import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Database, Trash2, Eye, Calendar, User, TrendingUp } from 'lucide-react';
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
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

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
      <div className="bg-white rounded-3xl p-8 shadow-xl">
        <div className="flex items-center justify-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full"
          />
          <span className="ml-3 text-gray-600">Loading saved measurements...</span>
        </div>
      </div>
    );
  }

  if (measurements.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-8 shadow-xl"
      >
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Database className="text-gray-400" size={40} />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Saved Measurements</h3>
          <p className="text-gray-600">
            Save your measurements after processing to access them here later.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl p-8 shadow-xl"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Database className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Saved Measurements</h2>
            <p className="text-sm text-gray-600">{measurements.length} measurement{measurements.length !== 1 ? 's' : ''} saved</p>
          </div>
        </div>
        <button
          onClick={loadMeasurements}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-semibold"
        >
          Refresh
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <AnimatePresence>
          {measurements.map((measurement, index) => (
            <motion.div
              key={measurement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
              className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-2xl p-6 hover:border-primary-300 hover:shadow-lg transition-all"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-1">{measurement.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar size={14} />
                    <span>{formatDate(measurement.created_at)}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(measurement.id, measurement.name)}
                  disabled={deletingId === measurement.id}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  {deletingId === measurement.id ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full"
                    />
                  ) : (
                    <Trash2 size={18} />
                  )}
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="text-primary-600" size={16} />
                    <span className="text-xs font-semibold text-gray-600">Measurements</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">
                    {Object.keys(measurement.measurements || {}).length}
                  </p>
                </div>
                {measurement.size_recommendations && (
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="text-purple-600" size={16} />
                      <span className="text-xs font-semibold text-gray-600">Sizes</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">
                      {Object.keys(measurement.size_recommendations).length}
                    </p>
                  </div>
                )}
              </div>

              {/* Key Measurements Preview */}
              {measurement.measurements && Object.keys(measurement.measurements).length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-600 mb-2">Key Measurements:</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(measurement.measurements)
                      .slice(0, 3)
                      .map(([key, value]) => (
                        <div
                          key={key}
                          className="px-2 py-1 bg-primary-50 text-primary-700 rounded text-xs font-medium"
                        >
                          {key.replace(/_/g, ' ').substring(0, 15)}: {value.toFixed(1)}cm
                        </div>
                      ))}
                    {Object.keys(measurement.measurements).length > 3 && (
                      <div className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
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
                    console.log('Fetched measurement:', fullMeasurement);
                    
                    // Store in sessionStorage to pass to measurements page
                    const dataToStore = {
                      id: fullMeasurement.id,
                      name: fullMeasurement.name,
                      measurements: fullMeasurement.measurements || {},
                      size_recommendations: fullMeasurement.size_recommendations || {},
                      metadata: fullMeasurement.metadata || {},
                      model_3d: fullMeasurement.model_3d,
                    };
                    
                    console.log('Storing in sessionStorage:', dataToStore);
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
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white font-semibold py-2.5 rounded-xl transition-all transform hover:scale-105"
              >
                <Eye size={18} />
                View Details
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
