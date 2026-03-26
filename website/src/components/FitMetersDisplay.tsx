import React from 'react';
import { FitMetersResponse, FitMeter } from '../services/api';
import { motion } from 'framer-motion';
import { Ruler } from 'lucide-react';

interface FitMetersDisplayProps {
    fitMeters: FitMetersResponse;
}

const FitMetersDisplay: React.FC<FitMetersDisplayProps> = ({ fitMeters }) => {
    // Sort meters to show chest, waist, hip first
    const priorityOrder = ['chest', 'waist', 'hip', 'shoulder', 'length', 'sleeve_length', 'inseam'];

    const sortedMeters = Object.entries(fitMeters.fit_meters).sort((a, b) => {
        const idxA = priorityOrder.indexOf(a[0]);
        const idxB = priorityOrder.indexOf(b[0]);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return a[0].localeCompare(b[0]);
    });

    const getZoneColor = (zone: string) => {
        switch (zone) {
            case 'green': return 'bg-emerald-500';
            case 'red': return 'bg-rose-500';
            case 'blue': return 'bg-blue-500';
            default: return 'bg-slate-400';
        }
    };

    const getStatusBadge = (zone: string, status: string) => {
        const statusText = status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        switch (zone) {
            case 'green': return { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' };
            case 'red': return { bg: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/30' };
            case 'blue': return { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' };
            default: return { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/30' };
        }
    };

    const getStatusText = (status: string) => {
        return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    return (
        <div className="space-y-4">
            {sortedMeters.map(([key, meter], index) => {
                const badge = getStatusBadge(meter.zone, meter.status);
                return (
                    <motion.div
                        key={key}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-white capitalize text-sm">{key.replace('_', ' ')}</span>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}>
                                {getStatusText(meter.status)}
                            </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden relative">
                            {/* Zone Markers */}
                            <div className="absolute inset-0 flex opacity-30">
                                <div className="w-[30%] bg-rose-500 h-full"></div>
                                <div className="w-[40%] bg-emerald-500 h-full"></div>
                                <div className="w-[30%] bg-blue-500 h-full"></div>
                            </div>

                            {/* Indicator */}
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${meter.score}%` }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className={`h-full rounded-full ${getZoneColor(meter.zone)} relative z-10`}
                            />
                        </div>

                        {/* Measurements Detail */}
                        <div className="flex justify-between text-xs text-slate-400 mt-1.5 font-mono">
                            <span>You: {meter.user_measurement}cm</span>
                            <span className={meter.ease > 0 ? 'text-emerald-400' : meter.ease < 0 ? 'text-rose-400' : 'text-slate-400'}>
                                Ease: {meter.ease > 0 ? '+' : ''}{meter.ease}cm
                            </span>
                            <span>Item: {meter.garment_measurement}cm</span>
                        </div>
                    </motion.div>
                );
            })}

            <div className="mt-4 pt-3 border-t border-white/10 text-sm text-slate-300 text-center font-medium">
                Overall Fit Score: <span className="text-white font-bold">{fitMeters.overall_fit_score}/100</span>
            </div>
        </div>
    );
};

export default FitMetersDisplay;
