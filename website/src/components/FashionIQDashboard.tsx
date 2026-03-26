import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Sparkles, Target, Award, Star } from 'lucide-react';
import { FashionIQAPI, FashionIQData } from '../services/fashionIQApi';

interface FashionIQDashboardProps {
    userId: number;
}

export const FashionIQDashboard: React.FC<FashionIQDashboardProps> = ({ userId }) => {
    const [iqData, setIqData] = useState<FashionIQData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadFashionIQ();
    }, [userId]);

    const loadFashionIQ = async () => {
        try {
            setLoading(true);
            const response = await FashionIQAPI.getFashionIQ(userId);
            if (response.success) {
                setIqData(response.data);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load Fashion IQ');
        } finally {
            setLoading(false);
        }
    };

    const getLevelGradient = (level: string) => {
        switch (level) {
            case 'Master': return 'from-accent-600 to-accent-700';
            case 'Expert': return 'from-blue-600 to-blue-700';
            case 'Learner': return 'from-emerald-600 to-emerald-700';
            default: return 'from-slate-600 to-slate-700';
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-emerald-600';
        if (score >= 60) return 'text-amber-600';
        return 'text-rose-600';
    };

    const getProgressGradient = (score: number) => {
        if (score >= 80) return 'from-emerald-500 to-teal-500';
        if (score >= 60) return 'from-amber-500 to-orange-500';
        return 'from-rose-500 to-pink-500';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="w-10 h-10 border-2 border-slate-200 border-t-accent-600 rounded-full animate-spin" />
            </div>
        );
    }

    if (error || !iqData) {
        return (
            <div className="bg-slate-900 rounded-2xl p-8 border border-slate-700/60 text-center">
                <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Star className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-slate-400">No Fashion IQ data yet. Complete some fit checks to build your score!</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Main Score Card - Hero Bento */}
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`relative overflow-hidden bg-gradient-to-br ${getLevelGradient(iqData.level)} rounded-2xl p-8 text-white shadow-bento`}
            >
                {/* Background pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

                <div className="relative flex items-center justify-between">
                    <div>
                        <p className="text-white/70 text-sm font-medium uppercase tracking-wider mb-1">Your Fashion IQ</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-6xl font-bold tracking-tight">{iqData.overall_score}</span>
                            <span className="text-2xl text-white/60">/100</span>
                        </div>
                        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full">
                            <Trophy className="w-5 h-5" />
                            <span className="font-semibold">{iqData.level}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-white/60 text-sm font-medium uppercase tracking-wider">Total Checks</div>
                        <div className="text-4xl font-bold mt-1">{iqData.total_checks}</div>
                    </div>
                </div>
            </motion.div>

            {/* Score Breakdown - Bento Grid */}
            <div className="bg-slate-900 rounded-2xl shadow-bento border border-slate-700/60 p-6">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-accent-500" />
                    Score Breakdown
                </h3>

                <div className="space-y-5">
                    {/* Fit Knowledge */}
                    <div>
                        <div className="flex justify-between mb-2">
                            <span className="font-medium text-slate-300 flex items-center gap-2 text-sm">
                                <Target className="w-4 h-4 text-slate-400" />
                                Fit Knowledge
                            </span>
                            <span className={`font-bold text-sm ${getScoreColor(iqData.fit_knowledge)}`}>
                                {iqData.fit_knowledge}/100
                            </span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${iqData.fit_knowledge}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className={`h-full bg-gradient-to-r ${getProgressGradient(iqData.fit_knowledge)} rounded-full`}
                            />
                        </div>
                    </div>

                    {/* Style Consistency */}
                    <div>
                        <div className="flex justify-between mb-2">
                            <span className="font-medium text-slate-300 flex items-center gap-2 text-sm">
                                <Sparkles className="w-4 h-4 text-slate-400" />
                                Style Consistency
                            </span>
                            <span className={`font-bold text-sm ${getScoreColor(iqData.style_consistency)}`}>
                                {iqData.style_consistency}/100
                            </span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${iqData.style_consistency}%` }}
                                transition={{ duration: 1, delay: 0.1, ease: "easeOut" }}
                                className={`h-full bg-gradient-to-r ${getProgressGradient(iqData.style_consistency)} rounded-full`}
                            />
                        </div>
                    </div>

                    {/* Trend Awareness */}
                    <div>
                        <div className="flex justify-between mb-2">
                            <span className="font-medium text-slate-300 flex items-center gap-2 text-sm">
                                <TrendingUp className="w-4 h-4 text-slate-400" />
                                Trend Awareness
                            </span>
                            <span className={`font-bold text-sm ${getScoreColor(iqData.trend_awareness)}`}>
                                {iqData.trend_awareness}/100
                            </span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${iqData.trend_awareness}%` }}
                                transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                                className={`h-full bg-gradient-to-r ${getProgressGradient(iqData.trend_awareness)} rounded-full`}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Badges - Bento Grid */}
            {iqData.badges && iqData.badges.length > 0 && (
                <div className="bg-slate-900 rounded-2xl shadow-bento border border-slate-700/60 p-6">
                    <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-500" />
                        Earned Badges
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {iqData.badges.map((badge, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-gradient-to-br from-amber-900/40 to-orange-900/40 rounded-2xl p-4 text-center border border-amber-700/50 hover:-translate-y-1 transition-transform"
                            >
                                <div className="text-3xl mb-2">{badge.icon}</div>
                                <div className="font-semibold text-white text-sm">{badge.name}</div>
                                <div className="text-xs text-slate-400 mt-1">{badge.description}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Next Level Progress */}
            <div className="bg-gradient-to-br from-accent-900/40 to-purple-900/40 rounded-2xl p-5 border border-accent-700/50">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-sm text-slate-400 font-medium">Next Level</div>
                        <div className="font-bold text-white mt-0.5">
                            {iqData.level === 'Master' ? 'Max Level!' :
                                iqData.level === 'Expert' ? 'Master (81+)' :
                                    iqData.level === 'Learner' ? 'Expert (61+)' : 'Learner (41+)'}
                        </div>
                    </div>
                    {iqData.level !== 'Master' && (
                        <div className="text-right">
                            <div className="text-2xl font-bold text-accent-400">
                                {iqData.level === 'Expert' ? 81 - iqData.overall_score :
                                    iqData.level === 'Learner' ? 61 - iqData.overall_score :
                                        41 - iqData.overall_score} pts
                            </div>
                            <div className="text-xs text-slate-500">to go</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
