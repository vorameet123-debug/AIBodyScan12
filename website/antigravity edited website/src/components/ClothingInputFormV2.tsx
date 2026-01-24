import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Ruler, Calendar, User, Sparkles, CheckCircle, AlertTriangle, Camera, Info } from 'lucide-react';
import { ApiService, SavedMeasurement } from '../services/api';
import toast from 'react-hot-toast';

export interface ClothingInputFormV2Props {
  onSubmit: (data: {
    productImage: File;
    measurementId: number;
    size: string;
    occasion: string;
  }) => void;
  measurements: SavedMeasurement[]; // Assuming Measurement is SavedMeasurement
  isLoading: boolean;
}

const SIZE_SYSTEMS = ['US', 'UK', 'EU', 'AU', 'JP'];

const OCCASIONS = ['Casual', 'Formal', 'Sports', 'Party', 'Business', 'Wedding', 'Beach', 'Winter', 'Summer'];

export const ClothingInputFormV2: React.FC<ClothingInputFormV2Props> = ({
  onSubmit,
  measurements,
  isLoading,
}) => {
  // State for product image
  const [productImage, setProductImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // State for form fields
  const [measurementId, setMeasurementId] = useState<number>(0);
  const [size, setSize] = useState('');
  const [occasion, setOccasion] = useState('');
  const [sizeSystem, setSizeSystem] = useState('US');

  // Set initial measurementId if measurements are provided
  useEffect(() => {
    if (measurements.length > 0 && measurementId === 0) {
      setMeasurementId(measurements[0].id);
    }
  }, [measurements, measurementId]);

  // Dropzone for product image
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setProductImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxSize: 10485760, // 10MB
    multiple: false
  });

  const handleRemoveImage = () => {
    setProductImage(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!productImage) {
      toast.error('Please upload a product image');
      return;
    }

    if (!measurementId) {
      toast.error('Please select a saved measurement');
      return;
    }

    if (!size) {
      toast.error('Please enter the size');
      return;
    }

    if (!occasion) {
      toast.error('Please select an occasion');
      return;
    }

    onSubmit({
      productImage,
      measurementId,
      size,
      occasion,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-4"
      >
        <div className="flex items-start gap-3">
          <Info className="text-blue-500 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-sm font-bold text-gray-800 mb-1">
              📸 AI-Powered Product Analysis
            </p>
            <p className="text-xs text-gray-600">
              Upload a product image and we'll automatically extract the type, material, and brand using AI!
            </p>
          </div>
        </div>
      </motion.div>

      {/* Product Image Upload */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
          <Camera size={18} className="text-primary-500" />
          Product Image <span className="text-red-500">*</span>
        </label>
        {!imagePreview ? (
          <div
            {...getRootProps()}
            className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all overflow-hidden group ${isDragActive
              ? 'border-primary-500 bg-gradient-to-br from-primary-50 to-purple-50 shadow-xl scale-105'
              : 'border-gray-300 hover:border-primary-400 hover:bg-gradient-to-br hover:from-gray-50 hover:to-primary-50/30 hover:scale-[1.02]'
              }`}
          >
            <input {...getInputProps()} />
            {isDragActive && (
              <motion.div
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-gradient-to-r from-primary-400/20 to-purple-400/20"
              />
            )}
            <motion.div
              animate={isDragActive ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : { scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="relative z-10"
            >
              <Camera className="mx-auto mb-4 text-primary-500" size={56} />
              <p className="text-gray-700 font-bold text-lg mb-2">
                {isDragActive ? '✨ Drop image here!' : 'Drag & drop product image'}
              </p>
              <p className="text-sm text-gray-500 mb-3">or click to browse</p>
              <div className="text-xs text-gray-400 space-y-1">
                <p>✓ Clear product photo from any store</p>
                <p>✓ AI will extract type, material, and brand</p>
                <p>✓ JPEG, PNG, WEBP (max 10MB)</p>
              </div>
            </motion.div>
          </div>
        ) : (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative group"
          >
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
              <img
                src={imagePreview}
                alt="Product preview"
                className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <CheckCircle size={14} />
                Image Ready
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-3 right-3 bg-red-500 text-white rounded-full p-2.5 hover:bg-red-600 transition shadow-lg"
            >
              <X size={20} />
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Select Person - Premium Dropdown */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <User size={18} className="text-primary-500" />
          </motion.div>
          Select Person <span className="text-red-500">*</span>
        </label>
        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary-200 to-purple-200 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity" />
          <select
            value={measurementId || ''}
            onChange={(e) => setMeasurementId(parseInt(e.target.value))}
            className="relative w-full px-5 py-4 border-2 border-gray-100 bg-white/80 backdrop-blur-sm rounded-2xl focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 outline-none transition-all font-bold text-gray-700 shadow-xl group-hover:shadow-2xl appearance-none cursor-pointer"
            required
          >
            <option value="">Select a saved measurement...</option>
            {measurements.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-primary-500">
            {measurementId ? <CheckCircle size={20} className="text-green-500" /> : <div className="border-t-[6px] border-t-gray-400 border-x-[5px] border-x-transparent" />}
          </div>
        </motion.div>
        {measurements.length === 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-orange-600 mt-2 font-medium flex items-center gap-2"
          >
            <AlertTriangle size={16} />
            No saved measurements. Please create measurements first.
          </motion.p>
        )}
      </div>

      {/* Size */}
      <div className="relative group">
        <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
          <Ruler size={18} className="text-primary-500" />
          Size <span className="text-red-500">*</span>
        </label>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity translate-y-8" />
        <motion.div whileHover={{ scale: 1.01 }} className="relative">
          <input
            type="text"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            placeholder="e.g. M, L, 32, 40..."
            className="relative w-full px-5 py-4 border-2 border-gray-100 bg-white/80 backdrop-blur-sm rounded-2xl focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 outline-none transition-all font-bold text-gray-700 shadow-xl group-hover:shadow-2xl uppercase tracking-widest text-center"
            required
          />
        </motion.div>
      </div>

      {/* Occasion */}
      <div className="relative group">
        <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
          <Calendar size={18} className="text-primary-500" />
          Occasion <span className="text-red-500">*</span>
        </label>
        <div className="absolute inset-0 bg-gradient-to-r from-orange-200 to-red-200 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity translate-y-8" />
        <motion.div whileHover={{ scale: 1.01 }} className="relative">
          <select
            value={occasion}
            onChange={(e) => setOccasion(e.target.value)}
            className="relative w-full px-5 py-4 border-2 border-gray-100 bg-white/80 backdrop-blur-sm rounded-2xl focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 outline-none transition-all font-bold text-gray-700 shadow-xl group-hover:shadow-2xl appearance-none cursor-pointer"
            required
          >
            <option value="">Select occasion...</option>
            {OCCASIONS.map((occ) => (
              <option key={occ} value={occ}>
                {occ}
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none border-t-[6px] border-t-gray-400 border-x-[5px] border-x-transparent" />
        </motion.div>
      </div>

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={isLoading}
        whileHover={isLoading ? {} : { scale: 1.02, boxShadow: '0 20px 40px rgba(139, 92, 246, 0.5)' }}
        whileTap={isLoading ? {} : { scale: 0.98 }}
        className="relative w-full bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 text-white font-bold py-5 px-6 rounded-2xl transition-all shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 overflow-hidden group"
      >
        {/* Animated Shine Effect */}
        {!isLoading && (
          <motion.div
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          />
        )}

        {/* Background Pulse */}
        <motion.div
          animate={isLoading ? { opacity: [0.5, 1, 0.5] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute inset-0 bg-gradient-to-r from-primary-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity"
        />

        {isLoading ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="relative z-10"
            >
              <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full" />
            </motion.div>
            <span className="relative z-10 text-lg">Analyzing Product Page...</span>
          </>
        ) : (
          <>
            <motion.div
              animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
              transition={{ rotate: { duration: 3, repeat: Infinity, ease: 'linear' }, scale: { duration: 2, repeat: Infinity } }}
              className="relative z-10"
            >
              <Sparkles size={24} />
            </motion.div>
            <span className="relative z-10 text-lg">AI Fit Check</span>
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="relative z-10"
            >
              <Sparkles size={20} className="opacity-70" />
            </motion.div>
          </>
        )}
      </motion.button>
    </form>
  );
};
