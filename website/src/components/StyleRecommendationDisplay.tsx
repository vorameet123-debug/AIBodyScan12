import React from 'react';
import { StyleRecommendationResponse } from '../services/api';
import { motion } from 'framer-motion';
import { Sparkles, Lightbulb } from 'lucide-react';

interface Props { styleRecs: StyleRecommendationResponse; }

const StyleRecommendationDisplay: React.FC<Props> = ({ styleRecs }) => {
    const getScoreColor = (score: number) => {
        if (score >= 70) return { bar: 'bg-violet-500', text: 'text-violet-400' };
        if (score >= 50) return { bar: 'bg-amber-500', text: 'text-amber-400' };
        return { bar: 'bg-rose-500', text: 'text-rose-400' };
    };

    const scoreColors = getScoreColor(styleRecs.style_score);

    return (
        <div className="space-y-4">
            {/* Score Section */}
            <div>
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-300">Style Score</span>
                    <span className={`text-sm font-bold ${scoreColors.text}`}>{styleRecs.style_score}/100</span>
                </div>
                <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${styleRecs.style_score}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className={`h-full ${scoreColors.bar} rounded-full`}
                    />
                </div>
            </div>

            {/* Outfit Ideas */}
            <div>
                <h4 className="text-xs uppercase text-slate-400 font-semibold tracking-wider mb-3 flex items-center gap-2">
                    <Lightbulb size={12} className="text-amber-400" />
                    Outfit Ideas
                </h4>
                <ul className="space-y-2">
                    {styleRecs.outfit_suggestions.map((suggestion: string, idx: number) => (
                        <motion.li
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="text-sm text-slate-200 bg-slate-700/30 p-3 rounded-xl border border-white/5 flex items-start hover:border-violet-500/30 transition-colors"
                        >
                            <span className="mr-2 text-violet-400">•</span>
                            {suggestion}
                        </motion.li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default StyleRecommendationDisplay;
