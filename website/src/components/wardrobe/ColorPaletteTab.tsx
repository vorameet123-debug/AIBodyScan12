import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Palette,
    Sparkles,
    TrendingUp,
    Heart,
    AlertCircle,
    Check,
    Plus,
    Info
} from 'lucide-react';
import { WardrobeAPI } from '../../services/wardrobeApi';
import toast from 'react-hot-toast';

interface ColorPaletteTabProps {
    userId: number;
}

interface ColorInfo {
    name: string;
    hex: string;
    count: number;
    percentage: number;
    items: string[];
}

interface ColorHarmony {
    type: string;
    colors: string[];
    description: string;
}

export const ColorPaletteTab: React.FC<ColorPaletteTabProps> = ({ userId }) => {
    const [loading, setLoading] = useState(true);
    const [colorData, setColorData] = useState<any>(null);
    const [dominantColors, setDominantColors] = useState<ColorInfo[]>([]);
    const [selectedColor, setSelectedColor] = useState<ColorInfo | null>(null);

    useEffect(() => {
        loadColorData();
    }, [userId]);

    const loadColorData = async () => {
        try {
            setLoading(true);
            const response = await WardrobeAPI.getAnalytics(userId, 'all');
            if (response.success) {
                setColorData(response.data.colors);
                const colors = transformToColorInfo(response.data.colors);
                setDominantColors(colors);
            }
        } catch (error) {
            console.error('Failed to load color data:', error);
            toast.error('Failed to load color palette');
        } finally {
            setLoading(false);
        }
    };

    const transformToColorInfo = (data: any): ColorInfo[] => {
        const colorMap: { [key: string]: string } = {
            'black': '#000000',
            'white': '#FFFFFF',
            'red': '#EF4444',
            'blue': '#3B82F6',
            'green': '#10B981',
            'yellow': '#F59E0B',
            'orange': '#F97316',
            'purple': '#8B5CF6',
            'pink': '#EC4899',
            'brown': '#92400E',
            'gray': '#6B7280',
            'grey': '#6B7280',
            'beige': '#D4A574',
            'navy': '#1E3A8A',
            'khaki': '#C3B091',
            'olive': '#84CC16',
            'maroon': '#7F1D1D',
            'teal': '#14B8A6',
            'unknown': '#9CA3AF'
        };

        return Object.entries(data.distribution).map(([name, count]) => ({
            name,
            hex: colorMap[name.toLowerCase()] || '#9CA3AF',
            count: count as number,
            percentage: data.percentages[name] || 0,
            items: [] // Would be populated from actual item data
        }));
    };

    const colorHarmonies: ColorHarmony[] = [
        {
            type: 'Monochromatic',
            colors: dominantColors.length > 0 ? [dominantColors[0].hex] : [],
            description: 'Different shades of your dominant color'
        },
        {
            type: 'Complementary',
            colors: dominantColors.length > 0 ? [dominantColors[0].hex, getComplementaryColor(dominantColors[0].hex)] : [],
            description: 'Opposite colors on the color wheel'
        },
        {
            type: 'Analogous',
            colors: dominantColors.length > 0 ? [dominantColors[0].hex, getAnalogousColors(dominantColors[0].hex)[0], getAnalogousColors(dominantColors[0].hex)[1]] : [],
            description: 'Colors adjacent on the color wheel'
        }
    ];

    const seasonalRecommendations = [
        {
            season: 'Spring',
            colors: ['#F472B6', '#A78BFA', '#60A5FA', '#34D399'],
            description: 'Soft pastels and fresh colors'
        },
        {
            season: 'Summer',
            colors: ['#FBBF24', '#FB923C', '#14B8A6', '#3B82F6'],
            description: 'Bright and vibrant tones'
        },
        {
            season: 'Fall',
            colors: ['#92400E', '#B45309', '#A16207', '#713F12'],
            description: 'Warm earth tones'
        },
        {
            season: 'Winter',
            colors: ['#1E3A8A', '#6B7280', '#000000', '#FFFFFF'],
            description: 'Deep and cool colors'
        }
    ];

    const missingColors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899']
        .filter(hex => !dominantColors.some(c => c.hex === hex));

    const colorDiversityScore = Math.min((dominantColors.length / 12) * 100, 100);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-2 border-accent-200 border-t-accent-600 animate-spin"></div>
                    <p className="text-sm font-medium text-slate-400">Loading color palette...</p>
                </div>
            </div>
        );
    }

    if (!colorData || dominantColors.length === 0) {
        return (
            <div className="bg-slate-900/50 backdrop-blur-xl border-2 border-dashed border-slate-700 rounded-2xl p-10 text-center">
                <div className="w-14 h-14 bg-accent-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Palette className="w-7 h-7 text-accent-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">No Color Data Available</h3>
                <p className="text-slate-400">Add items to your wardrobe to see your color palette</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Color Diversity Score */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-accent-500/10 to-purple-500/10 backdrop-blur-xl border border-accent-500/30 rounded-2xl p-6"
            >
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
                            <Sparkles className="w-5 h-5 text-accent-400" />
                            Color Diversity Score
                        </h3>
                        <p className="text-sm text-slate-400">
                            Your wardrobe has {dominantColors.length} distinct colors
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-bold text-white">{Math.round(colorDiversityScore)}</div>
                        <div className="text-xs text-slate-400">out of 100</div>
                    </div>
                </div>
                
                <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${colorDiversityScore}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-accent-500 to-purple-500 rounded-full"
                    />
                </div>
            </motion.div>

            {/* Dominant Colors */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6"
            >
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Palette className="w-5 h-5 text-accent-400" />
                    Your Color Palette
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                    {dominantColors.map((color, idx) => (
                        <motion.div
                            key={color.name}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            onClick={() => setSelectedColor(color)}
                            className="cursor-pointer group"
                        >
                            <div className="relative aspect-square rounded-2xl overflow-hidden mb-2 ring-2 ring-slate-700 group-hover:ring-accent-500 transition-all">
                                <div
                                    className="w-full h-full"
                                    style={{
                                        backgroundColor: color.hex,
                                        border: color.hex === '#FFFFFF' ? '1px solid #334155' : 'none'
                                    }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="absolute bottom-2 left-2 right-2">
                                        <div className="text-xs font-bold text-white mb-0.5">{color.count} items</div>
                                        <div className="text-[10px] text-slate-300">{color.percentage.toFixed(1)}%</div>
                                    </div>
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-sm font-semibold text-white capitalize">{color.name}</div>
                                <div className="text-xs text-slate-500 font-mono">{color.hex}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Color Harmonies */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6"
            >
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-accent-400" />
                    Color Harmony Suggestions
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {colorHarmonies.map((harmony, idx) => (
                        <div
                            key={harmony.type}
                            className="bg-slate-800/50 rounded-xl p-4 border border-slate-700"
                        >
                            <h4 className="font-semibold text-white mb-2">{harmony.type}</h4>
                            <p className="text-xs text-slate-400 mb-3">{harmony.description}</p>
                            <div className="flex gap-2">
                                {harmony.colors.map((color, i) => (
                                    <div
                                        key={i}
                                        className="w-12 h-12 rounded-lg ring-2 ring-slate-700"
                                        style={{
                                            backgroundColor: color,
                                            border: color === '#FFFFFF' ? '1px solid #334155' : 'none'
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Seasonal Recommendations */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6"
            >
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-accent-400" />
                    Seasonal Color Palettes
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {seasonalRecommendations.map((season) => (
                        <div
                            key={season.season}
                            className="bg-slate-800/50 rounded-xl p-4 border border-slate-700"
                        >
                            <h4 className="font-semibold text-white mb-2">{season.season}</h4>
                            <p className="text-xs text-slate-400 mb-3">{season.description}</p>
                            <div className="grid grid-cols-4 gap-2">
                                {season.colors.map((color, i) => (
                                    <div
                                        key={i}
                                        className="aspect-square rounded-lg ring-2 ring-slate-700"
                                        style={{
                                            backgroundColor: color,
                                            border: color === '#FFFFFF' ? '1px solid #334155' : 'none'
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Missing Colors / Suggestions */}
            {missingColors.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6"
                >
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Plus className="w-5 h-5 text-accent-400" />
                        Colors to Consider Adding
                    </h3>
                    <p className="text-sm text-slate-400 mb-4">
                        These colors would complement your existing palette and increase versatility
                    </p>

                    <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                        {missingColors.slice(0, 6).map((color, idx) => (
                            <motion.div
                                key={color}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.4 + idx * 0.05 }}
                                className="group cursor-pointer"
                            >
                                <div className="relative aspect-square rounded-xl overflow-hidden ring-2 ring-slate-700 group-hover:ring-accent-500 transition-all">
                                    <div
                                        className="w-full h-full"
                                        style={{
                                            backgroundColor: color,
                                            border: color === '#FFFFFF' ? '1px solid #334155' : 'none'
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Plus className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Color Psychology Insights */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-6"
            >
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Info className="w-5 h-5 text-blue-400" />
                    Color Psychology Insights
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-white">Dominant Color: {colorData.dominant_color || 'None'}</h4>
                        <p className="text-sm text-slate-400">
                            {getColorPsychology(colorData.dominant_color)}
                        </p>
                    </div>
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-white">Recommendations</h4>
                        <ul className="space-y-2 text-sm text-slate-400">
                            <li className="flex items-start gap-2">
                                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                                <span>Balance with neutrals for versatility</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                                <span>Add complementary colors for visual interest</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                                <span>Consider seasonal variations</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

// Helper functions
function getComplementaryColor(hex: string): string {
    // Simple complementary color calculation (opposite on color wheel)
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    
    const compR = 255 - r;
    const compG = 255 - g;
    const compB = 255 - b;
    
    return `#${compR.toString(16).padStart(2, '0')}${compG.toString(16).padStart(2, '0')}${compB.toString(16).padStart(2, '0')}`;
}

function getAnalogousColors(hex: string): string[] {
    // Simplified analogous colors (±30° on color wheel)
    return [hex, hex, hex]; // Placeholder
}

function getColorPsychology(color: string | null): string {
    const psychology: { [key: string]: string } = {
        'black': 'Sophisticated and elegant. Black conveys power, luxury, and formality.',
        'white': 'Clean and pure. White represents simplicity, freshness, and minimalism.',
        'blue': 'Calm and trustworthy. Blue evokes feelings of tranquility and reliability.',
        'red': 'Bold and energetic. Red symbolizes passion, confidence, and attention.',
        'green': 'Natural and balanced. Green represents growth, harmony, and stability.',
        'yellow': 'Cheerful and optimistic. Yellow conveys happiness, creativity, and warmth.',
        'purple': 'Creative and luxurious. Purple suggests royalty, creativity, and wisdom.',
        'pink': 'Playful and romantic. Pink represents compassion, femininity, and gentleness.',
        'brown': 'Reliable and grounded. Brown conveys stability, comfort, and earthiness.',
        'gray': 'Neutral and balanced. Gray represents sophistication, maturity, and timelessness.'
    };
    
    return psychology[color?.toLowerCase() || ''] || 'Your color palette reflects your unique style preferences.';
}
