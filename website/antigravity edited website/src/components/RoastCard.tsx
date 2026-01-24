import React from 'react';
import { RoastResponse } from '../services/api';
import { motion } from 'framer-motion';

interface RoastCardProps {
    roast: RoastResponse;
    garmentType?: string;
}

const RoastCard: React.FC<RoastCardProps> = ({ roast, garmentType = 'garment' }) => {
    const getStampStyles = (color: string) => {
        switch (color) {
            case 'green': return 'border-green-600 text-green-600 rotate-[-12deg]';
            case 'red': return 'border-red-600 text-red-600 rotate-[-12deg]';
            case 'blue': return 'border-blue-600 text-blue-600 rotate-[12deg]';
            default: return 'border-gray-600 text-gray-600';
        }
    };

    const getContainerStyles = (color: string) => {
        switch (color) {
            case 'green': return 'from-emerald-50 to-green-50 border-emerald-200';
            case 'red': return 'from-red-50 to-orange-50 border-red-200';
            case 'blue': return 'from-blue-50 to-cyan-50 border-blue-200';
            default: return 'from-gray-50 to-slate-50 border-gray-200';
        }
    };

    return (
        <div className={`h-full relative overflow-hidden rounded-2xl border-2 bg-gradient-to-br p-4 pt-8 ${getContainerStyles(roast.stamp_color)}`}>
            {/* Decorative quotes */}
            <span className="absolute top-4 left-6 text-6xl font-serif opacity-10 leading-none">“</span>

            <div className="relative z-10">
                <h3 className="font-bold text-gray-900 mb-3 uppercase tracking-wider text-sm opacity-60">
                    AI Verdict on {garmentType}
                </h3>

                <p className="text-lg font-medium text-gray-800 leading-relaxed italic mb-6">
                    "{roast.fit_roast}"
                </p>

                {/* Animated Stamp */}
                <motion.div
                    initial={{ scale: 2, opacity: 0, rotate: 0 }}
                    animate={{ scale: 1, opacity: 1, rotate: roast.stamp_color === 'blue' ? 12 : -12 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.5 }}
                    className="flex justify-end mt-auto"
                >
                    <div className={`border-4 rounded-lg px-4 py-2 font-black text-xl uppercase tracking-widest opacity-80 mix-blend-multiply transition-transform hover:scale-105 ${getStampStyles(roast.stamp_color).replace(/rotate-\[.*?\]/, '')}`}>
                        {roast.verdict_stamp}
                    </div>
                </motion.div>
            </div>

            <span className="absolute bottom-4 right-6 text-6xl font-serif opacity-10 leading-none rotate-180">”</span>
        </div>
    );
};

export default RoastCard;
