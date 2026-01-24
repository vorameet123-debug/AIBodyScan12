import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Package,
    Grid3x3,
    List,
    Search,
    Filter,
    SortAsc,
    Calendar,
    Tag,
    Heart,
    ShoppingCart,
    Star,
    Trash2,
    Edit,
    Eye,
    X,
    ChevronDown
} from 'lucide-react';
import { WardrobeAPI } from '../../services/wardrobeApi';
import toast from 'react-hot-toast';

interface MyItemsTabProps {
    userId: number;
}

interface WardrobeItem {
    id: number;
    garment: string;
    size: string;
    color: string;
    brand?: string;
    category: string;
    fitScore: number;
    purchased: boolean;
    purchaseDate?: string;
    lastWorn?: string;
    wearCount?: number;
    price?: number;
    imageUrl?: string;
}

type ViewMode = 'grid' | 'list';
type FilterType = 'all' | 'purchased' | 'wishlist';
type SortOption = 'recent' | 'score' | 'worn' | 'price';

export const MyItemsTab: React.FC<MyItemsTabProps> = ({ userId }) => {
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState<WardrobeItem[]>([]);
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [filter, setFilter] = useState<FilterType>('all');
    const [sortBy, setSortBy] = useState<SortOption>('recent');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        loadItems();
    }, [userId, filter]);

    const loadItems = async () => {
        try {
            setLoading(true);
            const response = await WardrobeAPI.getAnalytics(userId, filter);
            if (response.success) {
                // Transform the data into items format
                const transformedItems = transformDataToItems(response.data);
                setItems(transformedItems);
            }
        } catch (error) {
            console.error('Failed to load items:', error);
            toast.error('Failed to load wardrobe items');
        } finally {
            setLoading(false);
        }
    };

    const transformDataToItems = (data: any): WardrobeItem[] => {
        // Combine wishlist and fit history into items
        const wishlistItems: WardrobeItem[] = data.wishlist.map((item: any, idx: number) => ({
            id: item.id,
            garment: item.garment,
            size: item.size,
            color: item.color,
            category: 'Unknown',
            fitScore: item.score,
            purchased: false,
            purchaseDate: undefined,
            lastWorn: undefined,
            wearCount: 0,
            price: undefined,
            imageUrl: undefined,
            brand: undefined
        }));

        const purchasedItems: WardrobeItem[] = data.fit_history
            .filter((item: any) => item.purchased)
            .map((item: any, idx: number) => ({
                id: 1000 + idx,
                garment: item.garment,
                size: 'Unknown',
                color: 'Unknown',
                category: 'Unknown',
                fitScore: item.score,
                purchased: true,
                purchaseDate: item.date,
                lastWorn: undefined,
                wearCount: Math.floor(Math.random() * 10),
                price: undefined,
                imageUrl: undefined,
                brand: undefined
            }));

        return [...purchasedItems, ...wishlistItems];
    };

    const filteredAndSortedItems = items
        .filter(item => {
            if (searchQuery && !item.garment.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
            }
            if (selectedCategory !== 'all' && item.category !== selectedCategory) {
                return false;
            }
            return true;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'score':
                    return b.fitScore - a.fitScore;
                case 'worn':
                    return (b.wearCount || 0) - (a.wearCount || 0);
                case 'price':
                    return (b.price || 0) - (a.price || 0);
                case 'recent':
                default:
                    return new Date(b.purchaseDate || 0).getTime() - new Date(a.purchaseDate || 0).getTime();
            }
        });

    const categories = ['all', ...Array.from(new Set(items.map(item => item.category)))];

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-2 border-accent-200 border-t-accent-600 animate-spin"></div>
                    <p className="text-sm font-medium text-slate-400">Loading your items...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search items..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-accent-500 transition-colors"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* View Mode Toggle */}
                    <div className="flex items-center gap-2 bg-slate-800/50 rounded-xl p-1">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition-colors ${
                                viewMode === 'grid'
                                    ? 'bg-accent-500 text-white'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <Grid3x3 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-colors ${
                                viewMode === 'list'
                                    ? 'bg-accent-500 text-white'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Filter Toggle */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white hover:border-accent-500 transition-colors"
                    >
                        <Filter className="w-4 h-4" />
                        <span className="font-medium">Filters</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                    </button>
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
                            <div className="pt-4 mt-4 border-t border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Status Filter */}
                                <div>
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
                                        Status
                                    </label>
                                    <div className="flex gap-2">
                                        {(['all', 'purchased', 'wishlist'] as FilterType[]).map((type) => (
                                            <button
                                                key={type}
                                                onClick={() => setFilter(type)}
                                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                                    filter === type
                                                        ? 'bg-accent-500 text-white'
                                                        : 'bg-slate-800/50 text-slate-400 hover:text-white'
                                                }`}
                                            >
                                                {type.charAt(0).toUpperCase() + type.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Category Filter */}
                                <div>
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
                                        Category
                                    </label>
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="w-full px-3 py-1.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-accent-500"
                                    >
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat}>
                                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Sort Filter */}
                                <div>
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
                                        Sort By
                                    </label>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                                        className="w-full px-3 py-1.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-accent-500"
                                    >
                                        <option value="recent">Most Recent</option>
                                        <option value="score">Fit Score</option>
                                        <option value="worn">Most Worn</option>
                                        <option value="price">Price</option>
                                    </select>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Items Count */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">
                    Showing <span className="font-semibold text-white">{filteredAndSortedItems.length}</span> of{' '}
                    <span className="font-semibold text-white">{items.length}</span> items
                </p>
            </div>

            {/* Items Grid/List */}
            {filteredAndSortedItems.length === 0 ? (
                <div className="bg-slate-900/50 backdrop-blur-xl border-2 border-dashed border-slate-700 rounded-2xl p-10 text-center">
                    <Package className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-white mb-2">No Items Found</h3>
                    <p className="text-slate-400">Try adjusting your filters or add new items to your wardrobe</p>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredAndSortedItems.map((item, idx) => (
                        <ItemCard key={item.id} item={item} index={idx} />
                    ))}
                </div>
            ) : (
                <div className="space-y-2">
                    {filteredAndSortedItems.map((item, idx) => (
                        <ItemListRow key={item.id} item={item} index={idx} />
                    ))}
                </div>
            )}
        </div>
    );
};

// Item Card Component
const ItemCard: React.FC<{ item: WardrobeItem; index: number }> = ({ item, index }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.02 }}
            className="group relative bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl overflow-hidden hover:border-accent-500/50 transition-all"
        >
            {/* Image Placeholder */}
            <div className="aspect-square bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center relative overflow-hidden">
                <Package className="w-16 h-16 text-slate-700" />
                {item.purchased ? (
                    <div className="absolute top-3 right-3 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        Owned
                    </div>
                ) : (
                    <div className="absolute top-3 right-3 bg-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        Wishlist
                    </div>
                )}
                
                {/* Hover Actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                        <Eye className="w-5 h-5 text-slate-900" />
                    </button>
                    <button className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                        <Edit className="w-5 h-5 text-slate-900" />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white truncate">{item.garment}</h3>
                        <p className="text-sm text-slate-400">{item.size} • {item.color}</p>
                    </div>
                    <div className="flex items-center gap-1 bg-accent-500/20 px-2 py-1 rounded-lg">
                        <Star className="w-3 h-3 text-accent-400" />
                        <span className="text-xs font-bold text-accent-400">{item.fitScore}</span>
                    </div>
                </div>

                {item.brand && (
                    <div className="flex items-center gap-1 text-xs text-slate-500 mb-2">
                        <Tag className="w-3 h-3" />
                        <span>{item.brand}</span>
                    </div>
                )}

                {item.wearCount !== undefined && item.wearCount > 0 && (
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Calendar className="w-3 h-3" />
                        <span>Worn {item.wearCount} times</span>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

// Item List Row Component
const ItemListRow: React.FC<{ item: WardrobeItem; index: number }> = ({ item, index }) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.01 }}
            className="flex items-center gap-4 p-4 bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-xl hover:border-accent-500/50 transition-all"
        >
            {/* Thumbnail */}
            <div className="w-16 h-16 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg flex items-center justify-center flex-shrink-0">
                <Package className="w-8 h-8 text-slate-700" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white truncate">{item.garment}</h3>
                <div className="flex items-center gap-3 text-sm text-slate-400 mt-1">
                    <span>{item.size}</span>
                    <span>•</span>
                    <span>{item.color}</span>
                    {item.category && (
                        <>
                            <span>•</span>
                            <span>{item.category}</span>
                        </>
                    )}
                </div>
            </div>

            {/* Fit Score */}
            <div className="flex items-center gap-1 bg-accent-500/20 px-3 py-1.5 rounded-lg">
                <Star className="w-4 h-4 text-accent-400" />
                <span className="text-sm font-bold text-accent-400">{item.fitScore}</span>
            </div>

            {/* Status */}
            <div>
                {item.purchased ? (
                    <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-lg">
                        <ShoppingCart className="w-4 h-4" />
                        <span className="text-sm font-semibold">Owned</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-1.5 text-pink-400 bg-pink-400/10 px-3 py-1.5 rounded-lg">
                        <Heart className="w-4 h-4" />
                        <span className="text-sm font-semibold">Wishlist</span>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
                <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                    <Eye className="w-4 h-4" />
                </button>
                <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                    <Edit className="w-4 h-4" />
                </button>
                <button className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </motion.div>
    );
};
