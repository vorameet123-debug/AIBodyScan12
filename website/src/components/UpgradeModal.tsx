import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Check, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    feature: string;
    currentCount?: number;
    limit?: number;
    message?: string;
}

const featureNames: Record<string, string> = {
    body_scan: 'Body Scan',
    fit_check: 'FitChecker',
    saved_measurement: 'Saved Measurement',
    wardrobe_analytics: 'Wardrobe Analytics',
    trend_dashboard: 'Trend Dashboard',
};

const proFeatures = [
    'Unlimited Body Scans',
    'Unlimited FitChecker analyses',
    'Unlimited saved measurements',
    'Full Body Tracker history',
    'Wardrobe & Trend Analytics',
    'Priority support',
];

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
    isOpen,
    onClose,
    feature,
    currentCount,
    limit,
    message,
}) => {
    const navigate = useNavigate();
    const featureName = featureNames[feature] || feature.replace(/_/g, ' ');

    const handleUpgrade = () => {
        onClose();
        navigate('/pricing');
    };

    const isLimitReached = currentCount !== undefined && limit !== undefined && currentCount >= limit;
    const isProOnly = limit === 0;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none"
                    >
                        <div className="bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl max-w-md w-full p-6 pointer-events-auto">
                            {/* Close button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {/* Icon */}
                            <div className="flex justify-center mb-6">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center">
                                    {isLimitReached ? (
                                        <Sparkles className="w-8 h-8 text-violet-400" />
                                    ) : (
                                        <Zap className="w-8 h-8 text-violet-400" />
                                    )}
                                </div>
                            </div>

                            {/* Title */}
                            <h3 className="text-xl font-bold text-white text-center mb-2">
                                {isProOnly
                                    ? `${featureName} is a Pro Feature`
                                    : isLimitReached
                                        ? `You've used all your free ${featureName}s`
                                        : `Upgrade to Pro`}
                            </h3>

                            {/* Message */}
                            <p className="text-slate-400 text-center mb-6">
                                {message || (
                                    isProOnly
                                        ? `Unlock ${featureName} and all Pro features with a subscription.`
                                        : `You've used ${currentCount} of ${limit} free ${featureName}s this month. Upgrade to Pro for unlimited access!`
                                )}
                            </p>

                            {/* Usage indicator (if limit reached) */}
                            {isLimitReached && limit && (
                                <div className="mb-6">
                                    <div className="flex justify-between text-sm text-slate-400 mb-2">
                                        <span>Usage</span>
                                        <span>{currentCount}/{limit} used</span>
                                    </div>
                                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                                            style={{ width: '100%' }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Pro features */}
                            <div className="bg-slate-800/50 rounded-xl p-4 mb-6">
                                <p className="text-sm font-semibold text-white mb-3">Pro includes:</p>
                                <ul className="space-y-2">
                                    {proFeatures.slice(0, 4).map((feat, idx) => (
                                        <li key={idx} className="flex items-center gap-2 text-sm text-slate-300">
                                            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                            {feat}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Pricing hint */}
                            <p className="text-center text-sm text-slate-500 mb-4">
                                Starting at just <span className="text-white font-semibold">₹666/month</span> (billed yearly)
                            </p>

                            {/* Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="flex-1 py-3 px-4 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                                >
                                    Maybe Later
                                </button>
                                <button
                                    onClick={handleUpgrade}
                                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-violet-500/25 transition-all"
                                >
                                    Upgrade Now
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default UpgradeModal;
