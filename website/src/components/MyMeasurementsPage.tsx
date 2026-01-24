import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Database, Trash2, Eye, Calendar, User, TrendingUp, Search, Sparkles, Zap } from 'lucide-react';
import { ApiService, SavedMeasurement, MeasurementResponse } from '../services/api';
import { CompactBodyTracker } from './CompactBodyTracker';
import toast from 'react-hot-toast';

export const MyMeasurementsPage: React.FC = () => {
  const navigate = useNavigate();

  const [measurements, setMeasurements] = useState<SavedMeasurement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const userId = 1; // TODO: Get from auth context

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

  const handleViewDetails = async (measurement: SavedMeasurement) => {
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
      <div className="bg-white rounded-2xl p-12 shadow-bento border border-slate-200/60">
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="ml-4 text-slate-600 font-medium">Loading saved measurements...</span>
        </div>
      </div>
    );
  }

  if (measurements.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-12 shadow-bento border border-slate-200/60"
      >
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Database className="text-slate-400" size={32} />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">No Saved Measurements</h3>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">
            Save your measurements after processing to access them here later.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/measurements')}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white font-medium py-2.5 px-5 rounded-xl hover:bg-indigo-700 transition-colors"
          >
            <Zap size={18} />
            Get Your First Measurement
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 shadow-bento border border-slate-200/60"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
              <Database className="text-indigo-600" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                My Measurements
              </h1>
              <p className="text-slate-500 text-sm">{measurements.length} saved measurement{measurements.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadMeasurements}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors text-sm font-medium flex items-center gap-2"
            >
              <Zap size={16} />
              Refresh
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/measurements')}
              className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
            >
              New Measurement
            </motion.button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search measurements by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
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
              className="bg-white rounded-2xl p-5 shadow-bento border border-slate-200/60 hover:border-indigo-200 transition-colors"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900 mb-1">
                    {measurement.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Calendar size={14} />
                    <span>{formatDate(measurement.created_at)}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(measurement.id, measurement.name)}
                  disabled={deletingId === measurement.id}
                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
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
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="text-indigo-600" size={14} />
                    <span className="text-xs font-medium text-slate-600">Measurements</span>
                  </div>
                  <p className="text-xl font-bold text-slate-900">
                    {Object.keys(measurement.measurements || {}).length}
                  </p>
                </div>
                {measurement.size_recommendations && (
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="text-purple-600" size={14} />
                      <span className="text-xs font-medium text-slate-600">Sizes</span>
                    </div>
                    <p className="text-xl font-bold text-slate-900">
                      {Object.keys(measurement.size_recommendations).length}
                    </p>
                  </div>
                )}
              </div>

              {/* Key Measurements Preview */}
              {measurement.measurements && Object.keys(measurement.measurements).length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-slate-600 mb-2 flex items-center gap-1">
                    <Sparkles size={12} className="text-indigo-500" />
                    Key Measurements:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(measurement.measurements)
                      .slice(0, 3)
                      .map(([key, value]) => (
                        <div
                          key={key}
                            className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-medium border border-indigo-100"
                          >
                            {key.replace(/_/g, ' ').substring(0, 15)}: {value.toFixed(1)}cm
                          </div>
                        ))}
                      {Object.keys(measurement.measurements).length > 3 && (
                        <div className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs">
                          +{Object.keys(measurement.measurements).length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewDetails(measurement)}
                    className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-xl transition-colors"
                  >
                    <Eye size={16} />
                    View Details
                  </button>
                  <button
                    onClick={() => {
                      // Store measurement ID and name for update mode
                      sessionStorage.setItem('updateMeasurementId', measurement.id.toString());
                      sessionStorage.setItem('updateMeasurementName', measurement.name);
                      console.log(`Update mode set: ID=${measurement.id}, Name=${measurement.name}`);
                      navigate('/measurements');
                    }}
                    className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-xl transition-colors"
                  >
                    <Zap size={16} />
                    Update
                  </button>
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
          className="text-center py-12 bg-white rounded-2xl p-8 shadow-bento border border-slate-200/60"
        >
          <p className="text-slate-600">No measurements found matching "{searchQuery}"</p>
        </motion.div>
      )}

      {/* Body Progress Tracker Section */}
      {measurements.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-bento border border-slate-200/60"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-indigo-600" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Body Progress Tracker
              </h2>
              <p className="text-slate-500 text-sm">Track your measurements and see your progress over time</p>
            </div>
          </div>
          <CompactBodyTracker userId={userId} />
        </motion.div>
      )}
    </div>
  );
};
