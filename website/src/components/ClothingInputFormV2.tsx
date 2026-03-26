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
    fitType: string;
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
  const [fitType, setFitType] = useState('slim');
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
      fitType,
    });
  };

  // Common input styles for dark theme
  const inputStyles = "w-full px-4 py-3.5 bg-slate-700/50 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all duration-300";

  const selectStyles = `${inputStyles} appearance-none cursor-pointer`;

  const selectStyleProps = {
    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
    backgroundPosition: 'right 12px center',
    backgroundRepeat: 'no-repeat' as const,
    backgroundSize: '20px',
    paddingRight: '44px'
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Info Banner - Dark Glass Style */}
      <div className="bg-violet-500/10 backdrop-blur-sm border border-violet-500/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Info className="text-violet-400 flex-shrink-0 mt-0.5" size={18} />
          <div>
            <p className="text-sm font-medium text-white mb-1">
              📸 AI-Powered Product Analysis
            </p>
            <p className="text-xs text-slate-400">
              Upload a product image and we'll automatically extract the type, material, and brand using AI!
            </p>
          </div>
        </div>
      </div>

      {/* Product Image Upload - Dark Glass Style */}
      <div>
        <label className="block text-sm font-semibold text-slate-200 mb-2 flex items-center gap-2">
          <Camera size={16} className="text-violet-400" />
          Product Image <span className="text-rose-400">*</span>
        </label>
        {!imagePreview ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all backdrop-blur-sm ${isDragActive
              ? 'border-violet-500 bg-violet-500/10'
              : 'border-white/15 bg-slate-800/50 hover:border-violet-500/50 hover:bg-violet-500/10'
              }`}
          >
            <input {...getInputProps()} />
            <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-violet-500/20 flex items-center justify-center border border-violet-500/30">
              <Camera className="text-violet-400" size={28} />
            </div>
            <p className="text-white font-medium mb-1">
              {isDragActive ? 'Drop image here!' : 'Drag & drop product image'}
            </p>
            <p className="text-sm text-slate-400 mb-3">or click to browse</p>
            <div className="text-xs text-slate-500 space-y-1">
              <p>✓ Clear product photo from any store</p>
              <p>✓ AI will extract type, material, and brand</p>
              <p>✓ JPEG, PNG, WEBP (max 10MB)</p>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative"
          >
            <div className="relative overflow-hidden rounded-xl border border-white/10">
              <img
                src={imagePreview}
                alt="Product preview"
                className="w-full h-56 object-cover"
              />
              <div className="absolute bottom-2 left-2 bg-emerald-500 text-white px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 shadow-lg shadow-emerald-500/25">
                <CheckCircle size={12} />
                Image Ready
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 bg-rose-500 text-white rounded-lg p-2 hover:bg-rose-600 transition-colors shadow-lg"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </div>

      {/* Select Person - Dark Glass Style */}
      <div>
        <label className="block text-sm font-semibold text-slate-200 mb-2 flex items-center gap-2">
          <User size={16} className="text-violet-400" />
          Select Person <span className="text-rose-400">*</span>
        </label>
        <div className="relative">
          <select
            value={measurementId || ''}
            onChange={(e) => setMeasurementId(parseInt(e.target.value))}
            className={selectStyles}
            style={selectStyleProps}
            required
          >
            <option value="" className="bg-slate-800">Select a saved measurement...</option>
            {measurements.map((m) => (
              <option key={m.id} value={m.id} className="bg-slate-800">
                {m.name}
              </option>
            ))}
          </select>
          {measurementId > 0 && (
            <div className="absolute right-12 top-1/2 -translate-y-1/2">
              <CheckCircle size={18} className="text-emerald-400" />
            </div>
          )}
        </div>
        {measurements.length === 0 && (
          <p className="text-sm text-amber-400 mt-2 font-medium flex items-center gap-2">
            <AlertTriangle size={14} />
            No saved measurements. Please create measurements first.
          </p>
        )}
      </div>

      {/* Size - Dark Glass Style */}
      <div>
        <label className="block text-sm font-semibold text-slate-200 mb-2 flex items-center gap-2">
          <Ruler size={16} className="text-violet-400" />
          Size <span className="text-rose-400">*</span>
        </label>
        <input
          type="text"
          value={size}
          onChange={(e) => setSize(e.target.value)}
          placeholder="e.g. M, L, 32, 40..."
          className={`${inputStyles} uppercase tracking-wide text-center`}
          required
        />
      </div>

      {/* Fit Type - Dark Glass Style */}
      <div>
        <label className="block text-sm font-semibold text-slate-200 mb-2 flex items-center gap-2">
          <Sparkles size={16} className="text-violet-400" />
          Fit Preference <span className="text-rose-400">*</span>
        </label>
        <select
          value={fitType}
          onChange={(e) => setFitType(e.target.value)}
          className={selectStyles}
          style={selectStyleProps}
          required
        >
          <option value="slim" className="bg-slate-800">Slim Fit</option>
          <option value="regular" className="bg-slate-800">Regular Fit</option>
          <option value="loose" className="bg-slate-800">Loose Fit</option>
        </select>
        <p className="text-xs text-slate-500 mt-1.5 ml-1">
          Slim = Fitted, Regular = Standard, Loose = Relaxed
        </p>
      </div>

      {/* Occasion - Dark Glass Style */}
      <div>
        <label className="block text-sm font-semibold text-slate-200 mb-2 flex items-center gap-2">
          <Calendar size={16} className="text-violet-400" />
          Occasion <span className="text-rose-400">*</span>
        </label>
        <select
          value={occasion}
          onChange={(e) => setOccasion(e.target.value)}
          className={selectStyles}
          style={selectStyleProps}
          required
        >
          <option value="" className="bg-slate-800">Select occasion...</option>
          {OCCASIONS.map((occ) => (
            <option key={occ} value={occ} className="bg-slate-800">
              {occ}
            </option>
          ))}
        </select>
      </div>

      {/* Submit Button - Gradient Style */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-violet-500/25"
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Analyzing Product Page...</span>
          </>
        ) : (
          <>
            <Sparkles size={18} />
            <span>AI Fit Check</span>
          </>
        )}
      </button>
    </form>
  );
};
