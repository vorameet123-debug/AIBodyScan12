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
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Clothing Image Upload */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
          <Sparkles size={14} className="text-indigo-500" />
          Clothing Image <span className="text-rose-500">*</span>
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
            <Upload className="mx-auto mb-3 text-indigo-500" size={40} />
            <p className="text-slate-700 font-medium mb-1">
              {isDragActive ? 'Drop image here!' : 'Drag & drop clothing image or click to browse'}
            </p>
            <p className="text-sm text-slate-500">JPEG, PNG, WEBP (max 10MB)</p>
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
                alt="Clothing preview"
                className="w-full h-56 object-cover"
              />
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
            {savedMeasurements.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          {measurementId && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <CheckCircle className="text-emerald-500" size={18} />
            </div>
          )}
        </div>
        {savedMeasurements.length === 0 && (
          <p className="text-sm text-amber-600 mt-2 font-medium flex items-center gap-2">
            <AlertTriangle size={14} />
            No saved measurements. Please create measurements first.
          </p>
        )}
      </div>

      {/* Clothing Type */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
          <Shirt size={16} className="text-indigo-500" />
          Clothing Type <span className="text-rose-500">*</span>
        </label>
        <select
          value={clothingType}
          onChange={(e) => setClothingType(e.target.value)}
          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all bg-white font-medium text-slate-700"
          required
        >
          <option value="">Select clothing type...</option>
          {CLOTHING_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Size and Size System */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
            <Ruler size={16} className="text-indigo-500" />
            Size <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            placeholder="M, L, 32, etc."
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all bg-white font-medium text-slate-700"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Size System <span className="text-rose-500">*</span>
          </label>
          <select
            value={sizeSystem}
            onChange={(e) => setSizeSystem(e.target.value)}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all bg-white font-medium text-slate-700"
            required
          >
            {SIZE_SYSTEMS.map((sys) => (
              <option key={sys} value={sys}>
                {sys}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Brand (Optional) */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
          <Tag size={16} className="text-indigo-500" />
          Brand (Optional)
        </label>
        <input
          type="text"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          placeholder="Nike, Zara, H&M, etc."
          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all bg-white font-medium text-slate-700"
        />
      </div>

      {/* Material */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
          <Package size={16} className="text-indigo-500" />
          Material <span className="text-rose-500">*</span>
        </label>
        <select
          value={material}
          onChange={(e) => setMaterial(e.target.value)}
          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all bg-white font-medium text-slate-700"
          required
        >
          <option value="">Select material...</option>
          {MATERIALS.map((mat) => (
            <option key={mat} value={mat}>
              {mat}
            </option>
          ))}
        </select>
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
        className="w-full bg-accent-500 hover:bg-accent-600 text-white font-medium py-3 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Analyzing Your Style...</span>
          </>
        ) : (
          <>
            <Sparkles size={18} />
            <span>Check Fit & Style</span>
          </>
        )}
      </button>
    </form>
  );
};
