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
import { ApiService, NewClothingFitCheckResponse, SavedMeasurement } from '../services/api';
import { RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';

export const ClothingFitChecker: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<NewClothingFitCheckResponse | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [measurements, setMeasurements] = useState<SavedMeasurement[]>([]);
  const controls = useAnimation();
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

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
  }) => {
    setIsLoading(true);
    const loadingToast = toast.loading('Consulting the fashion gods...');
    try {
      const res = await ApiService.checkClothingFitV2(
        data.productImage, data.measurementId, data.size, data.occasion
      );
      setResult(res);
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 pb-20 relative">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {showConfetti && <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={500} />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Hero Header */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-7xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-red-600"
          >
            FitChecker AI
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto font-medium"
          >
            AI-powered fashion analysis that roasts your fit before you buy 🔥
          </motion.p>
        </div>

        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-2xl mx-auto"
            >
              <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8">
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
              {/* Floating Score Card */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-3xl blur-xl opacity-50"></div>
                <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setResult(null)}
                      className="group flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white font-bold rounded-2xl transition-all transform hover:scale-105 shadow-lg"
                    >
                      <RotateCcw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
                      New Check
                    </button>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-sm text-gray-500 uppercase tracking-widest font-bold mb-1">Your Score</div>
                        <div className={`text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r ${result.overall_score >= 80 ? 'from-green-400 to-emerald-600' :
                            result.overall_score >= 60 ? 'from-yellow-400 to-orange-600' :
                              'from-red-400 to-pink-600'
                          }`}>
                          {result.overall_score}
                        </div>
                      </div>
                      <div className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl font-black border-8 ${result.overall_score >= 80 ? 'border-green-400 bg-green-50' :
                          result.overall_score >= 60 ? 'border-yellow-400 bg-yellow-50' :
                            'border-red-400 bg-red-50'
                        }`}>
                        {result.overall_score >= 80 ? '🔥' : result.overall_score >= 60 ? '👌' : '😬'}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Metrics */}
                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-6"
                >
                  <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 overflow-hidden">
                    <FitMetersDisplay fitMeters={result.fit_meters} />
                  </div>
                  <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 overflow-hidden">
                    <GarmentAnalysisDisplay analysis={result.garment_analysis} />
                  </div>
                </motion.div>

                {/* Center Column - Hero Roast */}
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="lg:col-span-2"
                >
                  <div className="relative h-full">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-500 rounded-3xl blur-xl opacity-30"></div>
                    <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden h-full">
                      <RoastCard roast={result.roast} garmentType={result.garment_analysis.garment_type} />
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Bottom Row - Analysis Cards */}
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 overflow-hidden transform hover:scale-105 transition-transform">
                  <ColorMatchDisplay colorAnalysis={result.color_analysis} />
                </div>
                <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 overflow-hidden transform hover:scale-105 transition-transform">
                  <StyleRecommendationDisplay styleRecs={result.style_recommendations} />
                </div>
                <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 overflow-hidden transform hover:scale-105 transition-transform">
                  <OccasionAnalysisDisplay occasionAnalysis={result.occasion_analysis} />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div >
  );
};
