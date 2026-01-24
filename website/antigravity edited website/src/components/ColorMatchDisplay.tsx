import React from 'react';
import { ColorMatchResponse } from '../services/api';

interface Props { colorAnalysis: ColorMatchResponse; }

const ColorMatchDisplay: React.FC<Props> = ({ colorAnalysis }) => (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 h-full">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            {colorAnalysis.primary_color?.rgb && (
                <span
                    className="w-4 h-4 rounded-full mr-2 border border-gray-200"
                    style={{ backgroundColor: `rgb(${colorAnalysis.primary_color.rgb.r},${colorAnalysis.primary_color.rgb.g},${colorAnalysis.primary_color.rgb.b})` }}
                />
            )}
            Color Analysis
        </h3>
        <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-600">Skin Tone Match</span>
                <span className="text-sm font-bold text-gray-900">{colorAnalysis.match_score}/100</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                    className={`h-full bg-gradient-to-r ${colorAnalysis.match_score > 70 ? 'from-green-400 to-emerald-500' : colorAnalysis.match_score > 40 ? 'from-yellow-400 to-orange-500' : 'from-red-400 to-pink-500'}`}
                    style={{ width: `${colorAnalysis.match_score}%` }}
                />
            </div>
        </div>
        <p className="text-gray-600 italic text-sm mb-4 border-l-4 border-purple-200 pl-3">
            "{colorAnalysis.roast}"
        </p>
        {colorAnalysis.suggested_colors && colorAnalysis.suggested_colors.length > 0 && (
            <div>
                <h4 className="text-xs uppercase text-gray-400 font-bold tracking-wider mb-2">Try Instead:</h4>
                <div className="flex flex-wrap gap-2">
                    {colorAnalysis.suggested_colors.map((color, idx) => (
                        <span key={idx} className="px-3 py-1 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-600 font-medium">
                            {color}
                        </span>
                    ))}
                </div>
            </div>
        )}
    </div>
);
export default ColorMatchDisplay;
