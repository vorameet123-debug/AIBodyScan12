import React from 'react';
import { TrendDashboard } from './TrendDashboard';
import { TrendingUp } from 'lucide-react';
import { AuthService } from '../services/auth';

export const TrendDashboardPage: React.FC = () => {
    // Get user ID from auth (placeholder for now)
    const userId = 1; // TODO: Get from auth context

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-slate-900 mb-4 flex items-center justify-center gap-3">
                        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-indigo-600" />
                        </div>
                        Fashion Trend Advisor
                    </h1>
                    <p className="text-slate-600 text-lg">
                        Discover what's trending right now and get personalized recommendations just for you
                    </p>
                </div>

                {/* Main Content */}
                <TrendDashboard userId={userId} mode="foryou" />

                {/* Info Section */}
                <div className="mt-8 bg-white rounded-2xl p-6 shadow-bento border border-slate-200/60">
                    <h3 className="font-bold text-lg text-slate-900 mb-3">How Fashion Trend Advisor Works</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-600">
                        <div>
                            <div className="font-semibold text-indigo-600 mb-1">AI Trend Analysis</div>
                            <p>We analyze current fashion trends using AI from social media, fashion blogs, and runway shows to find what's hot right now.</p>
                        </div>
                        <div>
                            <div className="font-semibold text-emerald-600 mb-1">Personal Matching</div>
                            <p>We match trends with your body type, style preferences, and wardrobe colors to show only what works for YOU.</p>
                        </div>
                        <div>
                            <div className="font-semibold text-slate-600 mb-1">Smart Recommendations</div>
                            <p>Get detailed explanations of why trends work for you, how to style them, and where to wear them.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
