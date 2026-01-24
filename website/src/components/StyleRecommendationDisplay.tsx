import React from 'react';
import { StyleRecommendationResponse } from '../services/api';
import { Sparkles } from 'lucide-react';

interface Props { styleRecs: StyleRecommendationResponse; }

const StyleRecommendationDisplay: React.FC<Props> = ({ styleRecs }) => (
    <div className="bg-white p-5 rounded-2xl shadow-bento border border-slate-200/60 h-full">
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                <Sparkles className="text-indigo-600" size={16} />
            </div>
            Style AI
        </h3>
        <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-600">Style Score</span>
                <span className="text-sm font-bold text-slate-900">{styleRecs.style_score}/100</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500" style={{ width: `${styleRecs.style_score}%` }}></div>
            </div>
        </div>

        <h4 className="text-xs text-slate-500 font-medium mb-2">Outfit Ideas:</h4>
        <ul className="space-y-2">
            {styleRecs.outfit_suggestions.map((suggestion: string, idx: number) => (
                <li key={idx} className="text-sm text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-start">
                    <span className="mr-2 text-indigo-500">•</span>
                    {suggestion}
                </li>
            ))}
        </ul>
    </div>
);
export default StyleRecommendationDisplay;
