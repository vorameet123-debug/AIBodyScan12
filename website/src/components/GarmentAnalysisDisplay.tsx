import React from 'react';
import { GarmentAnalysis } from '../services/api';
import { Shirt, Tag, Palette, Scissors, Star, Briefcase } from 'lucide-react';

interface Props { analysis: GarmentAnalysis; }

const GarmentAnalysisDisplay: React.FC<Props> = ({ analysis }) => {
    const items = [
        { icon: Tag, label: 'Type', value: analysis.garment_type },
        { icon: Palette, label: 'Material', value: analysis.material },
        { icon: Star, label: 'Style', value: analysis.style },
        { icon: Scissors, label: 'Pattern', value: analysis.pattern },
        { icon: Shirt, label: 'Fit Type', value: analysis.fit_type },
        { icon: Briefcase, label: 'Formality', value: `${analysis.formality_level}/10` },
    ];

    return (
        <div className="grid grid-cols-2 gap-3">
            {items.map((item, index) => (
                <div
                    key={item.label}
                    className="p-3 bg-slate-700/30 rounded-xl border border-white/5 hover:border-violet-500/30 transition-colors"
                >
                    <div className="flex items-center gap-2 mb-1">
                        <item.icon size={12} className="text-violet-400" />
                        <span className="text-xs text-slate-400">{item.label}</span>
                    </div>
                    <div className="font-semibold capitalize text-white text-sm">{item.value}</div>
                </div>
            ))}
        </div>
    );
};

export default GarmentAnalysisDisplay;
