import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Database, Trash2, Eye, Calendar, User, TrendingUp, Search, Filter, Sparkles, Zap } from 'lucide-react';
import { ApiService, SavedMeasurement, MeasurementResponse } from '../services/api';
import toast from 'react-hot-toast';

export const MyMeasurementsPage: React.FC = () => {
  const navigate = useNavigate();
  const [measurements, setMeasurements] = useState<SavedMeasurement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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
      <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-white/20">
        <div className="flex items-center justify-center py-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full"
          />
          <span className="ml-4 text-lg text-gray-600 font-semibold">Loading saved measurements...</span>
        </div>
      </div>
    );
  }

  if (measurements.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-white/95 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-white/20 overflow-hidden"
      >
        {/* Decorative Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50/30 via-purple-50/30 to-pink-50/30" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary-400/10 to-transparent rounded-full blur-3xl" />
        
        <div className="relative z-10 text-center py-16">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Database className="text-gray-400" size={48} />
          </motion.div>
          <h3 className="text-3xl font-extrabold text-gray-800 mb-3">No Saved Measurements</h3>
          <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
            Save your measurements after processing to access them here later.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/measurements')}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-purple-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            <Zap size={20} />
            Get Your First Measurement
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 overflow-hidden"
      >
        {/* Decorative Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50/30 via-purple-50/30 to-pink-50/30" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-400/10 to-transparent rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-6">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
                  scale: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
                }}
                className="w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg"
              >
                <Database className="text-white" size={32} />
              </motion.div>
              <div>
                <h1 className="text-4xl font-extrabold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                  My Measurements
                </h1>
                <p className="text-gray-600 mt-1">{measurements.length} saved measurement{measurements.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={loadMeasurements}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors text-sm font-semibold flex items-center gap-2"
              >
                <Zap size={16} />
                Refresh
              </button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/measurements')}
                className="px-6 py-2 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                New Measurement
              </motion.button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search measurements by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Measurements Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredMeasurements.map((measurement, index) => (
            <motion.div
              key={measurement.id}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05, type: 'spring', stiffness: 200 }}
              whileHover={{ scale: 1.03, y: -5 }}
              className="relative bg-white/95 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20 overflow-hidden group"
            >
              {/* Decorative Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-50/30 via-purple-50/30 to-pink-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary-400/20 to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-primary-700 transition-colors">
                      {measurement.name}
                    </h3>
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
                  <div className="bg-gradient-to-br from-primary-50 to-purple-50 rounded-xl p-3 border border-primary-200">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="text-primary-600" size={16} />
                      <span className="text-xs font-semibold text-gray-700">Measurements</span>
                    </div>
                    <p className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                      {Object.keys(measurement.measurements || {}).length}
                    </p>
                  </div>
                  {measurement.size_recommendations && (
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-3 border border-purple-200">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="text-purple-600" size={16} />
                        <span className="text-xs font-semibold text-gray-700">Sizes</span>
                      </div>
                      <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        {Object.keys(measurement.size_recommendations).length}
                      </p>
                    </div>
                  )}
                </div>

                {/* Key Measurements Preview */}
                {measurement.measurements && Object.keys(measurement.measurements).length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1">
                      <Sparkles size={12} className="text-primary-500" />
                      Key Measurements:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(measurement.measurements)
                        .slice(0, 3)
                        .map(([key, value]) => (
                          <div
                            key={key}
                            className="px-2 py-1 bg-gradient-to-r from-primary-100 to-purple-100 text-primary-700 rounded-lg text-xs font-medium border border-primary-200"
                          >
                            {key.replace(/_/g, ' ').substring(0, 15)}: {value.toFixed(1)}cm
                          </div>
                        ))}
                      {Object.keys(measurement.measurements).length > 3 && (
                        <div className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs">
                          +{Object.keys(measurement.measurements).length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <button
                  onClick={() => handleViewDetails(measurement)}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 hover:from-primary-700 hover:via-purple-700 hover:to-pink-700 text-white font-semibold py-3 rounded-xl transition-all transform hover:scale-105 shadow-lg group"
                >
                  <Eye size={18} className="group-hover:scale-110 transition-transform" />
                  View Full Details
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
          className="text-center py-12 bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/20"
        >
          <p className="text-gray-600">No measurements found matching "{searchQuery}"</p>
        </motion.div>
      )}
    </div>
  );
};
