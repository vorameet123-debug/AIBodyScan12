import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Minus, Activity, ChevronDown, ChevronUp } from 'lucide-react';
import { BodyIntelligenceAPI, MeasurementPoint, ProgressSummary } from '../services/bodyIntelligenceApi';

interface CompactBodyTrackerProps {
    userId: number;
    personName?: string; // Make optional to allow showing all users
}

export const CompactBodyTracker: React.FC<CompactBodyTrackerProps> = ({ userId, personName }) => {
    const [history, setHistory] = useState<MeasurementPoint[]>([]);
    const [progress, setProgress] = useState<ProgressSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['chest', 'waist', 'hips']);
    const [selectedUser, setSelectedUser] = useState<string>('all'); // User filter state
    const [availableUsers, setAvailableUsers] = useState<string[]>([]); // List of users

    useEffect(() => {
        loadData();
    }, [userId, selectedUser]); // Reload when user filter changes

    const loadData = async () => {
        try {
            setLoading(true);

            // Use selectedUser if not 'all', otherwise undefined to get all data
            const filterPersonName = selectedUser !== 'all' ? selectedUser : undefined;

            const [historyData, progressData] = await Promise.all([
                BodyIntelligenceAPI.getHistory(userId, 90, filterPersonName),
                BodyIntelligenceAPI.getProgress(userId, filterPersonName)
            ]);

            setHistory(historyData);
            setProgress(progressData);

            // Extract unique user names from all history (not filtered) for the dropdown
            const allHistory = await BodyIntelligenceAPI.getHistory(userId, 90);
            const users = Array.from(new Set(allHistory.map(m => m.name).filter(Boolean))) as string[];
            setAvailableUsers(users);
        } catch (error) {
            console.error('Failed to load body tracker data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    if (!progress || history.length === 0) {
        return (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                <Activity className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-sm text-yellow-700">No tracking data yet. Add more measurements to see progress!</p>
            </div>
        );
    }

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'increasing': return <TrendingUp className="w-4 h-4 text-green-500" />;
            case 'decreasing': return <TrendingDown className="w-4 h-4 text-red-500" />;
            default: return <Minus className="w-4 h-4 text-slate-500" />;
        }
    };

    const metricColors: { [key: string]: string } = {
        chest: '#8B5CF6',
        waist: '#EC4899',
        hips: '#3B82F6',
        weight: '#10B981',
        shoulder: '#F59E0B'
    };

    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
        >
            {/* User Filter Dropdown */}
            {availableUsers.length > 1 && (
                <div className="flex items-center justify-end gap-2 mb-2">
                    <label className="text-sm font-semibold text-slate-700">Filter by:</label>
                    <select
                        value={selectedUser}
                        onChange={(e) => setSelectedUser(e.target.value)}
                        className="px-3 py-2 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all text-sm font-medium"
                    >
                        <option value="all">All Users</option>
                        {availableUsers.map(user => (
                            <option key={user} value={user}>{user}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-indigo-50 rounded-xl p-3 border border-indigo-100">
                    <div className="text-xs text-slate-600 mb-1">Total Tracked</div>
                    <div className="text-2xl font-bold text-indigo-600">{progress.total_measurements}</div>
                    <div className="text-xs text-slate-500">{progress.period_analyzed}</div>
                </div>

                {progress.body_shape && progress.body_shape.shape !== 'unknown' && (
                    <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                        <div className="text-xs text-slate-600 mb-1">Body Shape</div>
                        <div className="text-lg font-bold text-blue-600 capitalize">{progress.body_shape.shape.replace('_', ' ')}</div>
                        <div className="text-xs text-slate-500">{Math.round(progress.body_shape.confidence * 100)}% confident</div>
                    </div>
                )}

                {progress.trends && Object.keys(progress.trends).length > 0 && (
                    <>
                        {Object.entries(progress.trends).slice(0, 2).map(([measurement, data]) => (
                            <div key={measurement} className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                                <div className="text-xs text-slate-600 mb-1 capitalize flex items-center gap-1">
                                    {measurement.replace('_', ' ')}
                                    {getTrendIcon(data.trend)}
                                </div>
                                <div className="text-lg font-bold text-emerald-600">
                                    {data.change > 0 ? '+' : ''}{data.change}cm
                                </div>
                                <div className="text-xs text-slate-500">{data.percentage > 0 ? '+' : ''}{data.percentage}%</div>
                            </div>
                        ))}
                    </>
                )}
            </div>

            {/* Stat Sheet Grid (Compact) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedMetrics.map((metric) => {
                    const trend = progress.trends[metric];
                    const sparklineData = history.map(h => ({
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
                            className="bg-white rounded-xl shadow-bento border border-slate-200/60 overflow-hidden relative group"
                        >
                            {/* Card Content */}
                            <div className="p-4 relative z-10">
                                <div className="flex justify-between items-start mb-1">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{metric.replace('_', ' ')}</div>
                                    {trend && (
                                        <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${trend.change > 0 ? 'bg-emerald-100 text-emerald-700' :
                                            trend.change < 0 ? 'bg-rose-100 text-rose-700' :
                                                'bg-slate-100 text-slate-700'
                                            }`}>
                                            {trend.change > 0 ? '+' : ''}{trend.percentage}%
                                            {trend.change > 0 ? <TrendingUp size={10} /> : trend.change < 0 ? <TrendingDown size={10} /> : <Minus size={10} />}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-end gap-1 mb-2">
                                    <span className="text-2xl font-bold text-slate-900">{latestValue}</span>
                                    <span className="text-[10px] font-medium text-slate-400 mb-1">cm</span>
                                </div>
                            </div>

                            {/* Sparkline Background */}
                            <div className="absolute bottom-0 left-0 right-0 h-12 opacity-20 group-hover:opacity-30 transition-opacity">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={sparklineData}>
                                        <defs>
                                            <linearGradient id={`spark-compact-${metric}`} x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor={metricColors[metric] || '#8B5CF6'} stopOpacity={1} />
                                                <stop offset="100%" stopColor={metricColors[metric] || '#8B5CF6'} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <Area
                                            type="monotone"
                                            dataKey="value"
                                            stroke={metricColors[metric] || '#8B5CF6'}
                                            strokeWidth={1.5}
                                            fill={`url(#spark-compact-${metric})`}
                                            isAnimationActive={false}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Pattern Insights */}
            {progress.pattern_insights && progress.pattern_insights.length > 0 && (
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-200">
                    <div className="flex items-center gap-2 mb-2">
                        <Activity size={14} className="text-indigo-600" />
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-tight">Intelligence Insights</h4>
                    </div>
                    <div className="space-y-2">
                        {progress.pattern_insights.slice(0, 2).map((pattern, idx) => (
                            <div key={idx} className="text-xs text-indigo-900 bg-white/50 p-2 rounded-lg border border-indigo-100 flex justify-between items-center">
                                <span className="font-medium">{pattern.description}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold text-white ${pattern.confidence === 'high' ? 'bg-green-500' : 'bg-yellow-500'}`}>
                                    {pattern.confidence}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    );
};
