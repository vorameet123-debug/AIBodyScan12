import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Database, Trash2, Eye, Calendar, User, TrendingUp, Search, Sparkles, Zap, Plus, RotateCcw } from 'lucide-react';
import { ApiService, SavedMeasurement, MeasurementResponse } from '../services/api';
import toast from 'react-hot-toast';
import { Spinner } from './ui/Spinner';
import { ConfirmModal } from './ui/ConfirmModal';
import { useAuth } from '../contexts/AuthContext';

export const MyMeasurementsPage: React.FC = () => {
  const navigate = useNavigate();

  const [measurements, setMeasurements] = useState<SavedMeasurement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; name: string } | null>(null);

  const { userId } = useAuth();

  const loadMeasurements = async () => {
    setIsLoading(true);
    try {
      const response = await ApiService.getMyMeasurements();
      setMeasurements(response.measurements || []);
    } catch (error: any) {
      toast.error('Failed to load saved measurements');
      console.error(error);
      setMeasurements([]); // Set to empty array on error
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

  const handleViewDetails = async (measurement: SavedMeasurement) => {
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
    } catch (error: any) {
      toast.error('Failed to load measurement details');
      console.error('Error loading measurement:', error);
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

  // Filter measurements based on search query
  const filteredMeasurements = measurements.filter(measurement =>
    measurement.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="flex items-center gap-4">
          <Spinner size="lg" />
          <span className="text-slate-400 font-medium">Loading saved measurements...</span>
        </div>
      </div>
    );
  }

  if (measurements.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '-2s' }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bento-card-premium p-12 text-center"
          >
            <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Database className="text-slate-500 w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No Saved Measurements</h3>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
              Save your measurements after processing to access them here later.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/measurements')}
              className="btn-gradient inline-flex items-center gap-2"
            >
              <Zap className="w-5 h-5" />
              Get Your First Measurement
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '-2s' }} />
        <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '-4s' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bento-card p-6"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Database className="text-white w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  My Measurements
                </h1>
                <p className="text-slate-400 text-sm">{measurements.length} saved measurement{measurements.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={loadMeasurements}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors text-sm font-medium flex items-center gap-2 border border-slate-700"
              >
                <RotateCcw className="w-4 h-4" />
                Refresh
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/measurements')}
                className="btn-gradient inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Measurement
              </motion.button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search measurements by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 transition-all text-sm"
              aria-label="Search measurements by name"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-300"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </motion.div>

        {/* Measurements Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredMeasurements.map((measurement, index) => (
              <motion.div
                key={measurement.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.03 }}
                className="bento-card p-5 hover:border-accent-500/30 transition-colors group"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-accent-300 transition-colors">
                      {measurement.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatDate(measurement.created_at)}</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(measurement.id, measurement.name);
                    }}
                    disabled={deletingId === measurement.id}
                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all disabled:opacity-50"
                    aria-label={`Delete measurement for ${measurement.name}`}
                  >
                    {deletingId === measurement.id ? (
                      <Spinner size="sm" color="rose-400" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="text-accent-400 w-3.5 h-3.5" />
                      <span className="text-xs font-medium text-slate-400">Measurements</span>
                    </div>
                    <p className="text-xl font-bold text-white">
                      {Object.keys(measurement.measurements || {}).length}
                    </p>
                  </div>
                  {measurement.size_recommendations && (
                    <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="text-purple-400 w-3.5 h-3.5" />
                        <span className="text-xs font-medium text-slate-400">Sizes</span>
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
                    <p className="text-xs font-medium text-slate-400 mb-2 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-accent-400" />
                      Key Measurements:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(measurement.measurements)
                        .slice(0, 3)
                        .map(([key, value]) => (
                          <div
                            key={key}
                            className="px-2 py-1 bg-accent-500/10 text-accent-300 rounded-lg text-xs font-medium border border-accent-500/20"
                          >
                            {key.replace(/_/g, ' ').substring(0, 15)}: {value.toFixed(1)}cm
                          </div>
                        ))}
                      {Object.keys(measurement.measurements).length > 3 && (
                        <div className="px-2 py-1 bg-slate-800 text-slate-400 rounded-lg text-xs border border-slate-700">
                          +{Object.keys(measurement.measurements).length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleViewDetails(measurement)}
                    className="flex-1 flex items-center justify-center gap-2 bg-accent-600 hover:bg-accent-700 text-white font-medium py-2.5 rounded-xl transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      // Store measurement ID and name for update mode
                      sessionStorage.setItem('updateMeasurementId', measurement.id.toString());
                      sessionStorage.setItem('updateMeasurementName', measurement.name);
                      navigate('/measurements');
                    }}
                    className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-xl transition-colors"
                  >
                    <Zap className="w-4 h-4" />
                    Update
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* No Results Message */}
        {filteredMeasurements.length === 0 && searchQuery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bento-card p-8"
          >
            <p className="text-slate-400">No measurements found matching "{searchQuery}"</p>
          </motion.div>
        )}
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
    </div>
  );
};
