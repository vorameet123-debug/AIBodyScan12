import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageUpload } from './ImageUpload';
import { ApiService, MeasurementResponse } from '../services/api';
import toast from 'react-hot-toast';
import { ArrowRight, Lightbulb, Sparkles } from 'lucide-react';

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
      transition={{ duration: 0.4 }}
      className="space-y-8"
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

      {/* Measurement Inputs - Bento Style */}
      <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-200/60">
        <h3 className="text-lg font-semibold text-slate-900 mb-5 tracking-tight">Personal Information</h3>
        
        <div className="grid md:grid-cols-3 gap-5">
          {/* Height */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Height (cm) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="e.g., 175"
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              disabled={isLoading}
            />
          </motion.div>

          {/* Gender */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Gender
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
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
            transition={{ delay: 0.2 }}
          >
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Age (years)
            </label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="e.g., 25"
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              disabled={isLoading}
              min="1"
            />
          </motion.div>
        </div>
      </div>

      {/* Info Box - Premium Style */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="bg-slate-50 rounded-2xl p-5 border border-slate-200/60 flex gap-4"
      >
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
          <Lightbulb className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <p className="font-semibold text-slate-900 text-sm mb-2">Tips for best results</p>
          <ul className="space-y-1.5 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <span className="w-1 h-1 bg-indigo-400 rounded-full mt-2 flex-shrink-0" />
              Take photos with good lighting and clear visibility
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1 h-1 bg-indigo-400 rounded-full mt-2 flex-shrink-0" />
              Wear fitted clothing to show body shape
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1 h-1 bg-indigo-400 rounded-full mt-2 flex-shrink-0" />
              Stand straight with arms at sides
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1 h-1 bg-indigo-400 rounded-full mt-2 flex-shrink-0" />
              Front view should show full body from head to feet
            </li>
          </ul>
        </div>
      </motion.div>

      {/* Submit Button - Premium */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        type="submit"
        disabled={isLoading}
        whileHover={!isLoading ? { scale: 1.01 } : {}}
        whileTap={!isLoading ? { scale: 0.99 } : {}}
        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-4 rounded-full shadow-xl shadow-slate-900/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            <span>Get Measurements</span>
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </motion.button>
    </motion.form>
  );
};
