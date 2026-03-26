import React from 'react';
import { OccasionAnalysisResponse } from '../services/api';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Calendar, Sparkles } from 'lucide-react';

interface Props { occasionAnalysis: OccasionAnalysisResponse; }

const OccasionAnalysisDisplay: React.FC<Props> = ({ occasionAnalysis }) => {
    const isAppropriate = occasionAnalysis.is_appropriate;

    return (
        <div className="space-y-4">
            {/* Status Badge */}
            <div className="flex items-center gap-3">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${isAppropriate
                            ? 'bg-emerald-500/20 border border-emerald-500/30'
                            : 'bg-amber-500/20 border border-amber-500/30'
                        }`}
                >
                    {isAppropriate ? (
                        <CheckCircle className="text-emerald-400" size={24} />
                    ) : (
                        <AlertCircle className="text-amber-400" size={24} />
                    )}
                </motion.div>
                <div>
                    <div className={`font-semibold text-base ${isAppropriate ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {isAppropriate ? 'Appropriate' : 'Questionable Choice'}
                    </div>
                    <div className="text-sm text-slate-400">
                        Match Score: <span className="text-white font-medium">{occasionAnalysis.occasion_match_score}/100</span>
                    </div>
                </div>
            </div>

            {/* Recommendation Quote */}
            <p className="text-sm text-slate-300 bg-slate-700/30 p-4 rounded-xl border-l-2 border-violet-500 italic">
                "{occasionAnalysis.recommendation}"
            </p>

            {/* Alternative Occasions */}
            {occasionAnalysis.alternative_occasions && occasionAnalysis.alternative_occasions.length > 0 && (
                <div>
                    <h4 className="text-xs uppercase text-slate-400 font-semibold tracking-wider mb-2 flex items-center gap-1">
                        <Sparkles size={12} className="text-cyan-400" />
                        Better For:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {occasionAnalysis.alternative_occasions.map((occ: string, idx: number) => (
                            <motion.span
                                key={idx}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                className="px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-xs text-cyan-300 font-medium capitalize"
                            >
                                {occ}
                            </motion.span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default OccasionAnalysisDisplay;
