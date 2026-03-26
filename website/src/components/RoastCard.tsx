import React from 'react';
import { RoastResponse } from '../services/api';
import { motion } from 'framer-motion';
import { Quote, Stamp } from 'lucide-react';

interface RoastCardProps {
    roast: RoastResponse;
    garmentType?: string;
}

const RoastCard: React.FC<RoastCardProps> = ({ roast, garmentType = 'garment' }) => {
    const getStampStyles = (color: string) => {
        switch (color) {
            case 'green': return {
                border: 'border-emerald-400',
                text: 'text-emerald-400',
                bg: 'bg-emerald-500/10',
                glow: 'shadow-emerald-500/20'
            };
            case 'red': return {
                border: 'border-rose-400',
                text: 'text-rose-400',
                bg: 'bg-rose-500/10',
                glow: 'shadow-rose-500/20'
            };
            case 'blue': return {
                border: 'border-blue-400',
                text: 'text-blue-400',
                bg: 'bg-blue-500/10',
                glow: 'shadow-blue-500/20'
            };
            default: return {
                border: 'border-slate-400',
                text: 'text-slate-400',
                bg: 'bg-slate-500/10',
                glow: 'shadow-slate-500/20'
            };
        }
    };

    const getContainerGradient = (color: string) => {
        switch (color) {
            case 'green': return 'from-emerald-500/10 via-transparent to-emerald-500/5';
            case 'red': return 'from-rose-500/10 via-transparent to-rose-500/5';
            case 'blue': return 'from-blue-500/10 via-transparent to-blue-500/5';
            default: return 'from-slate-500/10 via-transparent to-slate-500/5';
        }
    };

    const stampStyles = getStampStyles(roast.stamp_color);

    return (
        <div className={`relative overflow-hidden rounded-2xl border border-white/10 p-6 bg-gradient-to-br ${getContainerGradient(roast.stamp_color)} backdrop-blur-sm`}>
            {/* Decorative quote icon */}
            <div className="absolute top-4 left-4 opacity-10">
                <Quote size={48} className="text-white" />
            </div>

            <div className="relative z-10">
                <h3 className="font-bold text-slate-400 mb-4 uppercase tracking-wider text-xs">
                    AI Verdict on {garmentType}
                </h3>

                <p className="text-xl font-medium text-white leading-relaxed mb-6">
                    "{roast.fit_roast}"
                </p>

                {/* Animated Stamp */}
                <motion.div
                    initial={{ scale: 2, opacity: 0, rotate: 0 }}
                    animate={{ scale: 1, opacity: 1, rotate: roast.stamp_color === 'blue' ? 12 : -12 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.5 }}
                    className="flex justify-end"
                >
                    <div className={`border-3 ${stampStyles.border} ${stampStyles.text} ${stampStyles.bg} rounded-lg px-5 py-2 font-black text-xl uppercase tracking-widest shadow-lg ${stampStyles.glow}`}>
                        {roast.verdict_stamp}
                    </div>
                </motion.div>
            </div>

            {/* Bottom quote icon */}
            <div className="absolute bottom-4 right-4 opacity-10 rotate-180">
                <Quote size={48} className="text-white" />
            </div>
        </div>
    );
};

export default RoastCard;
