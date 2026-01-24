import React from 'react';
import { ColorMatchResponse } from '../services/api';
import { Palette } from 'lucide-react';

interface Props { colorAnalysis: ColorMatchResponse; }

const ColorMatchDisplay: React.FC<Props> = ({ colorAnalysis }) => (
    <div className="bg-white p-5 rounded-2xl shadow-bento border border-slate-200/60 h-full">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                <Palette className="text-indigo-600" size={16} />
            </div>
            <span>Color Analysis</span>
            {colorAnalysis.primary_color?.rgb && (
                <span
                    className="w-4 h-4 rounded-full ml-auto border border-slate-200"
                    style={{ backgroundColor: `rgb(${colorAnalysis.primary_color.rgb.r},${colorAnalysis.primary_color.rgb.g},${colorAnalysis.primary_color.rgb.b})` }}
                />
            )}
        </h3>
        <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-600">Skin Tone Match</span>
                <span className="text-sm font-bold text-slate-900">{colorAnalysis.match_score}/100</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                    className={`h-full ${colorAnalysis.match_score > 70 ? 'bg-emerald-500' : colorAnalysis.match_score > 40 ? 'bg-amber-500' : 'bg-rose-500'}`}
                    style={{ width: `${colorAnalysis.match_score}%` }}
                />
            </div>
        </div>
        <p className="text-slate-600 text-sm mb-4 border-l-2 border-indigo-200 pl-3 italic">
            "{colorAnalysis.roast}"
        </p>
        {colorAnalysis.suggested_colors && colorAnalysis.suggested_colors.length > 0 && (
            <div>
                <h4 className="text-xs uppercase text-slate-400 font-semibold tracking-wider mb-2">Try Instead:</h4>
                <div className="flex flex-wrap gap-2">
                    {colorAnalysis.suggested_colors.map((color: string, idx: number) => (
                        <span key={idx} className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-700 font-medium">
                            {color}
                        </span>
                    ))}
                </div>
            </div>
        )}
    </div>
);
export default ColorMatchDisplay;
