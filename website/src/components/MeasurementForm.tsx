import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageUpload } from './ImageUpload';
import { ApiService, MeasurementResponse } from '../services/api';
import toast from 'react-hot-toast';
import { ArrowRight, Lightbulb, Sparkles } from 'lucide-react';
import { useSubscription } from '../contexts/SubscriptionContext';
import { UpgradeModal } from './UpgradeModal';

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
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeModalData, setUpgradeModalData] = useState<{
    currentCount: number;
    limit: number;
    message: string;
  } | null>(null);

  const { checkCanUse, trackUsage, remainingBodyScans, isPro } = useSubscription();

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

    // Check if user can use body scan feature
    const canUseResult = await checkCanUse('body_scan');
    if (!canUseResult.can_use) {
      setUpgradeModalData({
        currentCount: canUseResult.current_count,
        limit: canUseResult.limit,
        message: canUseResult.message,
      });
      setShowUpgradeModal(true);
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
        // Track usage after successful scan
        await trackUsage('body_scan');

        // Show remaining scans for free users
        if (!isPro) {
          const remaining = remainingBodyScans - 1;
          if (remaining > 0) {
            toast.success(`Measurements extracted! ${remaining} free scan${remaining === 1 ? '' : 's'} remaining this month.`, { id: loadingToast });
          } else {
            toast.success('Measurements extracted! This was your last free scan this month.', { id: loadingToast });
          }
        } else {
          toast.success('Measurements extracted successfully!', { id: loadingToast });
        }
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
    <>
      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature="body_scan"
        currentCount={upgradeModalData?.currentCount}
        limit={upgradeModalData?.limit}
        message={upgradeModalData?.message}
      />

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

        {/* Measurement Inputs - Dark Glass Style */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-5 tracking-tight">Personal Information</h3>

          <div className="grid md:grid-cols-3 gap-5">
            {/* Height */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Height (cm) <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="e.g., 175"
                className="w-full px-4 py-3.5 bg-slate-700/50 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all duration-300"
                disabled={isLoading}
              />
            </motion.div>

            {/* Gender */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-700/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all duration-300 appearance-none cursor-pointer"
                disabled={isLoading}
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 12px center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '20px',
                  paddingRight: '44px'
                }}
              >
                <option value="" className="bg-slate-800">Not specified</option>
                <option value="male" className="bg-slate-800">Male</option>
                <option value="female" className="bg-slate-800">Female</option>
              </select>
            </motion.div>

            {/* Age */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Age (years)
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g., 25"
                className="w-full px-4 py-3.5 bg-slate-700/50 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all duration-300"
                disabled={isLoading}
                min="1"
              />
            </motion.div>
          </div>
        </div>

        {/* Info Box - Dark Glass Style */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-5 border border-white/10 flex gap-4"
        >
          <div className="w-10 h-10 bg-violet-500/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-violet-500/30">
            <Lightbulb className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <p className="font-semibold text-white text-sm mb-2">Tips for best results</p>
            <ul className="space-y-1.5 text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <span className="w-1 h-1 bg-violet-400 rounded-full mt-2 flex-shrink-0" />
                Take photos with good lighting and clear visibility
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1 h-1 bg-violet-400 rounded-full mt-2 flex-shrink-0" />
                Wear fitted clothing to show body shape
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1 h-1 bg-violet-400 rounded-full mt-2 flex-shrink-0" />
                Stand straight with arms at sides
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1 h-1 bg-violet-400 rounded-full mt-2 flex-shrink-0" />
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
          className="btn-gradient w-full py-4 font-semibold text-lg shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
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
    </>
  );
};
