import React from 'react';
import { FitMetersResponse, FitMeter } from '../services/api';
import { motion } from 'framer-motion';

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
            case 'red': return 'bg-red-500';
            case 'blue': return 'bg-blue-500';
            default: return 'bg-gray-400';
        }
    };

    const getStatusText = (status: string) => {
        return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    return (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 h-full">
            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                <span className="bg-gray-100 p-2 rounded-lg mr-3">📏</span>
                Fit Meters
            </h3>

            <div className="space-y-3">
                {sortedMeters.map(([key, meter]) => (
                    <div key={key} className="relative">
                        {/* Header */}
                        <div className="flex justify-between items-end mb-2">
                            <span className="font-semibold text-gray-700 capitalize">{key.replace('_', ' ')}</span>
                            <div className="text-right">
                                <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider
                  ${meter.zone === 'green' ? 'bg-emerald-100 text-emerald-700' :
                                        meter.zone === 'red' ? 'bg-red-100 text-red-700' :
                                            'bg-blue-100 text-blue-700'}`}>
                                    {getStatusText(meter.status)}
                                </span>
                            </div>
                        </div>

                        {/* Progress Bar Container */}
                        <div className="h-4 bg-gray-100 rounded-full overflow-hidden relative">
                            {/* Zone Markers (Background) */}
                            <div className="absolute inset-0 flex opacity-20">
                                <div className="w-[30%] bg-red-500 h-full"></div> {/* Tight */}
                                <div className="w-[40%] bg-emerald-500 h-full"></div> {/* Perfect */}
                                <div className="w-[30%] bg-blue-500 h-full"></div> {/* Loose */}
                            </div>

                            {/* Indicator */}
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${meter.score}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className={`h-full rounded-full ${getZoneColor(meter.zone)} relative z-10`}
                            />
                        </div>

                        {/* Measurements Detail */}
                        <div className="flex justify-between text-xs text-gray-500 mt-2 font-mono">
                            <span>You: {meter.user_measurement}cm</span>
                            <span>Ease: {meter.ease > 0 ? '+' : ''}{meter.ease}cm</span>
                            <span>Item: {meter.garment_measurement}cm</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-400 text-center">
                Fit Score: {fitMeters.overall_fit_score}/100
            </div>
        </div>
    );
};

export default FitMetersDisplay;
