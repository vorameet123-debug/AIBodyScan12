import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Shirt, Ruler, Tag, Package, Calendar, User, Sparkles, CheckCircle, AlertTriangle } from 'lucide-react';
import { ApiService, SavedMeasurement } from '../services/api';
import toast from 'react-hot-toast';

interface ClothingInputFormProps {
  onSubmit: (data: {
    clothingImage: File;
    measurementId: number;
    clothingType: string;
    size: string;
    sizeSystem: string;
    brand?: string;
    material: string;
    occasion: string;
  }) => void;
  isLoading: boolean;
}

const CLOTHING_TYPES = [
  'T-shirt', 'Shirt', 'Blouse', 'Sweater', 'Jacket', 'Hoodie',
  'Jeans', 'Pants', 'Shorts', 'Trousers', 'Skirt',
  'Dress', 'Gown', 'Jumpsuit'
];

const SIZE_SYSTEMS = ['US', 'UK', 'EU', 'AU', 'JP'];

const OCCASIONS = ['Casual', 'Formal', 'Sports', 'Party', 'Business', 'Wedding', 'Beach', 'Winter', 'Summer'];

const MATERIALS = [
  'Cotton', 'Polyester', 'Wool', 'Linen', 'Silk', 'Denim',
  'Spandex', 'Nylon', 'Rayon', 'Viscose', 'Leather', 'Synthetic Blend'
];

export const ClothingInputForm: React.FC<ClothingInputFormProps> = ({
  onSubmit,
  isLoading,
}) => {
  const [clothingImage, setClothingImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [measurementId, setMeasurementId] = useState<number | null>(null);
  const [clothingType, setClothingType] = useState<string>('');
  const [size, setSize] = useState<string>('');
  const [sizeSystem, setSizeSystem] = useState<string>('US');
  const [brand, setBrand] = useState<string>('');
  const [material, setMaterial] = useState<string>('');
  const [occasion, setOccasion] = useState<string>('');
  const [savedMeasurements, setSavedMeasurements] = useState<SavedMeasurement[]>([]);

  // Load saved measurements
  useEffect(() => {
    const loadMeasurements = async () => {
      try {
        const response = await ApiService.getMyMeasurements();
        setSavedMeasurements(response.measurements);
        if (response.measurements.length > 0) {
          setMeasurementId(response.measurements[0].id);
        }
      } catch (error) {
        console.error('Failed to load measurements:', error);
      }
    };
    loadMeasurements();
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setClothingImage(file);
        const reader = new FileReader();
        reader.onload = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  });

  const handleRemoveImage = () => {
    setClothingImage(null);
    setImagePreview(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!clothingImage) {
      toast.error('Please upload a clothing image');
      return;
    }

    if (!measurementId) {
      toast.error('Please select a person from saved measurements');
      return;
    }

    if (!clothingType) {
      toast.error('Please select clothing type');
      return;
    }

    if (!size) {
      toast.error('Please enter size');
      return;
    }

    if (!material) {
      toast.error('Please select material');
      return;
    }

    if (!occasion) {
      toast.error('Please select occasion');
      return;
    }

    onSubmit({
      clothingImage,
      measurementId,
      clothingType: clothingType.toLowerCase(),
      size,
      sizeSystem,
      brand: brand.trim() || undefined,
      material,
      occasion,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Clothing Image Upload - Enhanced */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
          <Sparkles size={16} className="text-primary-500" />
          Clothing Image <span className="text-red-500">*</span>
        </label>
        {!imagePreview ? (
          <div
            {...getRootProps()}
            className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all overflow-hidden group ${
              isDragActive
                ? 'border-primary-500 bg-gradient-to-br from-primary-50 to-purple-50 shadow-xl scale-105'
                : 'border-gray-300 hover:border-primary-400 hover:bg-gradient-to-br hover:from-gray-50 hover:to-primary-50/30 hover:scale-[1.02]'
            }`}
          >
            <input {...getInputProps()} />
            {/* Animated background */}
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
              <Upload className="mx-auto mb-4 text-primary-500" size={56} />
              <p className="text-gray-700 font-bold text-lg mb-2">
                {isDragActive ? '✨ Drop image here!' : 'Drag & drop clothing image or click to browse'}
              </p>
              <p className="text-sm text-gray-500">JPEG, PNG, WEBP (max 10MB)</p>
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
                alt="Clothing preview"
                className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
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

      {/* Select Person - Enhanced */}
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
          className="relative"
        >
          <select
            value={measurementId || ''}
            onChange={(e) => setMeasurementId(parseInt(e.target.value))}
            className="w-full px-5 py-4 border-2 border-gray-300 rounded-2xl focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 outline-none transition-all bg-white font-semibold text-gray-700 shadow-sm hover:shadow-md"
            required
          >
            <option value="">Select a saved measurement...</option>
            {savedMeasurements.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          {measurementId && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              <CheckCircle className="text-green-500" size={20} />
            </motion.div>
          )}
        </motion.div>
        {savedMeasurements.length === 0 && (
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

      {/* Clothing Type - Enhanced */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            <Shirt size={18} className="text-primary-500" />
          </motion.div>
          Clothing Type <span className="text-red-500">*</span>
        </label>
        <motion.div whileHover={{ scale: 1.01 }}>
          <select
            value={clothingType}
            onChange={(e) => setClothingType(e.target.value)}
            className="w-full px-5 py-4 border-2 border-gray-300 rounded-2xl focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 outline-none transition-all bg-white font-semibold text-gray-700 shadow-sm hover:shadow-md"
            required
          >
            <option value="">Select clothing type...</option>
            {CLOTHING_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </motion.div>
      </div>

      {/* Size and Size System - Enhanced */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div whileHover={{ scale: 1.01 }}>
          <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <Ruler size={18} className="text-primary-500" />
            Size <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            placeholder="M, L, 32, etc."
            className="w-full px-5 py-4 border-2 border-gray-300 rounded-2xl focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 outline-none transition-all bg-white font-semibold text-gray-700 shadow-sm hover:shadow-md"
            required
          />
        </motion.div>
        <motion.div whileHover={{ scale: 1.01 }}>
          <label className="block text-sm font-bold text-gray-700 mb-3">
            Size System <span className="text-red-500">*</span>
          </label>
          <select
            value={sizeSystem}
            onChange={(e) => setSizeSystem(e.target.value)}
            className="w-full px-5 py-4 border-2 border-gray-300 rounded-2xl focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 outline-none transition-all bg-white font-semibold text-gray-700 shadow-sm hover:shadow-md"
            required
          >
            {SIZE_SYSTEMS.map((sys) => (
              <option key={sys} value={sys}>
                {sys}
              </option>
            ))}
          </select>
        </motion.div>
      </div>

      {/* Brand (Optional) - Enhanced */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
          <Tag size={18} className="text-primary-500" />
          Brand (Optional)
        </label>
        <motion.div whileHover={{ scale: 1.01 }}>
          <input
            type="text"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="Nike, Zara, H&M, etc."
            className="w-full px-5 py-4 border-2 border-gray-300 rounded-2xl focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 outline-none transition-all bg-white font-semibold text-gray-700 shadow-sm hover:shadow-md"
          />
        </motion.div>
      </div>

      {/* Material - Enhanced */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
          <Package size={18} className="text-primary-500" />
          Material <span className="text-red-500">*</span>
        </label>
        <motion.div whileHover={{ scale: 1.01 }}>
          <select
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
            className="w-full px-5 py-4 border-2 border-gray-300 rounded-2xl focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 outline-none transition-all bg-white font-semibold text-gray-700 shadow-sm hover:shadow-md"
            required
          >
            <option value="">Select material...</option>
            {MATERIALS.map((mat) => (
              <option key={mat} value={mat}>
                {mat}
              </option>
            ))}
          </select>
        </motion.div>
      </div>

      {/* Occasion - Enhanced */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
          <Calendar size={18} className="text-primary-500" />
          Occasion <span className="text-red-500">*</span>
        </label>
        <motion.div whileHover={{ scale: 1.01 }}>
          <select
            value={occasion}
            onChange={(e) => setOccasion(e.target.value)}
            className="w-full px-5 py-4 border-2 border-gray-300 rounded-2xl focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 outline-none transition-all bg-white font-semibold text-gray-700 shadow-sm hover:shadow-md"
            required
          >
            <option value="">Select occasion...</option>
            {OCCASIONS.map((occ) => (
              <option key={occ} value={occ}>
                {occ}
              </option>
            ))}
          </select>
        </motion.div>
      </div>

      {/* Submit Button - Enhanced */}
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
            <span className="relative z-10 text-lg">Analyzing Your Style...</span>
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
            <span className="relative z-10 text-lg">Check Fit & Style</span>
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
