import React from 'react';
import { ColorMatchResponse } from '../services/api';
import { motion } from 'framer-motion';
import { Palette, Sparkles } from 'lucide-react';

interface Props { colorAnalysis: ColorMatchResponse; }

const ColorMatchDisplay: React.FC<Props> = ({ colorAnalysis }) => {
    const getScoreColor = (score: number) => {
        if (score > 70) return { bar: 'bg-emerald-500', text: 'text-emerald-400' };
        if (score > 40) return { bar: 'bg-amber-500', text: 'text-amber-400' };
        return { bar: 'bg-rose-500', text: 'text-rose-400' };
    };

    const scoreColors = getScoreColor(colorAnalysis.match_score);

    return (
        <div className="space-y-4">
            {/* Score Section */}
            <div>
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-300">Skin Tone Match</span>
                    <span className={`text-sm font-bold ${scoreColors.text}`}>{colorAnalysis.match_score}/100</span>
                </div>
                <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${colorAnalysis.match_score}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className={`h-full ${scoreColors.bar} rounded-full`}
                    />
                </div>
            </div>

            {/* Primary Color Display */}
            {colorAnalysis.primary_color?.rgb && (
                <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-xl border border-white/5">
                    <div
                        className="w-10 h-10 rounded-lg shadow-lg border border-white/20"
                        style={{ backgroundColor: `rgb(${colorAnalysis.primary_color.rgb.r},${colorAnalysis.primary_color.rgb.g},${colorAnalysis.primary_color.rgb.b})` }}
                    />
                    <div>
                        <p className="text-xs text-slate-400">Primary Color</p>
                        <p className="font-medium text-white capitalize">{colorAnalysis.primary_color.name || 'Detected'}</p>
                    </div>
                </div>
            )}

            {/* Roast Quote */}
            <p className="text-slate-300 text-sm bg-slate-700/30 p-3 rounded-xl border-l-2 border-violet-500 italic">
                "{colorAnalysis.roast}"
            </p>

            {/* Suggested Colors */}
            {colorAnalysis.suggested_colors && colorAnalysis.suggested_colors.length > 0 && (
                <div>
                    <h4 className="text-xs uppercase text-slate-400 font-semibold tracking-wider mb-2 flex items-center gap-1">
                        <Sparkles size={12} className="text-violet-400" />
                        Try Instead:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {colorAnalysis.suggested_colors.map((color: string, idx: number) => (
                            <span
                                key={idx}
                                className="px-3 py-1.5 bg-violet-500/10 border border-violet-500/30 rounded-lg text-xs text-violet-300 font-medium"
                            >
                                {color}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ColorMatchDisplay;
