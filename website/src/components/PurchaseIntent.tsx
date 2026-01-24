import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Heart, X } from 'lucide-react';
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
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-50 border border-green-200 rounded-xl p-4 text-center"
            >
                <p className="text-green-700 font-medium">
                    {selected === 'yes' && '✓ Marked as purchased'}
                    {selected === 'maybe' && '💭 Added to wishlist'}
                    {selected === 'no' && '👍 Thanks for checking!'}
                </p>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-50 rounded-xl p-6 border border-slate-200/60"
        >
            <div className="text-center mb-4">
                <p className="text-lg font-semibold text-slate-900">💡 Planning to buy this?</p>
                <p className="text-sm text-slate-500 mt-1">Help us understand your wardrobe better</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleIntent('yes')}
                    disabled={loading}
                    className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all disabled:opacity-50"
                >
                    <ShoppingBag className="w-6 h-6 text-emerald-600" />
                    <span className="font-semibold text-green-700">Yes</span>
                    <span className="text-xs text-slate-500">I bought it</span>
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleIntent('maybe')}
                    disabled={loading}
                    className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-amber-200 hover:border-amber-400 hover:bg-amber-50 transition-all disabled:opacity-50"
                >
                    <Heart className="w-6 h-6 text-amber-500" />
                    <span className="font-semibold text-amber-700">Maybe</span>
                    <span className="text-xs text-slate-500">Wishlist</span>
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleIntent('no')}
                    disabled={loading}
                    className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-all disabled:opacity-50"
                >
                    <X className="w-6 h-6 text-slate-500" />
                    <span className="font-semibold text-slate-700">Skip</span>
                    <span className="text-xs text-slate-500">Just checking</span>
                </motion.button>
            </div>
        </motion.div>
    );
};
