import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { Sparkles, ArrowRight, RotateCcw, Loader2, CheckCircle2, TrendingUp, Shirt, Target, Palette, Calendar, ShoppingBag, Star } from 'lucide-react';
import { ClothingInputFormV2 } from './ClothingInputFormV2';
import FitMetersDisplay from './FitMetersDisplay';
import RoastCard from './RoastCard';
import GarmentAnalysisDisplay from './GarmentAnalysisDisplay';
import ColorMatchDisplay from './ColorMatchDisplay';
import StyleRecommendationDisplay from './StyleRecommendationDisplay';
import OccasionAnalysisDisplay from './OccasionAnalysisDisplay';
import { PurchaseIntent } from './PurchaseIntent';
import { SizeRecommendationSlider } from './SizeRecommendationSlider';
import { ApiService, NewClothingFitCheckResponse, SavedMeasurement } from '../services/api';
import toast from 'react-hot-toast';
import { useSubscription } from '../contexts/SubscriptionContext';
import { UpgradeModal } from './UpgradeModal';

// ============================================
// MAIN COMPONENT
// ============================================
const ClothingFitChecker: React.FC = () => {
  // ========== STATE (PRESERVED) ==========
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<NewClothingFitCheckResponse | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [measurements, setMeasurements] = useState<SavedMeasurement[]>([]);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeModalData, setUpgradeModalData] = useState<{
    currentCount: number;
    limit: number;
    message: string;
  } | null>(null);

  const { checkCanUse, trackUsage, remainingFitChecks, isPro } = useSubscription();

  // ========== EFFECTS (PRESERVED) ==========
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const loadMeasurements = async () => {
      try {
        const res = await ApiService.getMyMeasurements();
        setMeasurements(res.measurements);
      } catch (error) {
        console.error('Failed to load measurements:', error);
      }
    };
    loadMeasurements();
  }, []);

  // ========== HANDLERS (PRESERVED) ==========
  const handleSubmit = async (data: {
    productImage: File;
    measurementId: number;
    size: string;
    occasion: string;
  }) => {
    // Check if user can use fit check feature
    const canUseResult = await checkCanUse('fit_check');
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
    setResult(null);
    const loadingToast = toast.loading('Consulting the fashion gods...');

    try {
      const res = await ApiService.checkClothingFitV2(
        data.productImage,
        data.measurementId,
        data.size,
        data.occasion
      );
      setResult(res);
      toast.dismiss(loadingToast);

      // Track usage after successful analysis
      await trackUsage('fit_check');

      // Show confetti for great fits
      if (res.overall_score >= 80) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
        toast.success('Wow! Perfect match!', { icon: '🎉' });
      } else {
        // Show remaining checks for free users
        if (!isPro) {
          const remaining = remainingFitChecks - 1;
          if (remaining > 0) {
            toast.success(`Analysis ready! ${remaining} free check${remaining === 1 ? '' : 's'} remaining.`);
          } else {
            toast.success('Analysis ready! This was your last free check this month.');
          }
        } else {
          toast.success('Analysis ready!');
        }
      }
    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error(error.message || 'Fit check failed');
      console.error('Fit check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setShowConfetti(false);
  };

  // ========== SCORE HELPERS ==========
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'from-emerald-500 to-green-400';
    if (score >= 60) return 'from-amber-500 to-yellow-400';
    return 'from-red-500 to-orange-400';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Perfect Match!';
    if (score >= 80) return 'Great Fit!';
    if (score >= 70) return 'Good Fit';
    if (score >= 60) return 'Decent Fit';
    return 'Needs Work';
  };

  // ========================================
  // RENDER
  // ========================================
  return (
    <>
      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature="fit_check"
        currentCount={upgradeModalData?.currentCount}
        limit={upgradeModalData?.limit}
        message={upgradeModalData?.message}
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '-2s' }} />
          <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '-4s' }} />
        </div>

        {/* Confetti */}
        {showConfetti && (
          <Confetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={false}
            numberOfPieces={300}
            gravity={0.2}
            colors={['#10b981', '#6366f1', '#f59e0b', '#ec4899', '#8b5cf6']}
          />
        )}

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

          {/* ========== HERO SECTION ========== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-500/10 border border-accent-500/20 mb-6">
              <Sparkles className="w-4 h-4 text-accent-400" />
              <span className="text-sm font-medium text-accent-300">AI-Powered Fit Analysis</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              <span className="text-white">Will It </span>
              <span className="bg-gradient-to-r from-accent-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Fit?
              </span>
            </h1>

            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              Upload any clothing item and get instant AI analysis on how it'll fit your body.
              No more guessing, no more returns.
            </p>
          </motion.div>

          {/* ========== MAIN CONTENT ========== */}
          <AnimatePresence mode="wait">
            {!result ? (
              // ========== FORM STATE ==========
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-3xl mx-auto"
              >
                <div className="bento-card-premium p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-500 to-purple-500 flex items-center justify-center">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-white">Fit Check Form</h2>
                      <p className="text-sm text-slate-300">Enter clothing details for analysis</p>
                    </div>
                  </div>

                  <ClothingInputFormV2
                    onSubmit={handleSubmit}
                    isLoading={isLoading}
                    measurements={measurements}
                  />

                  {/* Loading State */}
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-8 flex flex-col items-center justify-center py-12"
                    >
                      <div className="relative">
                        <div className="w-20 h-20 rounded-full border-4 border-accent-500/20" />
                        <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-accent-500 border-t-transparent animate-spin" />
                        <Shirt className="absolute inset-0 m-auto w-8 h-8 text-accent-400" />
                      </div>
                      <p className="mt-6 text-lg font-medium text-white">Analyzing your fit...</p>
                      <p className="text-sm text-slate-400 mt-2">Our AI is measuring every detail</p>
                    </motion.div>
                  )}
                </div>

                {/* Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                  {[
                    { icon: Target, title: 'Precise Fit', desc: 'Measurements down to the cm' },
                    { icon: Palette, title: 'Color Match', desc: 'See how colors complement you' },
                    { icon: Calendar, title: 'Occasion Ready', desc: 'Style tips for any event' },
                  ].map((feature, i) => (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bento-card p-5 text-center group hover:border-accent-500/30 transition-colors"
                    >
                      <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-accent-500/10 flex items-center justify-center group-hover:bg-accent-500/20 transition-colors">
                        <feature.icon className="w-5 h-5 text-accent-400" />
                      </div>
                      <h3 className="font-medium text-white mb-1">{feature.title}</h3>
                      <p className="text-sm text-slate-400">{feature.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : (
              // ========== RESULTS STATE ==========
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* ===== ROW 1: Header + Roast Card ===== */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Score & Header */}
                  <div className="lg:col-span-1 bento-card p-5 flex items-center gap-4">
                    {/* Compact Score Circle */}
                    {result.overall_score !== undefined && (
                      <div className="relative flex-shrink-0">
                        <svg className="w-20 h-20 -rotate-90">
                          <circle cx="40" cy="40" r="34" fill="none" stroke="currentColor" strokeWidth="6" className="text-slate-700" />
                          <motion.circle
                            cx="40" cy="40" r="34" fill="none"
                            stroke="url(#scoreGradient)" strokeWidth="6" strokeLinecap="round"
                            initial={{ strokeDasharray: '0 213.6' }}
                            animate={{ strokeDasharray: `${(result.overall_score / 100) * 213.6} 213.6` }}
                            transition={{ duration: 1.5, ease: 'easeOut' }}
                          />
                          <defs>
                            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor={result.overall_score >= 70 ? '#10b981' : '#f59e0b'} />
                              <stop offset="100%" stopColor={result.overall_score >= 70 ? '#34d399' : '#fbbf24'} />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-xl font-bold text-white">{result.overall_score}</span>
                          <span className="text-[10px] text-slate-400">/ 100</span>
                        </div>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-bold text-white truncate">
                        {result.overall_score !== undefined && getScoreLabel(result.overall_score)}
                      </h2>
                      <p className="text-sm text-slate-400">Your fit analysis is ready</p>
                      <motion.button
                        onClick={handleReset}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="mt-2 text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Check Another
                      </motion.button>
                    </div>
                  </div>

                  {/* Roast Card - Takes 2 columns */}
                  {result.roast && (
                    <div className="lg:col-span-2">
                      <RoastCard roast={result.roast} garmentType={result.garment_analysis?.garment_type} />
                    </div>
                  )}
                </div>

                {/* ===== ROW 2: Size Slider (Full Width if exists) ===== */}
                {result.all_sizes && result.size_recommendation && (
                  <SizeRecommendationSlider
                    allSizes={result.all_sizes}
                    sizeDetails={(result.size_recommendation.all_size_details || {}) as any}
                    recommendedSize={result.size_recommendation.recommended_size}
                    recommendedScore={result.size_recommendation.recommended_score}
                    userSelectedSize={result.user_selected_size}
                  />
                )}

                {/* ===== ROW 3: Main Analysis Grid (Bento Style) ===== */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Fit Meters - Larger card */}
                  {result.fit_meters && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="lg:col-span-2 bento-card p-5"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                          <TrendingUp className="w-4 h-4 text-emerald-400" />
                        </div>
                        <h3 className="font-semibold text-white">Fit Breakdown</h3>
                      </div>
                      <FitMetersDisplay fitMeters={result.fit_meters} />
                    </motion.div>
                  )}

                  {/* Garment Details - Compact card */}
                  {result.garment_analysis && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                      className="bento-card p-5"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                          <Shirt className="w-4 h-4 text-purple-400" />
                        </div>
                        <h3 className="font-semibold text-white">Garment Info</h3>
                      </div>
                      <GarmentAnalysisDisplay analysis={result.garment_analysis} />
                    </motion.div>
                  )}

                  {/* Color Analysis */}
                  {result.color_analysis && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bento-card p-5"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center">
                          <Palette className="w-4 h-4 text-pink-400" />
                        </div>
                        <h3 className="font-semibold text-white">Color Match</h3>
                      </div>
                      <ColorMatchDisplay colorAnalysis={result.color_analysis} />
                    </motion.div>
                  )}

                  {/* Style Tips */}
                  {result.style_recommendations && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 }}
                      className="bento-card p-5"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                          <Star className="w-4 h-4 text-amber-400" />
                        </div>
                        <h3 className="font-semibold text-white">Style Tips</h3>
                      </div>
                      <StyleRecommendationDisplay styleRecs={result.style_recommendations} />
                    </motion.div>
                  )}

                  {/* Occasion Suitability */}
                  {result.occasion_analysis && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bento-card p-5"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-blue-400" />
                        </div>
                        <h3 className="font-semibold text-white">Occasion Check</h3>
                      </div>
                      <OccasionAnalysisDisplay occasionAnalysis={result.occasion_analysis} />
                    </motion.div>
                  )}
                </div>

                {/* ===== ROW 4: Purchase Intent + CTA ===== */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Purchase Intent */}
                  {result.check_id && (
                    <PurchaseIntent checkId={result.check_id} />
                  )}

                  {/* CTA Button */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center justify-center lg:justify-end"
                  >
                    <button
                      onClick={handleReset}
                      className="btn-gradient inline-flex items-center gap-2 px-6 py-3"
                    >
                      <Shirt className="w-4 h-4" />
                      Check Another Item
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
};

export default ClothingFitChecker;
