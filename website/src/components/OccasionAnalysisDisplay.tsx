import React from 'react';
import { OccasionAnalysisResponse } from '../services/api';
import { CheckCircle, AlertCircle, Calendar } from 'lucide-react';

interface Props { occasionAnalysis: OccasionAnalysisResponse; }

const OccasionAnalysisDisplay: React.FC<Props> = ({ occasionAnalysis }) => (
    <div className="bg-white p-5 rounded-2xl shadow-bento border border-slate-200/60 h-full">
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                <Calendar className="text-slate-600" size={16} />
            </div>
            Occasion Check
        </h3>

        <div className="flex items-center mb-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-3 ${occasionAnalysis.is_appropriate ? 'bg-emerald-50' : 'bg-amber-50'}`}>
                {occasionAnalysis.is_appropriate ? 
                    <CheckCircle className="text-emerald-600" size={20} /> : 
                    <AlertCircle className="text-amber-600" size={20} />
                }
            </div>
            <div>
                <div className={`font-semibold text-sm ${occasionAnalysis.is_appropriate ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {occasionAnalysis.is_appropriate ? 'Appropriate' : 'Questionable Choice'}
                </div>
                <div className="text-xs text-slate-500">Match Score: {occasionAnalysis.occasion_match_score}/100</div>
            </div>
        </div>

        <p className="text-sm text-slate-600 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100 italic">
            "{occasionAnalysis.recommendation}"
        </p>

        {occasionAnalysis.alternative_occasions && occasionAnalysis.alternative_occasions.length > 0 && (
            <div>
                <h4 className="text-xs text-slate-500 font-medium mb-2">Better For:</h4>
                <div className="flex flex-wrap gap-1.5">
                    {occasionAnalysis.alternative_occasions.map((occ: string, idx: number) => (
                        <span key={idx} className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium capitalize">
                            {occ}
                        </span>
                    ))}
                </div>
            </div>
        )}
    </div>
);
export default OccasionAnalysisDisplay;
