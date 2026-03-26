import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useBodyIntelligence } from '../contexts/BodyIntelligenceContext';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Minus, Activity, Calendar, Target, RefreshCw } from 'lucide-react';
import { MeasurementPoint } from '../services/bodyIntelligenceApi';

export const BodyTrackerPage: React.FC = () => {
    const { userId } = useAuth();

    // Use smart caching context instead of local state
    const {
        history,
        progress,
        availableUsers,
        isLoading,
        selectedUser,
        setSelectedUser,
        fetchData,
        invalidateCache
    } = useBodyIntelligence();

    // Selected metrics for display
    const [selectedMetrics, setSelectedMetrics] = React.useState<string[]>(['chest', 'waist', 'hips']);

    // Fetch data on mount or when userId/selectedUser changes
    // NOTE: This will use cache if data is still fresh (no aggressive reloading!)
    useEffect(() => {
        if (userId) {
            fetchData(userId);
        }
    }, [userId, selectedUser, fetchData]);

    // Manual refresh handler
    const handleRefresh = () => {
        if (userId) {
            fetchData(userId, true); // Force refresh bypasses cache
        }
    };

    if (isLoading && history.length === 0) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="w-10 h-10 border-2 border-accent-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!progress || history.length === 0) {
        return (
            <div className="bento-card p-6 text-center border-2 border-dashed border-amber-500/20">
                <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Activity className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">No Measurement History Yet</h3>
                <p className="text-slate-300 text-sm">Add at least 2 measurements to see your body intelligence tracking!</p>
            </div>
        );
    }

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'increasing': return <TrendingUp className="w-4 h-4 text-emerald-500" />;
            case 'decreasing': return <TrendingDown className="w-4 h-4 text-rose-500" />;
            default: return <Minus className="w-4 h-4 text-slate-400" />;
        }
    };

    const getTrendColor = (trend: string) => {
        switch (trend) {
            case 'increasing': return 'bg-emerald-500';
            case 'decreasing': return 'bg-rose-500';
            default: return 'bg-slate-500';
        }
    };

    const metricColors: { [key: string]: string } = {
        chest: '#8B5CF6',
        waist: '#EC4899',
        hips: '#3B82F6',
        weight: '#10B981',
        shoulder: '#F59E0B',
        sleeve_length: '#EF4444'
    };

    // Filter data based on selected user
    const filteredHistory = selectedUser === 'all'
        ? history
        : history.filter(m => m.name === selectedUser);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bento-card p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white mb-1">Body Intelligence Tracker</h1>
                        <p className="text-slate-400 text-sm">Track your body measurements and see your progress over time</p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Refresh Button */}
                        <button
                            onClick={handleRefresh}
                            disabled={isLoading}
                            className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-xl text-sm font-medium text-slate-300 hover:text-white transition-all disabled:opacity-50"
                            title="Refresh data"
                        >
                            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                            {isLoading ? 'Loading...' : 'Refresh'}
                        </button>

                        {/* User Filter */}
                        {availableUsers.length > 1 && (
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium text-slate-400">Filter:</label>
                                <select
                                    value={selectedUser}
                                    onChange={(e) => setSelectedUser(e.target.value)}
                                    className="px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:outline-none focus:border-accent-500/50 focus:ring-2 focus:ring-accent-500/20 transition-all text-sm font-medium text-white"
                                >
                                    <option value="all">All Users</option>
                                    {availableUsers.map(user => (
                                        <option key={user} value={user}>{user}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bento-card p-5"
                >
                    <div className="w-10 h-10 bg-gradient-to-br from-accent-500 to-purple-500 rounded-xl flex items-center justify-center mb-3">
                        <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-white">{progress.total_measurements}</div>
                    <div className="text-sm text-slate-300">Total Measurements</div>
                </motion.div>

                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bento-card p-5"
                >
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-3">
                        <Activity className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-white">{progress.period_analyzed}</div>
                    <div className="text-sm text-slate-300">Period Analyzed</div>
                </motion.div>

                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bento-card p-5"
                >
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center mb-3">
                        <Target className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-white">
                        {progress.significant_changes?.filter(c => !c.toLowerCase().includes('no significant')).length || 0}
                    </div>
                    <div className="text-sm text-slate-300">Significant Changes</div>
                </motion.div>
            </div>

            {/* Stat Sheet Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedMetrics.map((metric) => {
                    const trend = progress.trends[metric];
                    const sparklineData = filteredHistory.map(h => ({
                        value: h[metric as keyof MeasurementPoint] as number,
                        date: h.date
                    })).filter(d => d.value !== undefined && d.value !== null);

                    // Get latest value
                    const latestValue = sparklineData.length > 0 ? sparklineData[sparklineData.length - 1].value : 0;

                    return (
                        <motion.div
                            key={metric}
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bento-card overflow-hidden relative group"
                        >
                            {/* Card Content */}
                            <div className="p-5 relative z-10">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{metric.replace('_', ' ')}</div>
                                    {trend && (
                                        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${trend.change > 0 ? 'bg-emerald-500/20 text-emerald-400' :
                                            trend.change < 0 ? 'bg-rose-500/20 text-rose-400' :
                                                'bg-slate-700/50 text-slate-400'
                                            }`}>
                                            {trend.change > 0 ? '+' : ''}{trend.percentage}%
                                            {trend.change > 0 ? <TrendingUp size={10} /> : trend.change < 0 ? <TrendingDown size={10} /> : <Minus size={10} />}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-end gap-1 mb-3">
                                    <span className="text-3xl font-bold text-white">{latestValue}</span>
                                    <span className="text-sm font-medium text-slate-500 mb-1">cm</span>
                                </div>

                                <div className="text-xs text-slate-500">
                                    Last update: {filteredHistory.length > 0 ? filteredHistory[filteredHistory.length - 1].date.split(' ')[0] : 'N/A'}
                                </div>
                            </div>

                            {/* Sparkline Background */}
                            <div className="absolute bottom-0 left-0 right-0 h-20 opacity-30 group-hover:opacity-50 transition-opacity">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={sparklineData}>
                                        <defs>
                                            <linearGradient id={`spark-${metric}`} x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor={metricColors[metric] || '#6366f1'} stopOpacity={1} />
                                                <stop offset="100%" stopColor={metricColors[metric] || '#6366f1'} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <Area
                                            type="monotone"
                                            dataKey="value"
                                            stroke={metricColors[metric] || '#6366f1'}
                                            strokeWidth={2}
                                            fill={`url(#spark-${metric})`}
                                            isAnimationActive={false}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Wins Feed / Insights */}
            <div className="bento-card p-6">
                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                        <Activity className="w-4 h-4 text-white" />
                    </div>
                    Body Intelligence Feed
                </h3>
                <div className="space-y-2">
                    {/* Significant Changes Feed */}
                    {progress.significant_changes && progress.significant_changes
                        .filter(c => !c.toLowerCase().includes('no significant'))
                        .map((change, idx) => (
                            <motion.div
                                key={`sig-${idx}`}
                                initial={{ x: -10, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                className="flex items-center gap-3 p-3 bg-blue-500/10 rounded-xl border-l-2 border-blue-400"
                            >
                                <div className="w-7 h-7 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400">
                                    <Activity size={14} />
                                </div>
                                <span className="text-slate-300 text-sm font-medium">{change}</span>
                            </motion.div>
                        ))}

                    {/* Trend Insights Feed */}
                    {Object.entries(progress.trends)
                        .filter(([_, data]) => Math.abs(data.percentage) > 0.5) // Only show significant trends
                        .map(([metric, data], idx) => (
                            <motion.div
                                key={`trend-${idx}`}
                                initial={{ x: -10, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: (idx + 2) * 0.1 }}
                                className={`flex items-center gap-3 p-3 rounded-xl border-l-2 ${data.change > 0 ? 'bg-emerald-500/10 border-emerald-400' : 'bg-rose-500/10 border-rose-400'
                                    }`}
                            >
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${data.change > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                    {data.change > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                </div>
                                <span className="font-medium text-slate-300 text-sm">
                                    {metric.replace('_', ' ')} is {data.trend} ({data.change > 0 ? '+' : ''}{data.change}cm)
                                </span>
                            </motion.div>
                        ))}

                    {(!progress.significant_changes?.filter(c => !c.toLowerCase().includes('no significant')).length &&
                        !Object.values(progress.trends).some(t => Math.abs(t.percentage) > 0.5)) && (
                            <div className="text-center text-slate-400 py-4 text-sm">
                                No significant changes detected yet. Keep tracking!
                            </div>
                        )}
                </div>
            </div>

            {/* Trends */}
            {progress.trends && Object.keys(progress.trends).length > 0 && (
                <div className="bento-card p-6">
                    <h3 className="text-base font-bold text-white mb-4">Measurement Trends</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {Object.entries(progress.trends).map(([measurement, data]) => (
                            <motion.div
                                key={measurement}
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className={`${getTrendColor(data.trend)} rounded-xl p-4 text-white`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-medium capitalize text-sm">{measurement.replace('_', ' ')}</h4>
                                    {getTrendIcon(data.trend)}
                                </div>
                                <div className="text-xl font-bold">
                                    {data.change > 0 ? '+' : ''}{data.change}cm
                                </div>
                                <div className="text-sm opacity-90">
                                    {data.percentage > 0 ? '+' : ''}{data.percentage}% change
                                </div>
                                <div className="text-xs opacity-75 mt-1">
                                    {data.oldest}cm → {data.latest}cm
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Significant Changes */}
            {progress.significant_changes && progress.significant_changes.length > 0 && (
                <div className="bento-card p-6">
                    <h3 className="text-base font-bold text-white mb-4">Significant Changes</h3>
                    {progress.significant_changes.filter(c => !c.toLowerCase().includes('no significant')).length > 0 ? (
                        <div className="space-y-2">
                            {progress.significant_changes
                                .filter(c => !c.toLowerCase().includes('no significant'))
                                .map((change, idx) => (
                                    <div key={idx} className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
                                        <p className="text-slate-300 text-sm font-medium">{change}</p>
                                    </div>
                                ))}
                        </div>
                    ) : (
                        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
                            <p className="text-slate-300 text-sm">No significant changes detected</p>
                        </div>
                    )}
                </div>
            )}

            {/* Overall Progress */}
            {progress.overall_progress && (
                <div className="bento-card p-6">
                    <h3 className="text-base font-bold text-white mb-4">Overall Progress (First vs Latest)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {Object.entries(progress.overall_progress).map(([measurement, data]) => (
                            <div key={measurement} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                                <h4 className="font-semibold capitalize text-white text-sm mb-3">{measurement.replace('_', ' ')}</h4>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-xs text-slate-500">Before</div>
                                        <div className="text-lg font-bold text-white">{data.before}cm</div>
                                    </div>
                                    <div className="text-xl text-slate-600">→</div>
                                    <div>
                                        <div className="text-xs text-slate-500">After</div>
                                        <div className="text-lg font-bold text-white">{data.after}cm</div>
                                    </div>
                                </div>
                                <div className={`mt-2 text-center text-sm font-medium ${data.change > 0 ? 'text-emerald-400' : data.change < 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                                    {data.change > 0 ? '+' : ''}{data.change}cm ({data.percentage > 0 ? '+' : ''}{data.percentage}%)
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Body Shape Classification */}
            {progress.body_shape &&
                progress.body_shape.shape &&
                progress.body_shape.shape !== 'unknown' &&
                progress.body_shape.shape !== 'insufficient_data' && (
                    <motion.div
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="bento-card p-6"
                    >
                        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-accent-500 to-purple-500 rounded-lg flex items-center justify-center">
                                <Target className="w-4 h-4 text-white" />
                            </div>
                            Body Shape Classification
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-5 text-white border border-slate-700/50">
                                <div className="text-xs text-slate-400 mb-2">Your Body Shape</div>
                                <div className="text-2xl font-bold mb-2 capitalize">{progress.body_shape.shape.replace('_', ' ')}</div>
                                <div className="text-sm text-accent-400">
                                    Confidence: {Math.round(progress.body_shape.confidence * 100)}%
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
                                    <div className="text-xs text-slate-500 mb-1">Waist to Hip Ratio</div>
                                    <div className="text-lg font-bold text-accent-400">{progress.body_shape.ratios.waist_to_hip}</div>
                                </div>
                                <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
                                    <div className="text-xs text-slate-500 mb-1">Waist to Chest Ratio</div>
                                    <div className="text-lg font-bold text-accent-400">{progress.body_shape.ratios.waist_to_chest}</div>
                                </div>
                                <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
                                    <div className="text-xs text-slate-500 mb-1">Chest to Hip Ratio</div>
                                    <div className="text-lg font-bold text-accent-400">{progress.body_shape.ratios.chest_to_hip}</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

            {/* Pattern Insights */}
            {progress.pattern_insights && progress.pattern_insights.length > 0 && (
                <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="bento-card p-6"
                >
                    <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                            <Activity className="w-4 h-4 text-white" />
                        </div>
                        Transformation Patterns Detected
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {progress.pattern_insights.map((pattern, idx) => {
                            const patternColors: { [key: string]: string } = {
                                'weight_loss': 'bg-emerald-500',
                                'muscle_gain': 'bg-blue-500',
                                'recomposition': 'bg-accent-500',
                                'stable': 'bg-slate-500',
                                'no_pattern': 'bg-amber-500'
                            };
                            const color = patternColors[pattern.pattern] || 'bg-slate-500';

                            return (
                                <motion.div
                                    key={idx}
                                    initial={{ scale: 0.95, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.1 * idx }}
                                    className={`${color} rounded-xl p-4 text-white`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-semibold text-sm capitalize">{pattern.pattern.replace('_', ' ')}</h4>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${pattern.confidence === 'high' ? 'bg-white/20' :
                                            pattern.confidence === 'medium' ? 'bg-white/15' :
                                                'bg-white/10'
                                            }`}>
                                            {pattern.confidence}
                                        </span>
                                    </div>
                                    <p className="text-sm opacity-90">{pattern.description}</p>
                                    {pattern.change !== 0 && (
                                        <div className="mt-2 text-base font-bold">
                                            {pattern.change > 0 ? '+' : ''}{pattern.change.toFixed(1)}cm
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>
            )}

            {/* Trend Velocity */}
            {progress.trend_velocity && typeof progress.trend_velocity === 'object' && !progress.trend_velocity.message && (
                <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="bento-card p-6"
                >
                    <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-4 h-4 text-white" />
                        </div>
                        Trend Velocity & Acceleration
                    </h3>
                    <p className="text-xs text-slate-400 mb-4">Rate of change per month</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {Object.entries(progress.trend_velocity).map(([measurement, data]) => (
                            <div key={measurement} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                                <h4 className="font-semibold capitalize text-white text-sm mb-3">{measurement.replace('_', ' ')}</h4>
                                <div className="space-y-2">
                                    <div>
                                        <div className="text-xs text-slate-500 mb-1">Velocity</div>
                                        <div className={`text-lg font-bold ${data.velocity > 0 ? 'text-emerald-400' :
                                            data.velocity < 0 ? 'text-rose-400' :
                                                'text-slate-400'
                                            }`}>
                                            {data.velocity > 0 ? '+' : ''}{data.velocity.toFixed(2)}cm/month
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 mb-1">Acceleration</div>
                                        <div className={`text-base font-medium ${data.acceleration > 0 ? 'text-blue-400' :
                                            data.acceleration < 0 ? 'text-amber-400' :
                                                'text-slate-400'
                                            }`}>
                                            {data.acceleration > 0 ? '+' : ''}{data.acceleration.toFixed(2)}cm/month²
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${data.direction === 'increasing' ? 'bg-emerald-500/20 text-emerald-400' :
                                            data.direction === 'decreasing' ? 'bg-rose-500/20 text-rose-400' :
                                                'bg-slate-700/50 text-slate-400'
                                            }`}>
                                            {data.direction}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${data.trend === 'accelerating' ? 'bg-blue-500/20 text-blue-400' :
                                            data.trend === 'decelerating' ? 'bg-amber-500/20 text-amber-400' :
                                                'bg-slate-700/50 text-slate-400'
                                            }`}>
                                            {data.trend}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

        </div>
    );
};
