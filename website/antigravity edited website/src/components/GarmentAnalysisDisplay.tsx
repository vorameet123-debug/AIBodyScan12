import React from 'react';
import { GarmentAnalysis } from '../services/api';

interface Props { analysis: GarmentAnalysis; }

const GarmentAnalysisDisplay: React.FC<Props> = ({ analysis }) => (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 h-full">
        <h3 className="text-lg font-bold text-gray-800 mb-3 opacity-75">Garment Details</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Type</div>
                <div className="font-semibold capitalize text-gray-800">{analysis.garment_type}</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Material</div>
                <div className="font-semibold capitalize text-gray-800">{analysis.material}</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Style</div>
                <div className="font-semibold capitalize text-gray-800">{analysis.style}</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Pattern</div>
                <div className="font-semibold capitalize text-gray-800">{analysis.pattern}</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Fit Type</div>
                <div className="font-semibold capitalize text-gray-800">{analysis.fit_type}</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Formality</div>
                <div className="font-semibold capitalize text-gray-800">
                    {analysis.formality_level}/10
                </div>
            </div>
        </div>
    </div>
);
export default GarmentAnalysisDisplay;
