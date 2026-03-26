import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Heart, X, Check } from 'lucide-react';
import { PurchaseAPI } from '../services/purchaseApi';
import toast from 'react-hot-toast';

interface PurchaseIntentProps {
    checkId: number;
    onIntentSet?: (intent: string) => void;
}

export const PurchaseIntent: React.FC<PurchaseIntentProps> = ({ checkId, onIntentSet }) => {
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState<string | null>(null);

    const handleIntent = async (intent: 'yes' | 'maybe' | 'no') => {
        try {
            setLoading(true);
            await PurchaseAPI.setPurchaseIntent(checkId, intent);
            setSelected(intent);

            const messages = {
                yes: '🎉 Great! Item marked as purchased',
                maybe: '💭 Added to your wishlist',
                no: '👍 Got it, just checking'
            };

            toast.success(messages[intent]);

            if (onIntentSet) {
                onIntentSet(intent);
            }
        } catch (error) {
            console.error('Error setting purchase intent:', error);
            toast.error('Failed to save your choice');
        } finally {
            setLoading(false);
        }
    };

    if (selected) {
        const getSelectedStyles = () => {
            switch (selected) {
                case 'yes': return { bg: 'bg-emerald-500/20', border: 'border-emerald-500/30', text: 'text-emerald-400' };
                case 'maybe': return { bg: 'bg-amber-500/20', border: 'border-amber-500/30', text: 'text-amber-400' };
                default: return { bg: 'bg-slate-700/50', border: 'border-white/10', text: 'text-slate-300' };
            }
        };
        const styles = getSelectedStyles();

        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${styles.bg} border ${styles.border} rounded-xl p-4 text-center flex items-center justify-center gap-2`}
            >
                <Check size={18} className={styles.text} />
                <p className={`${styles.text} font-medium`}>
                    {selected === 'yes' && 'Marked as purchased'}
                    {selected === 'maybe' && 'Added to wishlist'}
                    {selected === 'no' && 'Thanks for checking!'}
                </p>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-white/10"
        >
            <div className="text-center mb-4">
                <p className="text-lg font-semibold text-white">💡 Planning to buy this?</p>
                <p className="text-sm text-slate-400 mt-1">Help us understand your wardrobe better</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleIntent('yes')}
                    disabled={loading}
                    className="flex flex-col items-center gap-2 p-4 bg-slate-700/50 rounded-xl border border-emerald-500/30 hover:border-emerald-400 hover:bg-emerald-500/10 transition-all disabled:opacity-50"
                >
                    <ShoppingBag className="w-6 h-6 text-emerald-400" />
                    <span className="font-semibold text-emerald-400">Yes</span>
                    <span className="text-xs text-slate-400">I bought it</span>
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleIntent('maybe')}
                    disabled={loading}
                    className="flex flex-col items-center gap-2 p-4 bg-slate-700/50 rounded-xl border border-amber-500/30 hover:border-amber-400 hover:bg-amber-500/10 transition-all disabled:opacity-50"
                >
                    <Heart className="w-6 h-6 text-amber-400" />
                    <span className="font-semibold text-amber-400">Maybe</span>
                    <span className="text-xs text-slate-400">Wishlist</span>
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleIntent('no')}
                    disabled={loading}
                    className="flex flex-col items-center gap-2 p-4 bg-slate-700/50 rounded-xl border border-white/10 hover:border-white/20 hover:bg-slate-600/50 transition-all disabled:opacity-50"
                >
                    <X className="w-6 h-6 text-slate-400" />
                    <span className="font-semibold text-slate-300">Skip</span>
                    <span className="text-xs text-slate-400">Just checking</span>
                </motion.button>
            </div>
        </motion.div>
    );
};
