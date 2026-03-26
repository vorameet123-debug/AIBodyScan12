import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Clock,
    Search,
    Filter,
    ArrowUpDown,
    ShoppingCart,
    Heart,
    Package,
    Calendar,
    ChevronDown,
    X,
    TrendingUp,
    TrendingDown
} from 'lucide-react';
import { WardrobeAPI } from '../../services/wardrobeApi';
import toast from 'react-hot-toast';
import { WardrobeAnalyticsData, FitHistoryItem } from '../../types/wardrobe';

interface ActivityHistoryTabProps {
    userId: number;
}

type SortOption = 'date-desc' | 'date-asc' | 'score-desc' | 'score-asc';
type FilterStatus = 'all' | 'purchased' | 'wishlist' | 'checked';
type FilterScore = 'all' | 'high' | 'medium' | 'low';

export const ActivityHistoryTab: React.FC<ActivityHistoryTabProps> = ({ userId }) => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<WardrobeAnalyticsData | null>(null);

    // Filters & Search
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<SortOption>('date-desc');
    const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
    const [filterScore, setFilterScore] = useState<FilterScore>('all');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        loadData();
    }, [userId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const response = await WardrobeAPI.getAnalytics(userId, 'all');
            if (response.success) {
                setData(response.data);
            }
        } catch (error) {
            console.error('Failed to load history:', error);
            toast.error('Failed to load activity history');
        } finally {
            setLoading(false);
        }
    };

    // Filter and sort the history
    const filteredHistory = useMemo(() => {
        if (!data?.fit_history) return [];

        let items = [...data.fit_history];

        // Search filter
        if (searchQuery) {
            items = items.filter(item =>
                item.garment.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Status filter
        if (filterStatus !== 'all') {
            items = items.filter(item => {
                if (filterStatus === 'purchased') return item.purchased;
                if (filterStatus === 'wishlist') return item.wishlist;
                if (filterStatus === 'checked') return !item.purchased && !item.wishlist;
                return true;
            });
        }

        // Score filter
        if (filterScore !== 'all') {
            items = items.filter(item => {
                if (filterScore === 'high') return item.score >= 80;
                if (filterScore === 'medium') return item.score >= 50 && item.score < 80;
                if (filterScore === 'low') return item.score < 50;
                return true;
            });
        }

        // Sort
        items.sort((a, b) => {
            switch (sortBy) {
                case 'date-desc':
                    return new Date(b.date).getTime() - new Date(a.date).getTime();
                case 'date-asc':
                    return new Date(a.date).getTime() - new Date(b.date).getTime();
                case 'score-desc':
                    return b.score - a.score;
                case 'score-asc':
                    return a.score - b.score;
                default:
                    return 0;
            }
        });

        return items;
    }, [data, searchQuery, sortBy, filterStatus, filterScore]);

    const getStatusIcon = (item: FitHistoryItem) => {
        if (item.purchased) return <ShoppingCart className="w-4 h-4 text-emerald-400" />;
        if (item.wishlist) return <Heart className="w-4 h-4 text-pink-400" />;
        return <Package className="w-4 h-4 text-blue-400" />;
    };

    const getStatusBg = (item: FitHistoryItem) => {
        if (item.purchased) return 'bg-emerald-500/20';
        if (item.wishlist) return 'bg-pink-500/20';
        return 'bg-blue-500/20';
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-emerald-400';
        if (score >= 50) return 'text-amber-400';
        return 'text-rose-400';
    };

    const clearFilters = () => {
        setSearchQuery('');
        setFilterStatus('all');
        setFilterScore('all');
        setSortBy('date-desc');
    };

    const hasActiveFilters = searchQuery || filterStatus !== 'all' || filterScore !== 'all' || sortBy !== 'date-desc';

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-2 border-accent-200 border-t-accent-600 animate-spin"></div>
                    <p className="text-sm font-medium text-slate-400">Loading history...</p>
                </div>
            </div>
        );
    }

    if (!data || data.fit_history.length === 0) {
        return (
            <div className="bg-slate-900/50 backdrop-blur-xl border-2 border-dashed border-slate-700 rounded-2xl p-10 text-center">
                <div className="w-14 h-14 bg-accent-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-7 h-7 text-accent-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">No Activity Yet</h3>
                <p className="text-slate-400 mb-4">Complete fit checks to see your activity history!</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with Search & Filters */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by garment name..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                        />
                    </div>

                    {/* Filter & Sort Buttons */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${showFilters || hasActiveFilters
                                    ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                                    : 'bg-slate-800/50 text-slate-400 border border-white/10 hover:bg-slate-800'
                                }`}
                        >
                            <Filter className="w-4 h-4" />
                            Filters
                            {hasActiveFilters && (
                                <span className="w-2 h-2 rounded-full bg-violet-400"></span>
                            )}
                        </button>

                        {/* Sort Dropdown */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as SortOption)}
                            className="px-4 py-2.5 bg-slate-800/50 border border-white/10 rounded-xl text-slate-300 text-sm font-medium focus:outline-none focus:border-violet-500 cursor-pointer"
                        >
                            <option value="date-desc">Newest First</option>
                            <option value="date-asc">Oldest First</option>
                            <option value="score-desc">Highest Score</option>
                            <option value="score-asc">Lowest Score</option>
                        </select>
                    </div>
                </div>

                {/* Expanded Filters */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="flex flex-wrap gap-3 pt-4 mt-4 border-t border-white/5">
                                {/* Status Filter */}
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-slate-500">Status:</span>
                                    {(['all', 'purchased', 'wishlist', 'checked'] as FilterStatus[]).map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => setFilterStatus(status)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterStatus === status
                                                    ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                                                    : 'bg-slate-800/50 text-slate-400 border border-white/5 hover:bg-slate-800'
                                                }`}
                                        >
                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                        </button>
                                    ))}
                                </div>

                                {/* Score Filter */}
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-slate-500">Score:</span>
                                    {(['all', 'high', 'medium', 'low'] as FilterScore[]).map((score) => (
                                        <button
                                            key={score}
                                            onClick={() => setFilterScore(score)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterScore === score
                                                    ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                                                    : 'bg-slate-800/50 text-slate-400 border border-white/5 hover:bg-slate-800'
                                                }`}
                                        >
                                            {score === 'high' ? '80+' : score === 'medium' ? '50-79' : score === 'low' ? '<50' : 'All'}
                                        </button>
                                    ))}
                                </div>

                                {/* Clear Filters */}
                                {hasActiveFilters && (
                                    <button
                                        onClick={clearFilters}
                                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                                    >
                                        <X className="w-3 h-3" />
                                        Clear All
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">
                    Showing <span className="text-white font-semibold">{filteredHistory.length}</span> of{' '}
                    <span className="text-white font-semibold">{data.fit_history.length}</span> items
                </p>
            </div>

            {/* History List */}
            <div className="space-y-3">
                {filteredHistory.length > 0 ? (
                    filteredHistory.map((item, idx) => (
                        <motion.div
                            key={`${item.garment}-${item.date}-${idx}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.02 }}
                            className="flex items-center gap-4 p-4 bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-xl hover:border-violet-500/30 transition-all group"
                        >
                            {/* Status Icon */}
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getStatusBg(item)}`}>
                                {getStatusIcon(item)}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="text-sm font-semibold text-white truncate">
                                        {item.garment}
                                    </p>
                                    {item.purchased && (
                                        <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 rounded-full">
                                            PURCHASED
                                        </span>
                                    )}
                                    {item.wishlist && (
                                        <span className="px-2 py-0.5 text-[10px] font-bold bg-pink-500/20 text-pink-400 rounded-full">
                                            WISHLIST
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 text-xs text-slate-500">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {item.date}
                                    </span>
                                </div>
                            </div>

                            {/* Score */}
                            <div className="text-right">
                                <div className={`text-2xl font-bold ${getScoreColor(item.score)}`}>
                                    {item.score}
                                </div>
                                <div className="text-xs text-slate-500">Fit Score</div>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="text-center py-12 text-slate-400">
                        <Search className="w-10 h-10 mx-auto mb-3 opacity-50" />
                        <p className="font-medium">No items match your filters</p>
                        <button
                            onClick={clearFilters}
                            className="mt-2 text-sm text-violet-400 hover:text-violet-300"
                        >
                            Clear filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
