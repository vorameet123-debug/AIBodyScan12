import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award } from 'lucide-react';
import { FashionIQAPI, LeaderboardEntry } from '../services/fashionIQApi';

export const Leaderboard: React.FC = () => {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadLeaderboard();
    }, []);

    const loadLeaderboard = async () => {
        try {
            setLoading(true);
            const response = await FashionIQAPI.getLeaderboard(10);
            if (response.success) {
                setLeaderboard(response.leaderboard);
            }
        } catch (err) {
            console.error('Failed to load leaderboard:', err);
        } finally {
            setLoading(false);
        }
    };

    const getRankIcon = (rank: number) => {
        if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
        if (rank === 2) return <Medal className="w-6 h-6 text-slate-400" />;
        if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />;
        return <Award className="w-5 h-5 text-slate-400" />;
    };

    const getRankColor = (rank: number) => {
        if (rank === 1) return 'bg-amber-50 border-amber-200';
        if (rank === 2) return 'bg-slate-50 border-slate-200';
        if (rank === 3) return 'bg-orange-50 border-orange-200';
        return 'bg-white border-slate-200';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-accent-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-bento p-6 border border-slate-200/60">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-amber-500" />
                Fashion IQ Leaderboard
            </h2>

            <div className="space-y-2.5">
                {leaderboard.map((entry, idx) => (
                    <motion.div
                        key={entry.user_id}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: idx * 0.03 }}
                        className={`${getRankColor(entry.rank)} rounded-xl p-4 border hover:border-accent-200 transition-colors`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center justify-center w-10 h-10">
                                    {getRankIcon(entry.rank)}
                                </div>
                                <div>
                                    <div className="font-bold text-slate-900">{entry.user_name}</div>
                                    <div className="text-sm text-slate-500">
                                        {entry.level} • {entry.total_checks} checks
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-accent-500">
                                    {entry.overall_score}
                                </div>
                                <div className="text-xs text-slate-500">IQ Score</div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {leaderboard.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                    No leaderboard data yet. Be the first to build your Fashion IQ!
                </div>
            )}
        </div>
    );
};
