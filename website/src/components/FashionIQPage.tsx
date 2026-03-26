import React from 'react';
import { FashionIQDashboard } from '../components/FashionIQDashboard';
import { Leaderboard } from '../components/Leaderboard';
import { Sparkles, Brain, Palette, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { PageContainer } from './PageContainer';

export const FashionIQPage: React.FC = () => {
    const { userId } = useAuth();

    return (
        <PageContainer>
            {/* Header */}
            <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-purple-500 rounded-2xl flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">
                        Fashion Intelligence
                    </h1>
                </div>
                <p className="text-slate-400">
                    Track your fashion knowledge, style consistency, and trend awareness
                </p>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <FashionIQDashboard userId={userId} />
                </div>
                <div className="lg:col-span-1">
                    <Leaderboard />
                </div>
            </div>

            {/* Info Section */}
            <div className="mt-8 bento-card p-6">
                <h3 className="font-bold text-white mb-4">How Fashion IQ Works</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-accent-500 to-indigo-500 rounded-lg flex items-center justify-center">
                                <Brain className="text-white w-4 h-4" />
                            </div>
                            <span className="font-semibold text-sm text-white">Fit Knowledge (40%)</span>
                        </div>
                        <p className="text-sm text-slate-300">Based on your fit check history. More perfect fits = higher score!</p>
                    </div>
                    <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                <Palette className="text-white w-4 h-4" />
                            </div>
                            <span className="font-semibold text-sm text-white">Style Consistency (30%)</span>
                        </div>
                        <p className="text-sm text-slate-300">Measures your coherent style across colors, garments, and formality.</p>
                    </div>
                    <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                                <TrendingUp className="text-white w-4 h-4" />
                            </div>
                            <span className="font-semibold text-sm text-white">Trend Awareness (30%)</span>
                        </div>
                        <p className="text-sm text-slate-300">Tracks if you're checking trending items and staying current.</p>
                    </div>
                </div>
            </div>
        </PageContainer>
    );
};
