import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, LineChart, Line, CartesianGrid } from 'recharts';
import { Package, Palette, TrendingUp, AlertCircle, Heart, ShoppingCart } from 'lucide-react';
import { WardrobeAPI, WardrobeAnalyticsData, WishlistItem } from '../services/wardrobeApi';
import { Spinner } from './ui/Spinner';
import toast from 'react-hot-toast';

interface WardrobeAnalyticsProps {
    userId: number;
    hideHeader?: boolean;
}

const COLORS = ['#6366F1', '#8B5CF6', '#A855F7', '#D946EF', '#EC4899', '#F43F5E', '#FB7185', '#FDA4AF'];

export const WardrobeAnalytics: React.FC<WardrobeAnalyticsProps> = ({ userId, hideHeader }) => {
    const [data, setData] = useState<WardrobeAnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'purchased' | 'wishlist'>('all');

    useEffect(() => {
        loadAnalytics();
    }, [userId, filter]);

    const loadAnalytics = async () => {
        try {
            setLoading(true);
            const response = await WardrobeAPI.getAnalytics(userId, filter);
            if (response.success) {
                setData(response.data);
            }
        } catch (error) {
            console.error('Failed to load analytics:', error);
            toast.error('Failed to load wardrobe analytics');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="flex flex-col items-center gap-4">
                    <Spinner size="xl" />
                    <p className="text-sm font-medium text-slate-500">Loading analytics...</p>
                </div>
            </div>
        );
    }

    if (!data || data.composition.total_items === 0) {
        return (
            <div className="bg-slate-900 border-2 border-dashed border-slate-700 rounded-2xl p-6 md:p-8 text-center">
                <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Package className="w-7 h-7 text-amber-500" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">No Wardrobe Data Yet</h3>
                <p className="text-slate-500">Complete some fit checks to see your wardrobe analytics!</p>
            </div>
        );
    }

    // Prepare chart data
    const compositionData = Object.entries(data.composition.by_type).map(([name, value]) => ({
        name: name.replace('_', ' '),
        value,
    }));

    const colorData = Object.entries(data.colors.distribution).map(([name, value]) => ({
        name,
        value,
    }));

    return (
        <div className="space-y-6">
            {/* Filter Toggle */}
            {!hideHeader && (
                <div className="bg-slate-900 rounded-2xl shadow-bento border border-slate-700/60 p-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-white">Wardrobe Analytics</h2>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === 'all'
                                    ? 'bg-slate-900 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                All Items
                            </button>
                            <button
                                onClick={() => setFilter('purchased')}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === 'purchased'
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                Purchased
                            </button>
                            <button
                                onClick={() => setFilter('wishlist')}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === 'wishlist'
                                    ? 'bg-amber-500 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                Wishlist
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Conversion Stats - Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-slate-900 rounded-2xl p-5 border border-slate-700/60 shadow-bento"
                >
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-3">
                        <ShoppingCart className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-white">{data.conversion.total_checks}</div>
                    <div className="text-sm text-slate-500">Total Checks</div>
                </motion.div>

                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-slate-900 rounded-2xl p-5 border border-slate-700/60 shadow-bento"
                >
                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mb-3">
                        <Package className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="text-2xl font-bold text-white">{data.conversion.purchased}</div>
                    <div className="text-sm text-slate-500">Purchased</div>
                </motion.div>

                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-slate-900 rounded-2xl p-5 border border-slate-700/60 shadow-bento"
                >
                    <div className="w-10 h-10 bg-pink-50 rounded-xl flex items-center justify-center mb-3">
                        <Heart className="w-5 h-5 text-pink-600" />
                    </div>
                    <div className="text-2xl font-bold text-white">{data.conversion.wishlist}</div>
                    <div className="text-sm text-slate-500">Wishlist</div>
                </motion.div>

                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-slate-900 rounded-2xl p-5 border border-slate-700/60 shadow-bento"
                >
                    <div className="w-10 h-10 bg-accent-50 rounded-xl flex items-center justify-center mb-3">
                        <TrendingUp className="w-5 h-5 text-accent-500" />
                    </div>
                    <div className="text-2xl font-bold text-white">{data.conversion.conversion_rate}%</div>
                    <div className="text-sm text-slate-500">Conversion</div>
                </motion.div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Composition Chart */}
                <div className="bg-slate-900 rounded-2xl shadow-bento p-6 border border-slate-700/60">
                    <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                        <Package className="w-5 h-5 text-accent-500" />
                        Wardrobe Composition
                    </h3>
                    <ResponsiveContainer width="100%" height={320}>
                        <PieChart>
                            <Pie
                                data={compositionData}
                                cx="50%"
                                cy="55%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={3}
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                fill="#8884d8"
                                dataKey="value"
                                animationDuration={800}
                            >
                                {compositionData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                        opacity={0.9}
                                        className="cursor-pointer hover:opacity-100 transition-opacity"
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1E293B',
                                    border: '1px solid #475569',
                                    borderRadius: '12px',
                                    color: '#F1F5F9'
                                }}
                            />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                iconType="circle"
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Color Distribution */}
                <div className="bg-slate-900 rounded-2xl shadow-bento p-6 border border-slate-700/60">
                    <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                        <Palette className="w-5 h-5 text-pink-500" />
                        Color Distribution
                    </h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={colorData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                            <XAxis
                                dataKey="name"
                                tick={{ fontSize: 12, fill: '#64748B' }}
                                angle={-45}
                                textAnchor="end"
                                height={80}
                            />
                            <YAxis tick={{ fontSize: 12, fill: '#64748B' }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1E293B',
                                    border: '1px solid #475569',
                                    borderRadius: '12px',
                                    color: '#F1F5F9'
                                }}
                                cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}
                            />
                            <Bar
                                dataKey="value"
                                radius={[8, 8, 0, 0]}
                                animationDuration={800}
                            >
                                {colorData.map((entry, index) => {
                                    // Comprehensive color map with variations
                                    const colorMap: { [key: string]: string } = {
                                        // Basics
                                        'black': '#000000',
                                        'white': '#FFFFFF',
                                        'gray': '#6B7280',
                                        'grey': '#6B7280',

                                        // Blues
                                        'blue': '#3B82F6',
                                        'light blue': '#60A5FA',
                                        'dark blue': '#1E40AF',
                                        'navy': '#1E3A8A',
                                        'navy blue': '#1E3A8A',
                                        'sky blue': '#7DD3FC',
                                        'royal blue': '#2563EB',
                                        'cobalt': '#0047AB',

                                        // Reds
                                        'red': '#EF4444',
                                        'light red': '#F87171',
                                        'dark red': '#B91C1C',
                                        'maroon': '#7F1D1D',
                                        'burgundy': '#881337',
                                        'crimson': '#DC143C',

                                        // Greens
                                        'green': '#10B981',
                                        'light green': '#4ADE80',
                                        'dark green': '#065F46',
                                        'olive': '#84CC16',
                                        'lime': '#84CC16',
                                        'mint': '#6EE7B7',
                                        'forest green': '#166534',
                                        'sage': '#9CA986',

                                        // Yellows/Oranges
                                        'yellow': '#F59E0B',
                                        'light yellow': '#FCD34D',
                                        'gold': '#D97706',
                                        'orange': '#F97316',
                                        'light orange': '#FB923C',
                                        'dark orange': '#C2410C',

                                        // Purples/Pinks
                                        'purple': '#8B5CF6',
                                        'light purple': '#A78BFA',
                                        'dark purple': '#6B21A8',
                                        'violet': '#7C3AED',
                                        'lavender': '#C4B5FD',
                                        'pink': '#EC4899',
                                        'light pink': '#F9A8D4',
                                        'hot pink': '#DB2777',
                                        'magenta': '#D946EF',

                                        // Browns/Tans
                                        'brown': '#92400E',
                                        'light brown': '#A16207',
                                        'dark brown': '#78350F',
                                        'tan': '#D2B48C',
                                        'beige': '#D4A574',
                                        'khaki': '#C3B091',
                                        'cream': '#FFFDD0',
                                        'camel': '#C19A6B',

                                        // Other
                                        'teal': '#14B8A6',
                                        'turquoise': '#2DD4BF',
                                        'cyan': '#22D3EE',
                                        'indigo': '#4F46E5',
                                        'charcoal': '#36454F',
                                        'silver': '#C0C0C0',
                                        'unknown': '#9CA3AF'
                                    };

                                    const colorName = entry.name.toLowerCase();
                                    const fillColor = colorMap[colorName] || '#9CA3AF'; // Default to gray instead of pink

                                    return (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={fillColor}
                                            stroke={fillColor === '#FFFFFF' ? '#334155' : 'none'}
                                            strokeWidth={fillColor === '#FFFFFF' ? 2 : 0}
                                            opacity={0.9}
                                            className="cursor-pointer hover:opacity-100 transition-opacity"
                                        />
                                    );
                                })}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Fit Score Timeline */}
            {data.fit_history.length > 0 && (
                <div className="bg-slate-900 rounded-2xl shadow-bento p-6 border border-slate-700/60">
                    <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-500" />
                        Fit Score Timeline (Last 30 Days)
                    </h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={data.fit_history}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 12, fill: '#64748B' }}
                            />
                            <YAxis
                                domain={[0, 100]}
                                tick={{ fontSize: 12, fill: '#64748B' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1E293B',
                                    border: '1px solid #475569',
                                    borderRadius: '12px',
                                    color: '#F1F5F9'
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="score"
                                stroke="url(#colorGradient)"
                                strokeWidth={3}
                                dot={{
                                    fill: '#6366F1', // We can keep this or use accent hex
                                    strokeWidth: 2,
                                    r: 5,
                                    className: 'hover:r-7 transition-all cursor-pointer'
                                }}
                                activeDot={{
                                    r: 8,
                                    fill: '#8B5CF6',
                                    stroke: '#FFF',
                                    strokeWidth: 2
                                }}
                                animationDuration={800}
                            />
                            <defs>
                                <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor="#6366F1" />
                                    <stop offset="100%" stopColor="#8B5CF6" />
                                </linearGradient>
                            </defs>
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Wardrobe Gaps */}
            {data.gaps.length > 0 && (
                <div className="bg-slate-900 rounded-2xl shadow-bento p-6 border border-slate-700/60">
                    <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-amber-500" />
                        Wardrobe Gaps
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {data.gaps.map((gap, idx) => (
                            <div key={idx} className="bg-amber-50 border border-amber-200/60 rounded-xl p-4">
                                <div className="font-semibold text-slate-900">{gap.item.replace('_', ' ')}</div>
                                <div className="text-sm text-slate-600">{gap.reason}</div>
                                <div className="text-xs text-amber-600 mt-1 font-medium">{gap.category}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Wishlist */}
            {data.wishlist.length > 0 && (
                <div className="bg-slate-900 rounded-2xl shadow-bento p-6 border border-slate-700/60">
                    <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                        <Heart className="w-5 h-5 text-pink-500" />
                        Your Wishlist ({data.wishlist.length} items)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {data.wishlist.slice(0, 6).map((item) => (
                            <div key={item.id} className="bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-100 rounded-xl p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="font-semibold text-slate-900">{item.garment}</div>
                                    <div className="text-xl font-bold text-accent-500">{item.score}</div>
                                </div>
                                <div className="text-sm text-slate-600">Size: {item.size}</div>
                                <div className="text-sm text-slate-600">Color: {item.color}</div>
                                <div className="text-xs text-slate-400 mt-2">{item.days_ago} days ago</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
