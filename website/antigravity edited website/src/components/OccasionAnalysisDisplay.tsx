import React from 'react';
import { OccasionAnalysisResponse } from '../services/api';

interface Props { occasionAnalysis: OccasionAnalysisResponse; }

const OccasionAnalysisDisplay: React.FC<Props> = ({ occasionAnalysis }) => (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 h-full">
        <h3 className="text-lg font-bold text-gray-800 mb-3">Occasion Check</h3>

        <div className="flex items-center mb-3">
            <div className={`text-2xl mr-3 ${occasionAnalysis.is_appropriate ? 'text-green-500' : 'text-orange-500'}`}>
                {occasionAnalysis.is_appropriate ? '✅' : '⚠️'}
            </div>
            <div>
                <div className={`font-bold ${occasionAnalysis.is_appropriate ? 'text-green-700' : 'text-orange-700'}`}>
                    {occasionAnalysis.is_appropriate ? 'Appropriate' : 'Questionable Choice'}
                </div>
                <div className="text-xs text-gray-500">Match Score: {occasionAnalysis.occasion_match_score}/100</div>
            </div>
        </div>

        <p className="text-sm text-gray-600 mb-3 bg-gray-50 p-3 rounded-lg border border-gray-100 italic">
            "{occasionAnalysis.recommendation}"
        </p>

        {occasionAnalysis.alternative_occasions && occasionAnalysis.alternative_occasions.length > 0 && (
            <div>
                <h4 className="text-xs uppercase text-gray-400 font-bold tracking-wider mb-2">Better For:</h4>
                <div className="flex flex-wrap gap-2">
                    {occasionAnalysis.alternative_occasions.map((occ, idx) => (
                        <span key={idx} className="px-3 py-1 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-600 font-medium capitalize">
                            {occ}
                        </span>
                    ))}
                </div>
            </div>
        )}
    </div>
);
export default OccasionAnalysisDisplay;
