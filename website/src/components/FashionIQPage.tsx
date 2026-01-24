import React from 'react';
import { FashionIQDashboard } from '../components/FashionIQDashboard';
import { Leaderboard } from '../components/Leaderboard';
import { Sparkles, Brain, Palette, TrendingUp } from 'lucide-react';

export const FashionIQPage: React.FC = () => {
    // TODO: Get actual user ID from auth context
    const userId = 1; // Placeholder

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-indigo-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900">
                            Fashion Intelligence
                        </h1>
                    </div>
                    <p className="text-slate-500">
                        Track your fashion knowledge, style consistency, and trend awareness
                    </p>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Dashboard (2/3 width on large screens) */}
                    <div className="lg:col-span-2">
                        <FashionIQDashboard userId={userId} />
                    </div>

                    {/* Right Column - Leaderboard (1/3 width on large screens) */}
                    <div className="lg:col-span-1">
                        <Leaderboard />
                    </div>
                </div>

                {/* Info Section */}
                <div className="mt-8 bg-white rounded-2xl p-6 shadow-bento border border-slate-200/60">
                    <h3 className="font-bold text-slate-900 mb-4">How Fashion IQ Works</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                                    <Brain className="text-indigo-600" size={16} />
                                </div>
                                <span className="font-semibold text-sm text-slate-900">Fit Knowledge (40%)</span>
                            </div>
                            <p className="text-sm text-slate-600">Based on your fit check history. More perfect fits = higher score!</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                                    <Palette className="text-purple-600" size={16} />
                                </div>
                                <span className="font-semibold text-sm text-slate-900">Style Consistency (30%)</span>
                            </div>
                            <p className="text-sm text-slate-600">Measures your coherent style across colors, garments, and formality.</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                                    <TrendingUp className="text-blue-600" size={16} />
                                </div>
                                <span className="font-semibold text-sm text-slate-900">Trend Awareness (30%)</span>
                            </div>
                            <p className="text-sm text-slate-600">Tracks if you're checking trending items and staying current.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
