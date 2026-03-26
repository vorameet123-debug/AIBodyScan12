/**
 * Onboarding Tutorial — First-time user walkthrough
 * Shows a step-by-step overlay explaining key features.
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scan, BarChart3, Shirt, Shield, ChevronRight, ChevronLeft, X, Sparkles } from 'lucide-react';

const ONBOARDING_KEY = 'bodyscan_onboarding_complete';

interface Step {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

const steps: Step[] = [
  {
    icon: <Sparkles className="w-10 h-10" />,
    title: 'Welcome to BodyScan AI',
    description: 'Get accurate body measurements from just a photo. Our AI analyzes your body shape and provides personalized size recommendations.',
    color: 'from-accent-500 to-purple-500',
  },
  {
    icon: <Scan className="w-10 h-10" />,
    title: 'Take a Body Scan',
    description: 'Upload a front-facing photo and optionally a side view. Enter your height for the most accurate measurements.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: <BarChart3 className="w-10 h-10" />,
    title: 'Get 22+ Measurements',
    description: 'Receive chest, waist, hip, inseam, and 18 more measurements — plus size recommendations for shirts, pants, and more.',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    icon: <Shirt className="w-10 h-10" />,
    title: 'Clothing Fit Check',
    description: 'Upload a photo wearing any garment and get AI-powered fit analysis, style tips, and a "roast" of your outfit.',
    color: 'from-orange-500 to-rose-500',
  },
  {
    icon: <Shield className="w-10 h-10" />,
    title: 'Your Data is Safe',
    description: 'Images are processed and immediately deleted. Your measurements are encrypted and only accessible to you.',
    color: 'from-violet-500 to-indigo-500',
  },
];

export const OnboardingTutorial: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const completed = localStorage.getItem(ONBOARDING_KEY);
    if (!completed) {
      // Small delay so the page renders first
      const timer = setTimeout(() => setIsVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setIsVisible(false);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  if (!isVisible) return null;

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-6"
        onClick={(e) => e.target === e.currentTarget && handleComplete()}
      >
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/60 rounded-3xl max-w-md w-full p-8 relative shadow-2xl"
        >
          {/* Close */}
          <button
            onClick={handleComplete}
            className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon */}
          <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white mx-auto mb-6 shadow-lg`}>
            {step.icon}
          </div>

          {/* Content */}
          <h2 className="text-2xl font-bold text-white text-center mb-3">{step.title}</h2>
          <p className="text-slate-300 text-sm text-center leading-relaxed mb-8">{step.description}</p>

          {/* Progress Dots */}
          <div className="flex justify-center gap-2 mb-6">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === currentStep ? 'w-8 bg-accent-400' : 'w-2 bg-slate-600'
                }`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="flex items-center gap-1 text-sm text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>

            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white btn-gradient rounded-xl"
            >
              {isLast ? 'Get Started' : 'Next'}
              {!isLast && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>

          {/* Skip */}
          {!isLast && (
            <button
              onClick={handleComplete}
              className="block mx-auto mt-4 text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              Skip tutorial
            </button>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OnboardingTutorial;
