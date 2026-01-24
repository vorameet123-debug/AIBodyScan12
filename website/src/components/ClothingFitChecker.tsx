import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import Confetti from 'react-confetti';
import { ClothingInputFormV2 } from './ClothingInputFormV2';
import FitMetersDisplay from './FitMetersDisplay';
import RoastCard from './RoastCard';
import GarmentAnalysisDisplay from './GarmentAnalysisDisplay';
import ColorMatchDisplay from './ColorMatchDisplay';
import StyleRecommendationDisplay from './StyleRecommendationDisplay';
import OccasionAnalysisDisplay from './OccasionAnalysisDisplay';
import { SizeRecommendationSlider } from './SizeRecommendationSlider';
import { PurchaseIntent } from './PurchaseIntent';
import { ApiService, NewClothingFitCheckResponse, SavedMeasurement } from '../services/api';
import { RotateCcw, Award } from 'lucide-react';
import { FashionIQWidget } from './FashionIQWidget';
import toast from 'react-hot-toast';

export const ClothingFitChecker: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<NewClothingFitCheckResponse | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [measurements, setMeasurements] = useState<SavedMeasurement[]>([]);
  const controls = useAnimation();
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [iqRefreshTrigger, setIqRefreshTrigger] = useState(0);

  // Window resize handler
  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load measurements
  useEffect(() => {
    const loadM = async () => {
      try {
        const res = await ApiService.getMyMeasurements();
        setMeasurements(res.measurements);
      } catch (e) {
        console.error(e);
      }
    };
    loadM();
  }, []);

  const handleSubmit = async (data: {
    productImage: File;
    measurementId: number;
    size: string;
    occasion: string;
    fitType: string;
  }) => {
    setIsLoading(true);
    const loadingToast = toast.loading('Consulting the fashion gods...');
    try {
      const res = await ApiService.checkClothingFitV2(
        data.productImage, data.measurementId, data.size, data.occasion, data.fitType
      );

      // Debug: Check if size recommendation data is present
      console.log('=== FIT CHECK API RESPONSE ===');
      console.log('Full Response:', res);
      console.log('Has size_recommendation?', !!res.size_recommendation);
      console.log('size_recommendation value:', res.size_recommendation);
      console.log('Has all_sizes?', !!res.all_sizes);
      console.log('all_sizes value:', res.all_sizes);
      console.log('Has check_id?', !!res.check_id);
      console.log('check_id value:', res.check_id);
      console.log('user_selected_size:', res.user_selected_size);
      console.log('==============================');

      setResult(res);
      setIqRefreshTrigger(prev => prev + 1);
      toast.dismiss(loadingToast);

      if (res.overall_score >= 80) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
        toast.success('Wow! Perfect match!', { icon: '🎉' });
      } else {
        toast.success('Analysis ready!');
      }

      controls.start({ opacity: 1, scale: 1 });
    } catch (e: any) {
      toast.dismiss(loadingToast);
      toast.error(e.message || 'Analysis failed');
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white relative">
      {/* Premium Mesh Gradient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-indigo-200/40 to-purple-200/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-br from-pink-200/30 to-rose-200/30 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-gradient-to-br from-violet-200/20 to-fuchsia-200/20 rounded-full blur-3xl" />
      </div>

      {showConfetti && <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={500} />}

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        {/* Hero Header - Premium */}
        <div className="text-center mb-14">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-100 rounded-full mb-6"
          >
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-slate-600">AI-Powered Analysis</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-bold tracking-tight text-slate-900 mb-4"
          >
            FitChecker{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              AI
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-600 max-w-xl mx-auto"
          >
            Fashion analysis that roasts your fit before you buy 🔥
          </motion.p>
        </div>

        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="max-w-2xl mx-auto"
            >
              <div className="bg-white rounded-2xl shadow-bento border border-slate-200/60 p-8">
                <ClothingInputFormV2
                  onSubmit={handleSubmit}
                  measurements={measurements}
                  isLoading={isLoading}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Score Card - Premium Bento Hero */}
              <div className="flex justify-center">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="w-full max-w-4xl"
                >
                  <div className="bg-white rounded-2xl shadow-bento-hover border border-slate-200/60 p-6 flex items-center justify-between">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setResult(null)}
                      className="group flex items-center gap-3 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-full transition-all shadow-lg shadow-slate-900/10"
                    >
                      <RotateCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                      New Check
                    </motion.button>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Your Score</div>
                        <div className={`text-5xl font-bold tracking-tight ${
                          result.overall_score >= 80 ? 'text-emerald-600' :
                          result.overall_score >= 60 ? 'text-amber-600' : 'text-rose-600'
                        }`}>
                          {result.overall_score}
                        </div>
                      </div>
                      <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl border-2 ${
                        result.overall_score >= 80 ? 'border-emerald-200 bg-emerald-50' :
                        result.overall_score >= 60 ? 'border-amber-200 bg-amber-50' :
                        'border-rose-200 bg-rose-50'
                      }`}>
                        {result.overall_score >= 80 ? '🔥' : result.overall_score >= 60 ? '👌' : '😬'}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Size Recommendation Slider */}
              {result.size_recommendation && result.all_sizes && Object.keys(result.all_sizes).length > 0 ? (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.15 }}
                  className="mb-6"
                >
                  <SizeRecommendationSlider
                    allSizes={result.all_sizes}
                    sizeDetails={result.size_recommendation.all_size_details || {}}
                    recommendedSize={result.size_recommendation.recommended_size}
                    recommendedScore={result.size_recommendation.recommended_score}
                    userSelectedSize={result.user_selected_size}
                  />
                </motion.div>
              ) : (
                <div className="bg-amber-50 rounded-2xl border border-amber-200/60 p-4 mb-6">
                  <p className="text-amber-700 text-sm">
                    ⚠️ Size recommendation data not available.
                  </p>
                </div>
              )}

              {/* Purchase Intent */}
              {result.check_id !== undefined && result.check_id !== null ? (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.25 }}
                  className="mb-6"
                >
                  <PurchaseIntent checkId={result.check_id} />
                </motion.div>
              ) : (
                <div className="bg-amber-50 rounded-2xl border border-amber-200/60 p-4 mb-6">
                  <p className="text-amber-700 text-sm">
                    ⚠️ Purchase tracking not available.
                  </p>
                </div>
              )}

              {/* Main Content Grid - Bento */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Metrics */}
                <motion.div
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="bg-white rounded-2xl shadow-bento border border-slate-200/60 overflow-hidden hover:-translate-y-1 hover:shadow-bento-hover transition-all">
                    <GarmentAnalysisDisplay analysis={result.garment_analysis} />
                  </div>
                </motion.div>

                {/* Center Column - Hero Roast */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="lg:col-span-2"
                >
                  <div className="bg-white rounded-2xl shadow-bento border border-slate-200/60 overflow-hidden h-full hover:-translate-y-1 hover:shadow-bento-hover transition-all">
                    <RoastCard roast={result.roast} garmentType={result.garment_analysis.garment_type} />
                  </div>
                </motion.div>
              </div>

              {/* Bottom Row - Analysis Cards Bento Grid */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                <div className="bg-white rounded-2xl shadow-bento border border-slate-200/60 overflow-hidden hover:-translate-y-1 hover:shadow-bento-hover transition-all">
                  <ColorMatchDisplay colorAnalysis={result.color_analysis} />
                </div>
                <div className="bg-white rounded-2xl shadow-bento border border-slate-200/60 overflow-hidden hover:-translate-y-1 hover:shadow-bento-hover transition-all">
                  <StyleRecommendationDisplay styleRecs={result.style_recommendations} />
                </div>
                <div className="bg-white rounded-2xl shadow-bento border border-slate-200/60 overflow-hidden hover:-translate-y-1 hover:shadow-bento-hover transition-all">
                  <OccasionAnalysisDisplay occasionAnalysis={result.occasion_analysis} />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
