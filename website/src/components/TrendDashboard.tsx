import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Sparkles, Palette, Zap, Target, CheckCircle, ArrowRight, Star, Info, LayoutGrid, List } from 'lucide-react';
import toast from 'react-hot-toast';
import { TrendAPI } from '../services/trendApi';
import { useNavigate } from 'react-router-dom';

interface TrendDashboardProps {
    userId: number;
    mode: 'trending' | 'foryou';
    hideHeader?: boolean;
}

interface TrendItem {
    item: string;
    description: string;
    popularity_score: number;
    trend_direction: string;
    match_score?: number; // Optional for global trends
    confidence?: number;
    reasons?: string[];
    velocity?: number; // For global trends
    change?: number; // For global trends
}

interface TrendExplanation {
    why_trending: {
        social_media?: string;
        celebrities?: string[];
        runway?: string;
        blogs?: string;
    };
    why_for_you: {
        body_type?: string;
        style?: string;
        colors?: string;
        overall?: string;
    };
    how_to_style: string[];
    occasions: string[];
    match_score: number;
    confidence: number;
}

interface ColorTrend {
    color: string;
    hex: string;
    match_score?: number; // For personalized colors
    popularity?: number; // For trending colors
    trend_direction?: string;
}

interface ShapeChange {
    measurement: string;
    change: number;
    trend: string;
    significance: string;
}

interface BodyInsights {
    shape_changes: ShapeChange[];
    recommendations?: string[];
    latest_shape?: string;
}

export const TrendDashboard: React.FC<TrendDashboardProps> = ({ userId, mode, hideHeader }) => {
    const [trends, setTrends] = useState<TrendItem[]>([]);
    const [trendingColors, setTrendingColors] = useState<ColorTrend[]>([]);
    const [bodyInsights, setBodyInsights] = useState<BodyInsights | null>(null);
    const [selectedTrend, setSelectedTrend] = useState<string | null>(null);
    const [explanation, setExplanation] = useState<TrendExplanation | null>(null);
    const [explanationLoading, setExplanationLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [days, setDays] = useState(7);
    const navigate = useNavigate();

    useEffect(() => {
        loadTrendData();
    }, [userId, days, mode]);

    const loadTrendData = async () => {
        try {
            setLoading(true);
            setError(null);

            if (mode === 'trending') {
                // Global Trends (Prioritize external research over platform data)
                const response = await TrendAPI.getCombinedTrends(days);
                console.log('Combined trends response:', JSON.stringify(response, null, 2));
                if (response.success) {
                    // The response might have data at response.data or directly at response level
                    const externalTrends = response.data?.external_trends || response.external_trends;
                    console.log('External trends:', JSON.stringify(externalTrends, null, 2));
                    
                    const trendItems = externalTrends?.trending_items || [];
                    console.log('Trend items count:', trendItems.length);
                    
                    // map external trends only
                    const mappedTrends: TrendItem[] = trendItems.map((t: any) => ({
                        item: t.name || t.item || t.trend_name,
                        description: t.data?.description || t.description || 'Global fashion trend.',
                        popularity_score: t.popularity_score || 0,
                        trend_direction: t.trend_direction || 'stable',
                        reasons: t.data?.why_trending ? [t.data.why_trending] : (t.reasons || [])
                    }));

                    console.log('Mapped trends count:', mappedTrends.length);
                    setTrends(mappedTrends);

                    // We can still show trending colors from style trends if available
                    const styleResponse = await TrendAPI.getStyleTrends(days);
                    if (styleResponse.success) {
                        const colors = Object.entries(styleResponse.style_trends.trending_colors).map(([color, score]) => ({
                            color,
                            match_score: typeof score === 'number' ? score : 0,
                            hex: getColorHex(color)
                        }));
                        setTrendingColors(colors);
                    }
                }
            } else {
                // Personalized Trends
                const response = await TrendAPI.getTrendsForUser(userId, days, 60);
                if (response.success) {
                    setTrends(response.data.trending_items || []);
                    setTrendingColors(response.data.trending_colors || []);
                    setBodyInsights(response.data.body_insights || null);
                }
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load trend data');
        } finally {
            setLoading(false);
        }
    };

    const [researchLoading, setResearchLoading] = useState(false);

    const handleAILiveResearch = async () => {
        try {
            setResearchLoading(true);
            const toastId = toast.loading('🔍 AI is researching global trends...');
            const response = await TrendAPI.analyzeExternalTrends();
            if (response.success) {
                toast.success(`Found ${response.stored_count || 0} new trends!`, { id: toastId });
                await loadTrendData();
            } else {
                toast.error('Failed to analyze trends', { id: toastId });
            }
        } catch (err: any) {
            toast.error('AI Research failed: ' + (err?.response?.data?.detail || err.message));
        } finally {
            setResearchLoading(false);
        }
    };

    const getColorHex = (colorName: string): string => {
        const colorMap: { [key: string]: string } = {
            'black': '#000000', 'white': '#FFFFFF', 'red': '#EF4444',
            'blue': '#3B82F6', 'green': '#10B981', 'yellow': '#F59E0B',
            'purple': '#8B5CF6', 'pink': '#EC4899', 'brown': '#92400E'
        };
        return colorMap[colorName.toLowerCase()] || '#CCCCCC';
    };

    const loadTrendExplanation = async (item: string) => {
        // Toggle if already expanded
        if (selectedTrend === item && explanation) {
            setSelectedTrend(null);
            setExplanation(null);
            return;
        }

        try {
            setExplanationLoading(true);
            setSelectedTrend(item);
            setExplanation(null); // Clear previous explanation

            const response = await TrendAPI.explainTrend(userId, item);
            if (response.success && response.explanation) {
                setExplanation(response.explanation);
            } else {
                setExplanation(null);
            }
        } catch (err: any) {
            console.error('Failed to load explanation:', err);
            setExplanation(null);
        } finally {
            setExplanationLoading(false);
        }
    };

    const getTrendBadge = (trend: TrendItem) => {
        if (mode === 'foryou' && trend.match_score) {
            if (trend.match_score >= 90) return { text: 'Perfect Match', color: 'bg-green-500' };
            if (trend.match_score >= 80) return { text: 'Hot Trend', color: 'bg-orange-500' };
            return { text: 'Good Match', color: 'bg-purple-500' };
        } else {
            if (trend.popularity_score >= 80) return { text: 'Global Viral', color: 'bg-red-500' };
            if (trend.trend_direction === 'rising') return { text: 'Rising Fast', color: 'bg-blue-500' };
            return { text: 'Fashion Alert', color: 'bg-indigo-500' };
        }
    };

    const getTrendDirectionIcon = (direction: string) => {
        switch (direction) {
            case 'rising':
                return <TrendingUp className="w-4 h-4 text-green-500" />;
            case 'falling':
                return <TrendingDown className="w-4 h-4 text-red-500" />;
            default:
                return <Sparkles className="w-4 h-4 text-slate-400" />;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-2 border-slate-700 border-t-accent-500 animate-spin"></div>
                    <p className="text-sm font-medium text-slate-400">Loading trends...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bento-card p-6">
                <p className="text-red-400 font-medium">{error}</p>
            </div>
        );
    }

    const renderTrendingNow = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trends.map((trend, idx) => {
                const badge = getTrendBadge(trend);
                return (
                    <motion.div
                        key={idx}
                        whileHover={{ y: -4 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="group relative bento-card overflow-hidden hover:border-accent-500/30 transition-all"
                    >
                        {/* Premium Gradient Header */}
                        <div className="h-28 bg-gradient-to-br from-slate-800 via-slate-700 to-accent-900/50 relative overflow-hidden">
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(139,92,246,0.3),transparent_60%)]" />
                            <div className="absolute top-4 left-4">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide text-white ${badge.color.replace('bg-', 'bg-')}`}>
                                    {badge.text}
                                </span>
                            </div>
                            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                                <h3 className="text-xl font-bold text-white capitalize leading-none">
                                    {trend.item}
                                </h3>
                                <div className="bg-white/10 backdrop-blur-md rounded-lg px-2 py-1 flex items-center gap-1 border border-white/20">
                                    {getTrendDirectionIcon(trend.trend_direction)}
                                    <span className="text-white text-xs font-medium">
                                        {trend.trend_direction === 'rising' ? 'Hot' : 'Stable'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Trend Stats & Description */}
                        <div className="p-5">
                            <div className="flex items-center justify-between mb-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">Viral Score</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-bold text-white">{trend.popularity_score}</span>
                                        <span className="text-xs font-medium text-slate-500">/ 100</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">Growth</p>
                                    <span className="text-sm font-bold text-emerald-400 flex items-center justify-end">
                                        <Zap className="w-3 h-3 mr-1" />
                                        +{Math.floor(Math.random() * 20) + 10}%
                                    </span>
                                </div>
                            </div>

                            <p className="text-slate-400 text-sm mb-5 line-clamp-2 leading-relaxed">
                                {trend.description}
                            </p>

                            <button
                                onClick={() => loadTrendExplanation(trend.item)}
                                className="w-full py-2.5 bg-gradient-to-r from-accent-500 to-purple-500 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:from-accent-600 hover:to-purple-600 transition-all group/btn"
                            >
                                <span>Explore Trend</span>
                                <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
                            </button>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );

    const renderTrendsForYou = () => (
        <div className="space-y-4">
            {trends.map((trend, idx) => {
                const badge = getTrendBadge(trend);
                const isExpanded = selectedTrend === trend.item;

                return (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`bento-card ${isExpanded ? 'border-accent-500/50 shadow-lg shadow-accent-500/10' : ''} transition-all`}
                    >
                        <div className="p-5 flex flex-col md:flex-row md:items-center gap-5">
                            {/* Advisor Icon/Match */}
                            <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-accent-500/20 to-purple-500/20 rounded-2xl flex flex-col items-center justify-center border border-accent-500/20">
                                <span className="text-2xl font-bold text-accent-400 leading-none">{trend.match_score || 0}%</span>
                                <span className="text-[8px] font-semibold text-accent-300 uppercase tracking-wide mt-1">Match</span>
                            </div>

                            {/* Info */}
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`px-2 py-0.5 rounded-md text-[8px] font-bold text-white uppercase tracking-tight ${badge.color}`}>
                                        {badge.text}
                                    </span>
                                    <h3 className="text-lg font-bold text-white capitalize">{trend.item}</h3>
                                </div>
                                <p className="text-slate-400 text-sm mb-3">
                                    Tailored advice for your <span className="text-accent-400 font-medium">Athletic</span> body type.
                                </p>

                                {trend.reasons && (
                                    <div className="flex flex-wrap gap-2">
                                        {trend.reasons.map((r, i) => (
                                            <span key={i} className="text-[10px] font-medium text-slate-300 bg-slate-700/50 px-2 py-1 rounded-md border border-slate-600/50">
                                                ✓ {r}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => loadTrendExplanation(trend.item)}
                                    className={`px-5 py-2 rounded-xl font-semibold text-sm transition-all ${isExpanded ? 'bg-slate-700 text-slate-300' : 'bg-slate-800/50 border border-accent-500/50 text-accent-400 hover:bg-accent-500/10'}`}
                                >
                                    {isExpanded ? 'Close' : 'View Advice'}
                                </button>
                                <button className="p-2 bg-gradient-to-r from-accent-500 to-purple-500 text-white rounded-xl hover:from-accent-600 hover:to-purple-600 transition-all">
                                    <Target className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Expanded Personalized Advice Section */}
                        {isExpanded && explanation && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                className="border-t border-slate-700/50 bg-slate-800/30 p-6 rounded-b-2xl"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wide mb-3">
                                            <Info className="w-4 h-4 text-accent-400" />
                                            Why It Works For You
                                        </h4>
                                        <div className="space-y-3">
                                            {explanation?.why_for_you?.body_type && (
                                                <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                                                    <p className="text-[10px] text-slate-500 font-semibold uppercase mb-1">Body Architecture</p>
                                                    <p className="text-sm text-slate-300">{explanation.why_for_you.body_type}</p>
                                                </div>
                                            )}
                                            {explanation?.why_for_you?.colors && (
                                                <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                                                    <p className="text-[10px] text-slate-500 font-semibold uppercase mb-1">Color Palette</p>
                                                    <p className="text-sm text-slate-300">{explanation.why_for_you.colors}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wide mb-3">
                                            <Sparkles className="w-4 h-4 text-amber-400" />
                                            Pro Styling Secret
                                        </h4>
                                        <div className="bg-amber-500/10 p-4 rounded-xl border border-amber-500/20 border-l-4 border-l-amber-400">
                                            <p className="text-sm text-amber-200 italic leading-relaxed">
                                                {explanation?.how_to_style?.[0] || "Pair this with structured neutrals for an elevated look."}
                                            </p>
                                        </div>
                                        <button className="mt-4 flex items-center gap-2 text-accent-400 font-semibold text-xs uppercase hover:underline">
                                            View Full Styling Guide <ArrowRight className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                );
            })}
        </div>
    );

    const renderEmptyState = () => (
        <div className="bento-card border-2 border-dashed border-slate-700/50 p-12 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-accent-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Sparkles className="w-8 h-8 text-accent-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
                {mode === 'foryou' ? 'Your style profile is growing!' : 'No live product trends found'}
            </h3>
            <p className="text-slate-400 max-w-md mx-auto mb-8">
                {mode === 'foryou'
                    ? 'Complete more fit checks and add items to your wardrobe to get hyper-personalized recommendations.'
                    : 'Our AI researchers are ready to scan social media and runway data for the latest products.'}
            </p>
            {mode === 'trending' ? (
                <button
                    onClick={handleAILiveResearch}
                    disabled={researchLoading}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent-500 to-purple-500 text-white rounded-xl font-semibold hover:from-accent-600 hover:to-purple-600 transition-all shadow-lg shadow-accent-500/25 disabled:opacity-50"
                >
                    <Zap className="w-5 h-5" />
                    {researchLoading ? 'Analyzing Trends...' : 'Unlock Global Trends with AI'}
                </button>
            ) : (
                <button
                    onClick={() => navigate('/fit-checker')}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800/50 border border-accent-500/50 text-accent-400 rounded-xl font-semibold hover:bg-accent-500/10 transition-all"
                >
                    <Target className="w-5 h-5" />
                    Start Fit Check
                </button>
            )}
        </div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-2 border-slate-700 border-t-accent-500 animate-spin"></div>
                    <p className="text-sm font-medium text-slate-400">Loading trends...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bento-card p-6">
                <p className="text-red-400 font-medium">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20">
            {/* Premium Header */}
            {!hideHeader && (
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-700/50 pb-8">
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2.5 rounded-xl ${mode === 'trending' ? 'bg-gradient-to-br from-slate-700 to-slate-800' : 'bg-gradient-to-br from-accent-500 to-purple-500'} text-white`}>
                                {mode === 'trending' ? <LayoutGrid className="w-5 h-5" /> : <List className="w-5 h-5" />}
                            </div>
                            <h2 className="text-3xl font-bold text-white">
                                {mode === 'trending' ? 'Global Discovery' : 'Personal Advisor'}
                            </h2>
                        </div>
                        <p className="text-slate-400">
                            {mode === 'trending'
                                ? 'Real-time viral fashion insights from high-impact social data & global runways.'
                                : 'Hyper-tailored trend matches designed for your unique body architecture and style DNA.'}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {mode === 'trending' && (
                            <button
                                onClick={handleAILiveResearch}
                                disabled={researchLoading}
                                className="px-5 py-2.5 bg-gradient-to-r from-accent-500 to-purple-500 text-white rounded-xl hover:from-accent-600 hover:to-purple-600 transition-all font-semibold flex items-center gap-2"
                            >
                                <Zap className="w-4 h-4 text-amber-300" />
                                Sync Live
                            </button>
                        )}
                        <select
                            value={days}
                            onChange={(e) => setDays(Number(e.target.value))}
                            className="bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2.5 font-medium text-white outline-none focus:border-accent-500/50 transition-colors"
                        >
                            <option value={7}>Last Week</option>
                            <option value={30}>Last Month</option>
                            <option value={90}>Last Quarter</option>
                        </select>
                    </div>
                </div>
            )}


            {/* Body Shape Insights */}
            {mode === 'foryou' && bodyInsights && bodyInsights.shape_changes && bodyInsights.shape_changes.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-accent-500/10 to-purple-500/10 rounded-2xl p-6 border border-accent-500/20"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-11 h-11 bg-gradient-to-br from-accent-500 to-purple-500 rounded-xl flex items-center justify-center">
                            <Sparkles className="text-white" size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-white">Your Body Shape Changed!</h3>
                            <p className="text-sm text-slate-400">New styling recommendations for you</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {bodyInsights.shape_changes.map((change: ShapeChange, idx: number) => (
                            <div key={idx} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <span className="text-slate-300 font-medium capitalize">{change.measurement}</span>
                                        <span className={`text-xs font-semibold ${change.trend === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                            {change.trend === 'up' ? '↑' : '↓'} {Math.abs(change.change)}cm
                                        </span>
                                    </div>
                                    <span className="text-xs text-slate-500">{change.significance}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {bodyInsights.latest_shape && (
                        <div className="mt-4 p-3 bg-accent-500/10 rounded-xl border border-accent-500/20">
                            <p className="text-sm text-accent-300">
                                💡 Check out trending styles that complement your <span className="font-semibold">{bodyInsights.latest_shape}</span> shape below!
                            </p>
                        </div>
                    )}
                </motion.div>
            )}

            {/* Trending Items List/Grid */}
            <div>
                {trends.length === 0 ? (
                    renderEmptyState()
                ) : (
                    mode === 'trending' ? renderTrendingNow() : renderTrendsForYou()
                )}
            </div>

            {/* Expanded Explanation Overlay (Global Mode) */}
            {mode === 'trending' && selectedTrend && explanation && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedTrend(null)}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bento-card max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-3xl font-bold text-white capitalize mb-1">{selectedTrend}</h3>
                                    <p className="text-accent-400 font-semibold uppercase tracking-wide text-xs">Global Viral Breakdown</p>
                                </div>
                                <button
                                    onClick={() => setSelectedTrend(null)}
                                    className="p-2 hover:bg-slate-700/50 rounded-xl transition-colors text-slate-400 hover:text-white"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Why Trending (Global Context) */}
                                <div>
                                    <h4 className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wide mb-3">
                                        <TrendingUp className="w-4 h-4 text-orange-400" />
                                        Viral Roots
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {explanation.why_trending.social_media && (
                                            <div className="bg-orange-500/10 p-5 rounded-xl border border-orange-500/20">
                                                <p className="text-[10px] font-bold text-orange-400 uppercase mb-2">Social Pulse</p>
                                                <p className="text-sm text-orange-200 leading-relaxed">{explanation.why_trending.social_media}</p>
                                            </div>
                                        )}
                                        {explanation.why_trending.runway && (
                                            <div className="bg-purple-500/10 p-5 rounded-xl border border-purple-500/20">
                                                <p className="text-[10px] font-bold text-purple-400 uppercase mb-2">Runway Verdict</p>
                                                <p className="text-sm text-purple-200 leading-relaxed">{explanation.why_trending.runway}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Global Styling */}
                                <div>
                                    <h4 className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wide mb-3">
                                        <Sparkles className="w-4 h-4 text-blue-400" />
                                        Aesthetic Guide
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {explanation.how_to_style.map((tip, i) => (
                                            <span key={i} className="px-4 py-2 bg-slate-700/50 text-slate-300 rounded-xl text-sm font-medium border border-slate-600/50">
                                                ★ {tip}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {/* Trending Colors */}
            {trendingColors.length > 0 && (
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bento-card p-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Palette className={`w-6 h-6 ${mode === 'trending' ? 'text-pink-400' : 'text-accent-400'}`} />
                            {mode === 'trending' ? 'Seasonal Color Pulse' : 'Personal Color IQ'}
                        </h3>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide bg-slate-700/50 px-3 py-1 rounded-full">
                            Updated Today
                        </span>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-5">
                        {trendingColors.map((color, idx) => (
                            <div
                                key={idx}
                                className="group cursor-pointer"
                            >
                                <div
                                    className="w-full h-24 rounded-2xl mb-3 shadow-inner transform transition-transform group-hover:scale-105 border border-slate-700/30"
                                    style={{ backgroundColor: color.hex || '#CCCCCC' }}
                                />
                                <div className="text-center">
                                    <p className="font-semibold text-white capitalize text-sm">{color.color}</p>
                                    <p className={`text-[10px] font-semibold uppercase tracking-wide ${mode === 'trending' ? 'text-pink-400' : 'text-accent-400'}`}>
                                        {color.match_score}% {mode === 'trending' ? 'Volume' : 'IQ'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
};
