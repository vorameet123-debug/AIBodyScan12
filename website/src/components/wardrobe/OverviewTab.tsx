import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Package,
    TrendingUp,
    Heart,
    ShoppingCart,
    Sparkles,
    Calendar,
    DollarSign,
    Target,
    Award,
    ArrowRight,
    Clock,
    AlertCircle
} from 'lucide-react';
import { WardrobeAPI } from '../../services/wardrobeApi';
import { useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { WardrobeAnalyticsData, FitHistoryItem, WardrobeGap } from '../../types/wardrobe';

interface OverviewTabProps {
    userId: number;
}

interface QuickStat {
    label: string;
    value: string | number;
    icon: React.ElementType;
    color: string;
    trend?: string;
}

interface RecentActivity {
    id: number;
    type: 'check' | 'purchase' | 'wishlist';
    garment: string;
    score?: number;
    date: string;
    color: string;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ userId }) => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<WardrobeAnalyticsData | null>(null);
    const [, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        loadOverviewData();
    }, [userId]);

    const loadOverviewData = async () => {
        try {
            setLoading(true);
            const response = await WardrobeAPI.getAnalytics(userId, 'all');
            if (response.success) {
                setData(response.data);
            }
        } catch (error) {
            console.error('Failed to load overview:', error);
            toast.error('Failed to load overview data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-2 border-accent-200 border-t-accent-600 animate-spin"></div>
                    <p className="text-sm font-medium text-slate-400">Loading overview...</p>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="bg-slate-900/50 backdrop-blur-xl border-2 border-dashed border-slate-700 rounded-2xl p-10 text-center">
                <div className="w-14 h-14 bg-accent-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Package className="w-7 h-7 text-accent-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Start Your Fashion Journey</h3>
                <p className="text-slate-400 mb-4">Complete fit checks to build your wardrobe analytics!</p>
                <button className="px-6 py-2.5 bg-gradient-to-r from-accent-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-accent-500/25 transition-all">
                    Check Your First Fit
                </button>
            </div>
        );
    }

    const quickStats: QuickStat[] = [
        {
            label: 'Total Items',
            value: data.composition.total_items,
            icon: Package,
            color: 'from-blue-500 to-cyan-500',
            trend: '+12% this month'
        },
        {
            label: 'Purchased',
            value: data.conversion.purchased,
            icon: ShoppingCart,
            color: 'from-emerald-500 to-teal-500',
            trend: `${data.conversion.conversion_rate}% conversion`
        },
        {
            label: 'Wishlist',
            value: data.conversion.wishlist,
            icon: Heart,
            color: 'from-pink-500 to-rose-500',
            trend: `${data.wishlist.length} items waiting`
        },
        {
            label: 'Avg Fit Score',
            value: data.conversion.avg_purchased_score || 'N/A',
            icon: Target,
            color: 'from-purple-500 to-indigo-500',
            trend: 'Excellent fit'
        }
    ];

    // Mock recent activity - in production, this would come from API
    const recentActivity: RecentActivity[] = data.fit_history.slice(0, 5).map((item: FitHistoryItem, idx: number) => ({
        id: idx,
        type: item.purchased ? 'purchase' : 'check',
        garment: item.garment,
        score: item.score,
        date: item.date,
        color: 'blue'
    }));

    const wardrobeHealthScore = Math.round(
        (data.conversion.conversion_rate * 0.4) +
        (data.composition.total_items > 0 ? Math.min(data.composition.total_items * 2, 40) : 0) +
        ((data.conversion.avg_purchased_score || 0) * 0.2)
    );

    return (
        <div className="space-y-6">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickStats.map((stat, idx) => (
                    <motion.div
                        key={stat.label}
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className="group relative overflow-hidden bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-5 hover:border-accent-500/30 transition-all cursor-pointer"
                    >
                        {/* Gradient Background */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity`} />

                        <div className="relative">
                            <div className="flex items-start justify-between mb-3">
                                <div className={`w-11 h-11 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                                    <stat.icon className="w-5 h-5 text-white" />
                                </div>
                                {stat.trend && (
                                    <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">
                                        {stat.trend}
                                    </span>
                                )}
                            </div>
                            <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                            <div className="text-sm text-slate-400 font-medium">{stat.label}</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Wardrobe Health Score */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-1 bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6"
                >
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Award className="w-5 h-5 text-accent-400" />
                        Wardrobe Health
                    </h3>

                    {/* Circular Progress */}
                    <div className="flex flex-col items-center py-4">
                        <div className="relative w-40 h-40">
                            <svg className="w-40 h-40 transform -rotate-90">
                                <circle
                                    cx="80"
                                    cy="80"
                                    r="70"
                                    stroke="currentColor"
                                    strokeWidth="12"
                                    fill="none"
                                    className="text-slate-800"
                                />
                                <circle
                                    cx="80"
                                    cy="80"
                                    r="70"
                                    stroke="url(#gradient)"
                                    strokeWidth="12"
                                    fill="none"
                                    strokeDasharray={`${(wardrobeHealthScore / 100) * 440} 440`}
                                    strokeLinecap="round"
                                    className="transition-all duration-1000"
                                />
                                <defs>
                                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#6366f1" />
                                        <stop offset="100%" stopColor="#a855f7" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-4xl font-bold text-white">{wardrobeHealthScore}</span>
                                <span className="text-sm text-slate-400">out of 100</span>
                            </div>
                        </div>

                        <div className="mt-6 w-full space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-400">Diversity</span>
                                <span className="text-white font-semibold">
                                    {Object.keys(data.composition.by_type).length}/8
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-400">Utilization</span>
                                <span className="text-white font-semibold">{data.conversion.conversion_rate}%</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-400">Fit Quality</span>
                                <span className="text-white font-semibold">
                                    {data.conversion.avg_purchased_score || 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Recent Activity */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="lg:col-span-2 bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Clock className="w-5 h-5 text-accent-400" />
                            Recent Activity
                        </h3>
                        <button
                            onClick={() => setSearchParams({ section: 'history' })}
                            className="text-sm text-accent-400 hover:text-accent-300 font-semibold flex items-center gap-1"
                        >
                            View All
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="space-y-3">
                        {recentActivity.length > 0 ? (
                            recentActivity.map((activity) => (
                                <div
                                    key={activity.id}
                                    className="flex items-center gap-4 p-3 bg-slate-800/30 rounded-xl hover:bg-slate-800/50 transition-colors"
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activity.type === 'purchase'
                                        ? 'bg-emerald-500/20 text-emerald-400'
                                        : activity.type === 'wishlist'
                                            ? 'bg-pink-500/20 text-pink-400'
                                            : 'bg-blue-500/20 text-blue-400'
                                        }`}>
                                        {activity.type === 'purchase' ? (
                                            <ShoppingCart className="w-5 h-5" />
                                        ) : activity.type === 'wishlist' ? (
                                            <Heart className="w-5 h-5" />
                                        ) : (
                                            <Package className="w-5 h-5" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-semibold text-white truncate">
                                                {activity.garment}
                                            </p>
                                            {activity.score && (
                                                <span className="text-xs font-bold text-accent-400 bg-accent-400/10 px-2 py-0.5 rounded-full">
                                                    {activity.score}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            {activity.type === 'purchase' ? 'Purchased' : activity.type === 'wishlist' ? 'Added to wishlist' : 'Fit checked'}
                                        </p>
                                    </div>
                                    <div className="text-xs text-slate-500">{activity.date}</div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-slate-400">
                                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No recent activity</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Insights & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* AI Insights */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-accent-500/10 to-purple-500/10 backdrop-blur-xl border border-accent-500/30 rounded-2xl p-6"
                >
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-accent-400" />
                        AI Insights
                    </h3>
                    <div className="space-y-3">
                        {data.gaps.length > 0 ? (
                            data.gaps.slice(0, 3).map((gap: WardrobeGap, idx: number) => (
                                <div key={idx} className="flex items-start gap-3 p-3 bg-slate-900/40 rounded-xl">
                                    <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-white">
                                            Consider adding: {gap.item.replace('_', ' ')}
                                        </p>
                                        <p className="text-xs text-slate-400 mt-1">{gap.reason}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-slate-400">Your wardrobe is well-balanced! 🎉</p>
                        )}
                    </div>
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6"
                >
                    <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => setSearchParams({ section: 'items', action: 'add' })}
                            className="flex flex-col items-center gap-2 p-4 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-colors group"
                        >
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Package className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-sm font-semibold text-white">Add Item</span>
                        </button>
                        <button
                            onClick={() => setSearchParams({ section: 'trending' })}
                            className="flex flex-col items-center gap-2 p-4 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-colors group"
                        >
                            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-sm font-semibold text-white">View Trends</span>
                        </button>
                        <button
                            onClick={() => navigate('/fit-checker')}
                            className="flex flex-col items-center gap-2 p-4 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-colors group"
                        >
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Target className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-sm font-semibold text-white">Fit Check</span>
                        </button>
                        <button
                            onClick={() => setSearchParams({ section: 'items', filter: 'wishlist' })}
                            className="flex flex-col items-center gap-2 p-4 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-colors group"
                        >
                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Heart className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-sm font-semibold text-white">Wishlist</span>
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
