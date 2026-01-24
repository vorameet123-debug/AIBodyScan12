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

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Info Banner */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Info className="text-indigo-500 flex-shrink-0 mt-0.5" size={18} />
          <div>
            <p className="text-sm font-medium text-slate-800 mb-1">
              📸 AI-Powered Product Analysis
            </p>
            <p className="text-xs text-slate-600">
              Upload a product image and we'll automatically extract the type, material, and brand using AI!
            </p>
          </div>
        </div>
      </div>

      {/* Product Image Upload */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
          <Camera size={16} className="text-indigo-500" />
          Product Image <span className="text-rose-500">*</span>
        </label>
        {!imagePreview ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${isDragActive
              ? 'border-indigo-500 bg-indigo-50'
              : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
              }`}
          >
            <input {...getInputProps()} />
            <Camera className="mx-auto mb-3 text-indigo-500" size={40} />
            <p className="text-slate-700 font-medium mb-1">
              {isDragActive ? 'Drop image here!' : 'Drag & drop product image'}
            </p>
            <p className="text-sm text-slate-500 mb-2">or click to browse</p>
            <div className="text-xs text-slate-400 space-y-1">
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
            <div className="relative overflow-hidden rounded-xl border border-slate-200">
              <img
                src={imagePreview}
                alt="Product preview"
                className="w-full h-56 object-cover"
              />
              <div className="absolute bottom-2 left-2 bg-emerald-500 text-white px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1">
                <CheckCircle size={12} />
                Image Ready
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 bg-rose-500 text-white rounded-lg p-2 hover:bg-rose-600 transition-colors"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </div>

      {/* Select Person */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
          <User size={16} className="text-indigo-500" />
          Select Person <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <select
            value={measurementId || ''}
            onChange={(e) => setMeasurementId(parseInt(e.target.value))}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all bg-white font-medium text-slate-700"
            required
          >
            <option value="">Select a saved measurement...</option>
            {measurements.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          {measurementId && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <CheckCircle size={18} className="text-emerald-500" />
            </div>
          )}
        </div>
        {measurements.length === 0 && (
          <p className="text-sm text-amber-600 mt-2 font-medium flex items-center gap-2">
            <AlertTriangle size={14} />
            No saved measurements. Please create measurements first.
          </p>
        )}
      </div>

      {/* Size */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
          <Ruler size={16} className="text-indigo-500" />
          Size <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          value={size}
          onChange={(e) => setSize(e.target.value)}
          placeholder="e.g. M, L, 32, 40..."
          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all bg-white font-medium text-slate-700 uppercase tracking-wide text-center"
          required
        />
      </div>

      {/* Fit Type */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
          <Sparkles size={16} className="text-indigo-500" />
          Fit Preference <span className="text-rose-500">*</span>
        </label>
        <select
          value={fitType}
          onChange={(e) => setFitType(e.target.value)}
          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all bg-white font-medium text-slate-700"
          required
        >
          <option value="slim">Slim Fit</option>
          <option value="regular">Regular Fit</option>
          <option value="loose">Loose Fit</option>
        </select>
        <p className="text-xs text-slate-500 mt-1.5 ml-1">
          Slim = Fitted, Regular = Standard, Loose = Relaxed
        </p>
      </div>

      {/* Occasion */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
          <Calendar size={16} className="text-indigo-500" />
          Occasion <span className="text-rose-500">*</span>
        </label>
        <select
          value={occasion}
          onChange={(e) => setOccasion(e.target.value)}
          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all bg-white font-medium text-slate-700"
          required
        >
          <option value="">Select occasion...</option>
          {OCCASIONS.map((occ) => (
            <option key={occ} value={occ}>
              {occ}
            </option>
          ))}
        </select>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
