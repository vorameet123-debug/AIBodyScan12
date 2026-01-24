import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Target, Sparkles, TrendingUp, Award, Info, ChevronRight } from 'lucide-react';
import { FashionIQAPI, FashionIQData } from '../services/fashionIQApi';

interface FashionIQWidgetProps {
    userId: number;
    refreshTrigger?: number; // To trigger recalculation/refresh
}

export const FashionIQWidget: React.FC<FashionIQWidgetProps> = ({ userId, refreshTrigger }) => {
    const [iqData, setIqData] = useState<FashionIQData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isRecalculating, setIsRecalculating] = useState(false);

    useEffect(() => {
        loadFashionIQ();
    }, [userId]);

    useEffect(() => {
        if (refreshTrigger) {
            handleRecalculate();
        }
    }, [refreshTrigger]);

    const loadFashionIQ = async () => {
        try {
            setLoading(true);
            const response = await FashionIQAPI.getFashionIQ(userId);
            if (response.success) {
                setIqData(response.data);
            }
        } catch (err) {
            console.error('Failed to load Fashion IQ:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRecalculate = async () => {
        try {
            setIsRecalculating(true);
            const response = await FashionIQAPI.recalculateFashionIQ(userId);
            if (response.success) {
                // Short delay to make the "recalculating" animation feel meaningful
                setTimeout(async () => {
                    const freshData = await FashionIQAPI.getFashionIQ(userId);
                    if (freshData.success) {
                        setIqData(freshData.data);
                    }
                    setIsRecalculating(false);
                }, 1500);
            } else {
                setIsRecalculating(false);
            }
        } catch (err) {
            console.error('Recalculation failed:', err);
            setIsRecalculating(false);
        }
    };

    const getLevelConfig = (level: string) => {
        switch (level) {
            case 'Master': return { color: 'from-indigo-600 to-indigo-700', text: 'text-indigo-600', bg: 'bg-indigo-50', icon: '👑' };
            case 'Expert': return { color: 'from-blue-600 to-blue-700', text: 'text-blue-600', bg: 'bg-blue-50', icon: '🎯' };
            case 'Learner': return { color: 'from-emerald-600 to-emerald-700', text: 'text-emerald-600', bg: 'bg-emerald-50', icon: '✨' };
            default: return { color: 'from-slate-600 to-slate-700', text: 'text-slate-600', bg: 'bg-slate-50', icon: '🔰' };
        }
    };

    if (loading && !iqData) {
        return (
            <div className="bg-white rounded-2xl p-6 shadow-bento border border-slate-200/60 animate-pulse h-48 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
            </div>
        );
    }

    if (!iqData) return null;

    const config = getLevelConfig(iqData.level);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-bento border border-slate-200/60 p-5"
        >
            <div className="flex items-start justify-between mb-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Your Rank</span>
                        <AnimatePresence mode="wait">
                            {isRecalculating && (
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="text-[8px] font-bold text-indigo-500 animate-pulse uppercase"
                                >
                                    • Recalculating...
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`text-xl font-bold ${config.text} flex items-center gap-2`}>
                            {config.icon} {iqData.level}
                        </span>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">IQ Score</span>
                    <div className="text-2xl font-bold text-slate-900 leading-none">
                        {iqData.overall_score}<span className="text-sm text-slate-400 font-medium ml-0.5">/100</span>
                    </div>
                </div>
            </div>

            {/* Score Breakdown Bars */}
            <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-slate-50 rounded-xl p-2 border border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                        <Target size={12} className="text-blue-500" />
                        <span className="text-[10px] font-medium text-slate-500">{iqData.fit_knowledge}</span>
                    </div>
                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${iqData.fit_knowledge}%` }}
                            className="h-full bg-blue-500 rounded-full"
                        />
                    </div>
                </div>
                <div className="bg-slate-50 rounded-xl p-2 border border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                        <Sparkles size={12} className="text-purple-500" />
                        <span className="text-[10px] font-medium text-slate-500">{iqData.style_consistency}</span>
                    </div>
                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${iqData.style_consistency}%` }}
                            className="h-full bg-purple-500 rounded-full"
                        />
                    </div>
                </div>
                <div className="bg-slate-50 rounded-xl p-2 border border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                        <TrendingUp size={12} className="text-emerald-500" />
                        <span className="text-[10px] font-medium text-slate-500">{iqData.trend_awareness}</span>
                    </div>
                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${iqData.trend_awareness}%` }}
                            className="h-full bg-emerald-500 rounded-full"
                        />
                    </div>
                </div>
            </div>

            {/* Badges Preview */}
            <div className="flex items-center gap-2 overflow-hidden bg-slate-50 rounded-xl p-2 mb-3 border border-slate-100">
                <Award size={14} className="text-amber-500 flex-shrink-0" />
                <div className="flex gap-1.5 scrollbar-hide">
                    {iqData.badges.length > 0 ? (
                        iqData.badges.slice(0, 4).map((badge, idx) => (
                            <span key={idx} className="text-lg cursor-help" title={badge.name}>
                                {badge.icon}
                            </span>
                        ))
                    ) : (
                        <span className="text-[10px] font-medium text-slate-400">Keep checking to earn badges!</span>
                    )}
                </div>
            </div>

            {/* Next Level Info */}
            <div className="flex items-center justify-between text-[10px] font-medium">
                <div className="flex items-center gap-1.5 text-slate-400">
                    <Info size={12} />
                    Next Level: {
                        iqData.level === 'Master' ? 'Max Rank' :
                            iqData.level === 'Expert' ? 'Master (81+)' :
                                iqData.level === 'Learner' ? 'Expert (61+)' : 'Learner (41+)'
                    }
                </div>
                {iqData.level !== 'Master' && (
                    <div className="text-indigo-600 flex items-center gap-1">
                        {
                            iqData.level === 'Expert' ? 81 - iqData.overall_score :
                                iqData.level === 'Learner' ? 61 - iqData.overall_score :
                                    41 - iqData.overall_score
                        }pts to go <ChevronRight size={10} />
                    </div>
                )}
            </div>
        </motion.div>
    );
};
