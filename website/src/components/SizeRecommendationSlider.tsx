import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Sparkles } from 'lucide-react';

interface SizeData {
    overall_fit_score: number;
    fit_meters: {
        [key: string]: {
            status: string;
            ease: number;
            user_measurement: number;
            garment_measurement: number;
        };
    };
}

interface SizeRecommendationSliderProps {
    allSizes: { [size: string]: number }; // size -> score
    sizeDetails: { [size: string]: SizeData }; // size -> full data
    recommendedSize: string;
    recommendedScore: number;
    userSelectedSize?: string;
    onSizeSelect?: (size: string) => void;
}

export const SizeRecommendationSlider: React.FC<SizeRecommendationSliderProps> = ({
    allSizes,
    sizeDetails,
    recommendedSize,
    recommendedScore,
    userSelectedSize,
    onSizeSelect
}) => {
    // Debug logging
    console.log('SizeRecommendationSlider props:', {
        allSizes,
        sizeDetails,
        recommendedSize,
        recommendedScore,
        userSelectedSize
    });

    const [currentSize, setCurrentSize] = useState(recommendedSize);
    const sizes = Object.keys(allSizes).sort(); // XS, S, M, L, XL, XXL, XXXL

    const currentData = sizeDetails[currentSize];
    const currentScore = allSizes[currentSize];

    const handleSizeClick = (size: string) => {
        setCurrentSize(size);
        if (onSizeSelect) {
            onSizeSelect(size);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 85) return 'text-green-500';
        if (score >= 70) return 'text-yellow-500';
        return 'text-red-500';
    };

    const getScoreBgColor = (score: number) => {
        if (score >= 85) return 'bg-green-500';
        if (score >= 70) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const getScoreIcon = (score: number) => {
        if (score >= 85) return <TrendingUp className="inline" size={16} />;
        if (score >= 70) return <Minus className="inline" size={16} />;
        return <TrendingDown className="inline" size={16} />;
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-bento border border-slate-200/60">
            {/* Header */}
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    Find Your Perfect Size
                </h2>
                <p className="text-slate-500">Drag or click to compare all sizes</p>
            </div>

            {/* Size Slider */}
            <div className="relative mb-8">
                {/* Size dots and labels */}
                <div className="flex justify-between items-center mb-4 px-4">
                    {sizes.map((size) => {
                        const score = allSizes[size];
                        const isRecommended = size === recommendedSize;
                        const isCurrent = size === currentSize;
                        const isUserSelected = size === userSelectedSize;

                        return (
                            <div key={size} className="flex flex-col items-center relative">
                                {/* Recommended badge */}
                                {isRecommended && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute -top-8 bg-amber-500 text-white text-xs font-medium px-2 py-1 rounded-lg"
                                    >
                                        <Sparkles size={12} className="inline mr-1" />
                                        Best
                                    </motion.div>
                                )}

                                {/* Size dot */}
                                <motion.button
                                    onClick={() => handleSizeClick(size)}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`
                    w-11 h-11 rounded-full font-medium text-sm transition-all
                    ${isCurrent
                                            ? 'bg-indigo-600 text-white shadow-lg scale-110'
                                            : score >= 85
                                                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                                : score >= 70
                                                    ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                                    : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                                        }
                    ${isUserSelected && !isCurrent ? 'ring-2 ring-indigo-400' : ''}
                  `}
                                >
                                    {size}
                                </motion.button>

                                {/* Score */}
                                <div className={`text-xs font-medium mt-2 ${getScoreColor(score)}`}>
                                    {Math.round(score)}%
                                </div>

                                {/* Icon */}
                                <div className={`mt-1 ${getScoreColor(score)}`}>
                                    {getScoreIcon(score)}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Progress line */}
                <div className="h-1.5 bg-slate-200 rounded-full relative overflow-hidden">
                    <motion.div
                        className={`h-full rounded-full ${getScoreBgColor(currentScore)}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${(currentScore / 100) * 100}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                </div>
            </div>

            {/* Current Size Display */}
            <motion.div
                key={currentSize}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-slate-50 rounded-xl p-5 border border-slate-100"
            >
                {/* Size header */}
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">
                            Size {currentSize}
                        </h3>
                        {currentSize === recommendedSize && (
                            <p className="text-sm text-emerald-600 font-medium flex items-center gap-1">
                                <Sparkles size={14} />
                                This is your BEST fit!
                            </p>
                        )}
                        {currentSize === userSelectedSize && currentSize !== recommendedSize && (
                            <p className="text-sm text-indigo-600 font-medium">
                                You selected this size
                            </p>
                        )}
                    </div>
                    <div className="text-right">
                        <div className={`text-3xl font-bold ${getScoreColor(currentScore)}`}>
                            {Math.round(currentScore)}
                        </div>
                        <div className="text-sm text-slate-500">Fit Score</div>
                    </div>
                </div>

                {/* Fit meters */}
                {currentData && currentData.fit_meters && (
                    <div className="space-y-2.5">
                        {Object.entries(currentData.fit_meters).map(([key, meter]) => {
                            const isGood = meter.status === 'Perfect Fit';
                            const isTight = meter.status === 'Too Tight';

                            return (
                                <div key={key} className="flex items-center gap-3">
                                    <div className="w-24 text-sm font-medium text-slate-700 capitalize">
                                        {key.replace('_', ' ')}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <div className={`
                        px-2.5 py-1 rounded-lg text-xs font-medium
                        ${isGood ? 'bg-emerald-100 text-emerald-700' :
                                                    isTight ? 'bg-rose-100 text-rose-700' :
                                                        'bg-indigo-100 text-indigo-700'}
                      `}>
                                                {meter.status}
                                            </div>
                                            <div className="text-sm text-slate-500">
                                                {meter.ease > 0 ? '+' : ''}{meter.ease.toFixed(1)}cm ease
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        You: {meter.user_measurement}cm → Item: {meter.garment_measurement}cm
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Action button */}
                <button
                    className={`
            w-full mt-5 py-3 rounded-xl font-medium text-base transition-colors
            ${currentSize === recommendedSize
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        }
          `}
                >
                    {currentSize === recommendedSize ? '✨ Buy Recommended Size' : `Select Size ${currentSize}`}
                </button>
            </motion.div>

            {/* Comparison note */}
            {userSelectedSize && userSelectedSize !== recommendedSize && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-xl"
                >
                    <p className="text-sm text-indigo-800">
                        <strong>Note:</strong> You selected size {userSelectedSize.toUpperCase()} ({Math.round(allSizes[userSelectedSize.toUpperCase()] || 0)}%),
                        but size {recommendedSize} ({Math.round(recommendedScore)}%) would fit better!
                    </p>
                </motion.div>
            )}
        </div>
    );
};
