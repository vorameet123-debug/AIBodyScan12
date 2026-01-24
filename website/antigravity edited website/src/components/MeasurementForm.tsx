import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageUpload } from './ImageUpload';
import { ApiService, MeasurementResponse } from '../services/api';
import toast from 'react-hot-toast';
import { Send, AlertCircle } from 'lucide-react';

interface MeasurementFormProps {
  onSuccess: (data: MeasurementResponse) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const MeasurementForm: React.FC<MeasurementFormProps> = ({
  onSuccess,
  isLoading,
  setIsLoading,
}) => {
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [sideImage, setSideImage] = useState<File | null>(null);
  const [height, setHeight] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [age, setAge] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!frontImage) {
      toast.error('Front image is required');
      return;
    }

    if (!height || parseFloat(height) <= 0) {
      toast.error('Please enter a valid height');
      return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading('Processing your images...');

    try {
      const response = await ApiService.processMeasurements(
        frontImage,
        sideImage || undefined,
        parseFloat(height),
        gender || undefined,
        age ? parseInt(age) : undefined
      );

      if (response.success) {
        toast.success('Measurements extracted successfully!', { id: loadingToast });
        onSuccess(response);
      } else {
        toast.error(response.error || 'Failed to extract measurements', { id: loadingToast });
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || error.message || 'An error occurred';
      toast.error(errorMessage, { id: loadingToast });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="space-y-6"
    >
      {/* Image Uploads */}
      <div className="grid md:grid-cols-2 gap-6">
        <ImageUpload
          label="Front View Photo"
          value={frontImage}
          onChange={setFrontImage}
          required
        />
        <ImageUpload
          label="Side View Photo (Optional)"
          value={sideImage}
          onChange={setSideImage}
        />
      </div>

      {/* Measurement Inputs */}
      <div className="bg-white rounded-2xl p-6 shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
        
        <div className="grid md:grid-cols-3 gap-4">
          {/* Height */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Height (cm) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="e.g., 175"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition"
              disabled={isLoading}
            />
          </motion.div>

          {/* Gender */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition"
              disabled={isLoading}
            >
              <option value="">Not specified</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </motion.div>

          {/* Age */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Age (years)
            </label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="e.g., 25"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition"
              disabled={isLoading}
              min="1"
            />
          </motion.div>
        </div>
      </div>

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="bg-blue-50 border-l-4 border-primary-500 p-4 rounded-lg flex gap-3"
      >
        <AlertCircle className="text-primary-500 flex-shrink-0 mt-0.5" size={20} />
        <div className="text-sm text-gray-700">
          <p className="font-medium mb-1">Tips for best results:</p>
          <ul className="list-disc list-inside space-y-1 text-xs text-gray-600">
            <li>Take photos with good lighting and clear visibility</li>
            <li>Wear fitted clothing to show body shape</li>
            <li>Stand straight with arms at sides</li>
            <li>Front view should show full body from head to feet</li>
          </ul>
        </div>
      </motion.div>

      {/* Submit Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        type="submit"
        disabled={isLoading}
        whileHover={!isLoading ? { scale: 1.02 } : {}}
        whileTap={!isLoading ? { scale: 0.98 } : {}}
        className="w-full bg-gradient-to-r from-primary-500 to-primary-700 text-white font-semibold py-4 rounded-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
            />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <Send size={20} />
            <span>Get Measurements</span>
          </>
        )}
      </motion.button>
    </motion.form>
  );
};
