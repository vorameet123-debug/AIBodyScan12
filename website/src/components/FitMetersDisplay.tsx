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
        // If both in priority list, sort by index
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        // If valid meter vs unknown, valid first
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        // Alphabetical otherwise
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

    const getStatusText = (status: string) => {
        return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    return (
        <div className="bg-white rounded-2xl p-5 shadow-bento border border-slate-200/60 h-full">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                    <Ruler className="text-indigo-600" size={16} />
                </div>
                Fit Meters
            </h3>

            <div className="space-y-4">
                {sortedMeters.map(([key, meter]) => (
                    <div key={key}>
                        {/* Header */}
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-slate-700 capitalize text-sm">{key.replace('_', ' ')}</span>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full
                  ${meter.zone === 'green' ? 'bg-emerald-50 text-emerald-700' :
                                        meter.zone === 'red' ? 'bg-rose-50 text-rose-700' :
                                            'bg-blue-50 text-blue-700'}`}>
                                    {getStatusText(meter.status)}
                            </span>
                        </div>

                        {/* Progress Bar Container */}
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden relative">
                            {/* Zone Markers (Background) */}
                            <div className="absolute inset-0 flex opacity-20">
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
                            <span>Ease: {meter.ease > 0 ? '+' : ''}{meter.ease}cm</span>
                            <span>Item: {meter.garment_measurement}cm</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 text-center font-medium">
                Fit Score: {fitMeters.overall_fit_score}/100
            </div>
        </div>
    );
};

export default FitMetersDisplay;
