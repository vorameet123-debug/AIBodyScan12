import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Palette,
    Sparkles,
    TrendingUp,
    Heart,
    Info,
    Plus,
    Check
} from 'lucide-react';
import { WardrobeAPI } from '../../services/wardrobeApi';
import { ColorData } from '../../types/wardrobe';
import toast from 'react-hot-toast';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface ColorPaletteTabProps {
    userId: number;
}

interface ColorInfo {
    name: string;
    hex: string;
    count: number;
    percentage: number;
}

interface ColorHarmony {
    type: string;
    colors: string[];
    description: string;
}

// Extended HSL Color Theory Helper
class Color {
    h: number; // 0-360
    s: number; // 0-100
    l: number; // 0-100

    constructor(hex: string) {
        // Convert hex to HSL
        let r = 0, g = 0, b = 0;
        if (hex.length === 4) {
            r = parseInt("0x" + hex[1] + hex[1]);
            g = parseInt("0x" + hex[2] + hex[2]);
            b = parseInt("0x" + hex[3] + hex[3]);
        } else if (hex.length === 7) {
            r = parseInt("0x" + hex[1] + hex[2]);
            g = parseInt("0x" + hex[3] + hex[4]);
            b = parseInt("0x" + hex[5] + hex[6]);
        }
        r /= 255; g /= 255; b /= 255;
        const cmin = Math.min(r, g, b), cmax = Math.max(r, g, b), delta = cmax - cmin;
        let h = 0, s = 0, l = 0;

        if (delta === 0) h = 0;
        else if (cmax === r) h = ((g - b) / delta) % 6;
        else if (cmax === g) h = (b - r) / delta + 2;
        else h = (r - g) / delta + 4;
        h = Math.round(h * 60);
        if (h < 0) h += 360;

        l = (cmax + cmin) / 2;
        s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
        s = +(s * 100).toFixed(1);
        l = +(l * 100).toFixed(1);

        this.h = h;
        this.s = s;
        this.l = l;
    }

    toHex(): string {
        let s = this.s / 100;
        let l = this.l / 100;
        let c = (1 - Math.abs(2 * l - 1)) * s,
            x = c * (1 - Math.abs(((this.h / 60) % 2) - 1)),
            m = l - c / 2,
            r = 0, g = 0, b = 0;

        if (0 <= this.h && this.h < 60) { r = c; g = x; b = 0; }
        else if (60 <= this.h && this.h < 120) { r = x; g = c; b = 0; }
        else if (120 <= this.h && this.h < 180) { r = 0; g = c; b = x; }
        else if (180 <= this.h && this.h < 240) { r = 0; g = x; b = c; }
        else if (240 <= this.h && this.h < 300) { r = x; g = 0; b = c; }
        else if (300 <= this.h && this.h < 360) { r = c; g = 0; b = x; }
        r = Math.round((r + m) * 255);
        g = Math.round((g + m) * 255);
        b = Math.round((b + m) * 255);

        const toHex = (n: number) => {
            const hex = n.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };
        return '#' + toHex(r) + toHex(g) + toHex(b);
    }

    rotate(degrees: number): Color {
        const newColor = new Color(this.toHex());
        newColor.h = (this.h + degrees) % 360;
        if (newColor.h < 0) newColor.h += 360;
        return newColor;
    }

    // Better complement: rotate 180, tweak saturation/lightness for aesthetics
    complement(): Color {
        const newColor = this.rotate(180);
        // Ensure complement isn't too dark/dull if original is
        if (newColor.s < 20) newColor.s = 30;
        return newColor;
    }

    // Split complement
    splitComplement(): [Color, Color] {
        return [this.rotate(150), this.rotate(210)];
    }

    // Triadic
    triadic(): [Color, Color] {
        return [this.rotate(120), this.rotate(240)];
    }
}


export const ColorPaletteTab: React.FC<ColorPaletteTabProps> = ({ userId }) => {
    const [loading, setLoading] = useState(true);
    const [colorData, setColorData] = useState<ColorData | null>(null);
    const [dominantColors, setDominantColors] = useState<ColorInfo[]>([]);
    const [selectedColor, setSelectedColor] = useState<ColorInfo | null>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        loadColorData();
    }, [userId]);

    const loadColorData = async () => {
        try {
            setLoading(true);
            const response = await WardrobeAPI.getAnalytics(userId, 'all');
            if (response.success) {
                setColorData(response.data.colors as any);
                const colors = transformToColorInfo(response.data.colors);
                setDominantColors(colors);
                if (colors.length > 0) setSelectedColor(colors[0]);
            }
        } catch (error) {
            console.error('Failed to load color data:', error);
            toast.error('Failed to load color palette');
        } finally {
            setLoading(false);
        }
    };

    const transformToColorInfo = (data: any): ColorInfo[] => {
        // Enhanced Color Map with more nuance
        const colorMap: { [key: string]: string } = {
            'black': '#171717', // Richer black
            'white': '#F8FAFC', // Slightly off-white for visibility
            'red': '#EF4444',
            'burgundy': '#7F1D1D',
            'crimson': '#DC2626',
            'blue': '#3B82F6',
            'navy': '#1E3A8A',
            'sky': '#7DD3FC',
            'teal': '#14B8A6',
            'green': '#22C55E',
            'olive': '#65A30D',
            'sage': '#84CC16',
            'yellow': '#FACC15',
            'mustard': '#EAB308',
            'gold': '#CA8A04',
            'orange': '#F97316',
            'rust': '#9A3412',
            'purple': '#A855F7',
            'lavender': '#E9D5FF',
            'plum': '#581C87',
            'pink': '#EC4899',
            'rose': '#F43F5E',
            'brown': '#78350F',
            'tan': '#D4A373',
            'beige': '#F5F5DC',
            'cream': '#FEF3C7',
            'gray': '#6B7280',
            'grey': '#6B7280',
            'charcoal': '#374151',
            'silver': '#E5E7EB',
            'khaki': '#C2B280',
            'unknown': '#94A3B8'
        };

        const sorted = Object.entries(data.distribution)
            .sort(([, a], [, b]) => (b as number) - (a as number))
            .map(([name, count]) => ({
                name,
                hex: colorMap[name.toLowerCase()] || '#94A3B8',
                count: count as number,
                percentage: data.percentages[name] || 0,
            }));

        return sorted;
    };

    const activeColorObj = useMemo(() => {
        return selectedColor ? new Color(selectedColor.hex) : null;
    }, [selectedColor]);

    const colorHarmonies: ColorHarmony[] = useMemo(() => {
        if (!activeColorObj) return [];

        return [
            {
                type: 'Monochromatic',
                colors: [
                    activeColorObj.toHex(),
                    (() => { const c = new Color(activeColorObj.toHex()); c.l = Math.min(95, c.l + 20); return c.toHex(); })(),
                    (() => { const c = new Color(activeColorObj.toHex()); c.l = Math.max(10, c.l - 20); return c.toHex(); })()
                ],
                description: 'Tonal variations for a sleek look'
            },
            {
                type: 'Complementary',
                colors: [activeColorObj.toHex(), activeColorObj.complement().toHex()],
                description: 'High contrast, bold combination'
            },
            {
                type: 'Analogous',
                colors: [
                    activeColorObj.rotate(-30).toHex(),
                    activeColorObj.toHex(),
                    activeColorObj.rotate(30).toHex()
                ],
                description: 'Harmonious adjacent colors'
            },
            {
                type: 'Triadic',
                colors: [
                    activeColorObj.toHex(),
                    activeColorObj.triadic()[0].toHex(),
                    activeColorObj.triadic()[1].toHex()
                ],
                description: 'Vibrant and balanced trio'
            }
        ];
    }, [activeColorObj]);

    // Smart suggestions based on missing complements/triads
    const smartSuggestions = useMemo(() => {
        if (!dominantColors.length || !activeColorObj) return [];

        const existingHexes = new Set(dominantColors.map(c => c.hex));
        const suggestions: string[] = [];

        // Suggest complement if missing
        const comp = activeColorObj.complement().toHex();
        if (!existingHexes.has(comp)) suggestions.push(comp);

        // Suggest triadic partners if missing
        const triads = activeColorObj.triadic();
        triads.forEach(t => {
            if (!existingHexes.has(t.toHex())) suggestions.push(t.toHex());
        });

        // Suggest split complements
        const splits = activeColorObj.splitComplement();
        splits.forEach(s => {
            if (!existingHexes.has(s.toHex())) suggestions.push(s.toHex());
        });

        return [...new Set(suggestions)].slice(0, 6);
    }, [dominantColors, activeColorObj]);

    const onPieEnter = (_: any, index: number) => {
        setActiveIndex(index);
        setSelectedColor(dominantColors[index]);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-2 border-accent-200 border-t-accent-600 animate-spin"></div>
                    <p className="text-sm font-medium text-slate-400">Loading color DNA...</p>
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
                <p className="text-slate-400">Add items to your wardrobe to see your color DNA</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">

            {/* Main Visualizer: Donut Chart & Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Donut Chart */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="lg:col-span-2 bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6 min-h-[400px] relative"
                >
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <Palette className="w-5 h-5 text-accent-400" />
                        Wardrobe Color DNA
                    </h3>

                    <div className="h-[300px] w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    activeIndex={activeIndex}
                                    activeShape={renderActiveShape}
                                    data={dominantColors}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={110}
                                    paddingAngle={5}
                                    dataKey="count"
                                    onMouseEnter={onPieEnter}
                                    stroke="none"
                                >
                                    {dominantColors.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.hex}
                                            stroke={entry.hex === '#171717' || entry.hex === '#000000' ? '#333' : 'none'}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>

                        {/* Center Text */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                            <div className="text-3xl font-bold text-white">
                                {dominantColors.reduce((acc, curr) => acc + curr.count, 0)}
                            </div>
                            <div className="text-xs text-slate-400 uppercase tracking-wider">Items</div>
                        </div>
                    </div>
                </motion.div>

                {/* Selected Color Psychology */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={selectedColor?.name || 'default'}
                    className="bg-gradient-to-br from-slate-900 to-slate-800 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 flex flex-col justify-center"
                >
                    {selectedColor ? (
                        <>
                            <div className="flex items-center gap-4 mb-6">
                                <div
                                    className="w-16 h-16 rounded-2xl shadow-lg ring-2 ring-white/10"
                                    style={{ backgroundColor: selectedColor.hex }}
                                />
                                <div>
                                    <h2 className="text-2xl font-bold text-white capitalize">{selectedColor.name}</h2>
                                    <p className="text-accent-400 font-mono text-sm">{selectedColor.hex}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-slate-800/50 rounded-xl p-4">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Psychology</h4>
                                    <p className="text-sm text-slate-300 leading-relaxed">
                                        {getColorPsychology(selectedColor.name)}
                                    </p>
                                </div>

                                <div className="flex justify-between items-center text-sm text-slate-400 bg-slate-800/30 rounded-lg p-3">
                                    <span>Prevalence</span>
                                    <span className="text-white font-bold">{selectedColor.percentage.toFixed(1)}%</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center text-slate-500">
                            <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>Hover over existing colors to see details</p>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Color Harmonies - Clean & Minimal */}
            <div className="mt-10">
                <div className="mb-6">
                    <h3 className="text-xl font-bold text-white mb-2">Color Combinations</h3>
                    <p className="text-sm text-slate-400">
                        Expert pairings based on <span className="text-white font-medium">{selectedColor?.name || 'your palette'}</span>
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {colorHarmonies.map((harmony, idx) => (
                        <motion.div
                            key={harmony.type}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.08, duration: 0.4 }}
                            className="group bg-slate-900/40 backdrop-blur-sm border border-slate-800/60 rounded-2xl p-6 hover:border-slate-700 hover:bg-slate-900/60 transition-all duration-300"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-base font-semibold text-white">{harmony.type}</h4>
                                <div className="text-xs text-slate-500 font-medium px-2 py-1 bg-slate-800/50 rounded">
                                    {harmony.colors.length} colors
                                </div>
                            </div>

                            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                                {harmony.description}
                            </p>

                            {/* Clean color swatches */}
                            <div className="flex gap-3">
                                {harmony.colors.map((color, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: idx * 0.08 + i * 0.05 }}
                                        whileHover={{ scale: 1.1, y: -4 }}
                                        className="relative flex-1"
                                    >
                                        <div
                                            className="aspect-square rounded-xl shadow-lg ring-1 ring-white/10 group-hover:ring-white/20 transition-all"
                                            style={{ backgroundColor: color }}
                                        />
                                        <div className="absolute -bottom-5 left-0 right-0 text-center">
                                            <span className="text-[9px] text-slate-500 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                                                {color}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* All Colors Grid - Clean Display */}
            <div className="mt-10">
                <div className="mb-6">
                    <h3 className="text-xl font-bold text-white mb-2">Your Wardrobe Colors</h3>
                    <p className="text-sm text-slate-400">
                        {dominantColors.length} distinct colors across your items
                    </p>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                    {dominantColors.map((color, idx) => (
                        <motion.button
                            key={color.name}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: idx * 0.02 }}
                            whileHover={{ scale: 1.05 }}
                            onClick={() => setSelectedColor(color)}
                            className={`group relative aspect-square rounded-xl overflow-hidden ${selectedColor?.name === color.name
                                    ? 'ring-2 ring-accent-500 ring-offset-2 ring-offset-slate-950'
                                    : 'ring-1 ring-slate-800 hover:ring-slate-700'
                                } transition-all`}
                        >
                            <div
                                className="absolute inset-0"
                                style={{ backgroundColor: color.hex }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="absolute bottom-1 left-0 right-0 text-center px-1">
                                    <div className="text-[10px] font-bold text-white leading-tight capitalize truncate">
                                        {color.name}
                                    </div>
                                    <div className="text-[9px] text-slate-300">
                                        {color.percentage.toFixed(0)}%
                                    </div>
                                </div>
                            </div>
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Smart Additions */}
            {smartSuggestions.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-gradient-to-r from-indigo-900/20 to-purple-900/20  border border-indigo-500/20 rounded-2xl p-6 mt-8"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-indigo-500/20 rounded-lg">
                            <Plus className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Recommended Additions</h3>
                            <p className="text-sm text-indigo-200/70">Colors that would complete your palette</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        {smartSuggestions.map((hex, i) => (
                            <div key={i} className="group flex flex-col items-center gap-2">
                                <div
                                    className="w-12 h-12 rounded-full ring-2 ring-white/10 shadow-lg group-hover:scale-110 transition-transform"
                                    style={{ backgroundColor: hex }}
                                ></div>
                                <span className="text-[10px] text-slate-400 font-mono opacity-0 group-hover:opacity-100 transition-opacity uppercase">{hex}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

        </div>
    );
};

// --- Recharts Helper ---
const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    return (
        <g>
            <path d={props.payload.path} fill={fill} /> {/* This usually comes from framework, doing simpler manual ring */}
            <path
                d={`
          M ${cx},${cy}
          L ${cx + (outerRadius + 6) * Math.cos(-startAngle * (Math.PI / 180))}, ${cy + (outerRadius + 6) * Math.sin(-startAngle * (Math.PI / 180))}
          A ${outerRadius + 6},${outerRadius + 6},0,${endAngle - startAngle > 180 ? 1 : 0},0,${cx + (outerRadius + 6) * Math.cos(-endAngle * (Math.PI / 180))},${cy + (outerRadius + 6) * Math.sin(-endAngle * (Math.PI / 180))}
          Z
        `} // Simplified sector logic for active state (Recharts handles path data usually)
            />
            {/* Actually, easier to just accept default shape prop and add stroke */}
            <path d={props.d} stroke={fill} strokeWidth={6} fill="none" opacity={0.3} />
            <path d={props.d} fill={fill} />
        </g>
    );
};

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 p-3 rounded-xl shadow-xl">
                <p className="text-white font-bold capitalize mb-1">{data.name}</p>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: data.hex }}></span>
                    <span>{(data.percentage).toFixed(1)}% of wardrobe</span>
                </div>
            </div>
        );
    }
    return null;
};

// Helper for strings
function getColorPsychology(color: string): string {
    const map: Record<string, string> = {
        'black': 'Power, elegance, and formality. A staple for sleek, modern looks.',
        'white': 'Purity, cleanliness, and neutrality. Offers a fresh, blank canvas.',
        'gray': 'Intellect and compromise. The perfect bridge between black and white.',
        'navy': 'Trust, responsibility, and authority. A softer alternative to black.',
        'blue': 'Calmness and stability. The world\'s favorite color for good reason.',
        'red': 'Passion, energy, and action. Draws attention and stimulates the senses.',
        'yellow': 'Optimism and happiness. Captures the warmth of sunlight.',
        'green': 'Nature, growth, and harmony. Eases the mind and refreshes the eye.',
        'pink': 'Compassion, playfulness, and love. Softens a look instantly.',
        'purple': 'Luxury, creativity, and magic. Historically the color of royalty.',
        'orange': 'Creativity and enthusiasm. Combines red\'s energy with yellow\'s joy.',
        'brown': 'Stability and reliability. Grounding earth tones.',
        'beige': 'Simplicity and warmth. A versatile, comforting neutral.',
    };

    // Fuzzy match
    const lower = color.toLowerCase();
    for (const key of Object.keys(map)) {
        if (lower.includes(key)) return map[key];
    }
    return 'A unique choice that expresses your individual style.';
}
