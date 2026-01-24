import React from 'react';
import { GarmentAnalysis } from '../services/api';
import { Shirt } from 'lucide-react';

interface Props { analysis: GarmentAnalysis; }

const GarmentAnalysisDisplay: React.FC<Props> = ({ analysis }) => (
    <div className="bg-white p-5 rounded-2xl shadow-bento border border-slate-200/60 h-full">
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                <Shirt className="text-slate-600" size={16} />
            </div>
            Garment Details
        </h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-xs text-slate-500 mb-1">Type</div>
                <div className="font-semibold capitalize text-slate-900">{analysis.garment_type}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-xs text-slate-500 mb-1">Material</div>
                <div className="font-semibold capitalize text-slate-900">{analysis.material}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-xs text-slate-500 mb-1">Style</div>
                <div className="font-semibold capitalize text-slate-900">{analysis.style}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-xs text-slate-500 mb-1">Pattern</div>
                <div className="font-semibold capitalize text-slate-900">{analysis.pattern}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-xs text-slate-500 mb-1">Fit Type</div>
                <div className="font-semibold capitalize text-slate-900">{analysis.fit_type}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-xs text-slate-500 mb-1">Formality</div>
                <div className="font-semibold capitalize text-slate-900">
                    {analysis.formality_level}/10
                </div>
            </div>
        </div>
    </div>
);
export default GarmentAnalysisDisplay;
