import React from 'react';
import { StyleRecommendationResponse } from '../services/api';

interface Props { styleRecs: StyleRecommendationResponse; }

const StyleRecommendationDisplay: React.FC<Props> = ({ styleRecs }) => (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 h-full">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Style AI</h3>
        <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-600">Style Score</span>
                <span className="text-sm font-bold text-gray-900">{styleRecs.style_score}/100</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500" style={{ width: `${styleRecs.style_score}%` }}></div>
            </div>
        </div>

        <h4 className="text-xs uppercase text-gray-400 font-bold tracking-wider mb-2">Outfit Ideas:</h4>
        <ul className="space-y-2">
            {styleRecs.outfit_suggestions.map((suggestion, idx) => (
                <li key={idx} className="text-sm text-gray-700 bg-indigo-50 p-2 rounded-lg border border-indigo-100 flex items-start">
                    <span className="mr-2 text-indigo-500">•</span>
                    {suggestion}
                </li>
            ))}
        </ul>
    </div>
);
export default StyleRecommendationDisplay;
