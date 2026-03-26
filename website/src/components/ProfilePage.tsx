/**
 * Profile Page
 * User profile, settings, subscription status, and account management
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    User, Mail, Lock, Phone, Crown, Settings, Shield, HelpCircle,
    MessageSquare, FileText, Info, LogOut, Trash2, ChevronRight,
    Loader2, Check, Eye, EyeOff, ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';
import { AuthService } from '../services/auth';
import { paymentService, SubscriptionStatus } from '../services/paymentService';

// ============================================
// MAIN COMPONENT
// ============================================
export const ProfilePage: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
    const navigate = useNavigate();

    // State
    const [user, setUser] = useState<any>(null);
    const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
    const [loading, setLoading] = useState(true);

    // Edit Profile
    const [editMode, setEditMode] = useState(false);
    const [editName, setEditName] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [savingProfile, setSavingProfile] = useState(false);

    // Change Password
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPw, setShowCurrentPw] = useState(false);
    const [showNewPw, setShowNewPw] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);

    // Fetch user data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userData, subData] = await Promise.all([
                    AuthService.getCurrentUser(),
                    paymentService.getSubscriptionStatus().catch(() => null),
                ]);
                setUser(userData);
                setEditName(userData.full_name || '');
                setEditPhone(userData.phone_number || '');
                setSubscription(subData);
            } catch {
                toast.error('Failed to load profile');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Save profile
    const handleSaveProfile = async () => {
        setSavingProfile(true);
        try {
            const result = await AuthService.updateProfile({
                full_name: editName,
                phone_number: editPhone || undefined,
            });
            setUser((prev: any) => ({ ...prev, full_name: result.full_name, phone_number: result.phone_number }));
            setEditMode(false);
            toast.success('Profile updated!');
        } catch (err: any) {
            toast.error(err?.response?.data?.detail || 'Failed to update profile');
        } finally {
            setSavingProfile(false);
        }
    };

    // Change password
    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword) {
            toast.error('All fields are required');
            return;
        }
        if (newPassword.length < 6) {
            toast.error('New password must be at least 6 characters');
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }
        setSavingPassword(true);
        try {
            await AuthService.changePassword(currentPassword, newPassword);
            toast.success('Password changed successfully!');
            setShowPasswordModal(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            toast.error(err?.response?.data?.detail || 'Failed to change password');
        } finally {
            setSavingPassword(false);
        }
    };

    // Subscription badge
    const getSubBadge = () => {
        if (subscription?.is_active && (subscription.plan_type === 'premium' || subscription.plan_type === 'pro')) {
            return { label: 'PRO', color: 'from-amber-500 to-amber-600', textColor: 'text-amber-400' };
        }
        if (subscription?.is_active && (subscription.plan_type as string) === 'enterprise') {
            return { label: 'ENTERPRISE', color: 'from-purple-500 to-pink-500', textColor: 'text-purple-400' };
        }
        return { label: 'FREE', color: 'from-slate-600 to-slate-700', textColor: 'text-slate-400' };
    };

    const badge = getSubBadge();

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-6 max-w-4xl py-10">
            {/* Page Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <h1 className="text-3xl font-bold text-white">Profile & Settings</h1>
                <p className="text-slate-400 mt-2">Manage your account, subscription, and preferences</p>
            </motion.div>

            <div className="grid gap-6">
                {/* Profile Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-700/60 p-6"
                >
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                            {/* Avatar */}
                            <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-violet-500/25">
                                {(user?.full_name || user?.email || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">{user?.full_name || user?.email?.split('@')[0]}</h2>
                                <p className="text-slate-400 text-sm">{user?.email}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className={`px-2.5 py-1 text-xs font-bold rounded-lg bg-gradient-to-r ${badge.color} text-white`}>
                                        {badge.label}
                                    </span>
                                    {subscription?.days_remaining && subscription.is_active && badge.label !== 'FREE' && (
                                        <span className="text-xs text-slate-400">{subscription.days_remaining} days left</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {!editMode ? (
                            <button
                                onClick={() => setEditMode(true)}
                                className="px-4 py-2 text-sm font-medium text-accent-400 hover:text-accent-300 bg-accent-500/10 hover:bg-accent-500/20 rounded-xl transition-colors"
                            >
                                Edit Profile
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setEditMode(false)}
                                    className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white bg-slate-800 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveProfile}
                                    disabled={savingProfile}
                                    className="px-4 py-2 text-sm font-semibold text-white btn-gradient rounded-xl disabled:opacity-50 flex items-center gap-2"
                                >
                                    {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                    Save
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Edit Fields */}
                    <AnimatePresence>
                        {editMode && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-4 overflow-hidden"
                            >
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                                    <div className="flex items-center gap-3 bg-slate-800 rounded-xl px-4 py-3 border border-slate-700 focus-within:border-accent-500 transition-colors">
                                        <User className="w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            placeholder="Your full name"
                                            className="flex-1 bg-transparent text-white placeholder:text-slate-500 outline-none text-sm"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Phone Number</label>
                                    <div className="flex items-center gap-3 bg-slate-800 rounded-xl px-4 py-3 border border-slate-700 focus-within:border-accent-500 transition-colors">
                                        <Phone className="w-4 h-4 text-slate-400" />
                                        <input
                                            type="tel"
                                            value={editPhone}
                                            onChange={(e) => setEditPhone(e.target.value)}
                                            placeholder="+91 98765 43210"
                                            className="flex-1 bg-transparent text-white placeholder:text-slate-500 outline-none text-sm"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Account Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-700/60 overflow-hidden"
                >
                    <div className="px-6 py-4 border-b border-slate-700/60">
                        <h3 className="font-semibold text-white flex items-center gap-2">
                            <Settings className="w-4 h-4 text-accent-400" />
                            Account
                        </h3>
                    </div>
                    <div className="divide-y divide-slate-800/60">
                        <button
                            onClick={() => navigate('/pricing')}
                            className="w-full flex items-center gap-4 px-6 py-4 hover:bg-slate-800/50 transition-colors text-left group"
                        >
                            <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center">
                                <Crown className="w-5 h-5 text-amber-400" />
                            </div>
                            <div className="flex-1">
                                <span className="text-sm font-medium text-white">Subscription</span>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    {badge.label} Plan
                                    {subscription?.days_remaining && badge.label !== 'FREE' ? ` • ${subscription.days_remaining} days left` : ''}
                                </p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
                        </button>

                        <button
                            onClick={() => setShowPasswordModal(true)}
                            className="w-full flex items-center gap-4 px-6 py-4 hover:bg-slate-800/50 transition-colors text-left group"
                        >
                            <div className="w-10 h-10 bg-violet-500/10 rounded-xl flex items-center justify-center">
                                <Lock className="w-5 h-5 text-violet-400" />
                            </div>
                            <div className="flex-1">
                                <span className="text-sm font-medium text-white">Change Password</span>
                                <p className="text-xs text-slate-400 mt-0.5">Update your account password</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
                        </button>
                    </div>
                </motion.div>

                {/* Support Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-700/60 overflow-hidden"
                >
                    <div className="px-6 py-4 border-b border-slate-700/60">
                        <h3 className="font-semibold text-white flex items-center gap-2">
                            <Shield className="w-4 h-4 text-accent-400" />
                            Support & Legal
                        </h3>
                    </div>
                    <div className="divide-y divide-slate-800/60">
                        <button
                            onClick={() => window.open('https://mail.google.com/mail/?view=cm&to=aibodyscan123@gmail.com&su=Help%20Request', '_blank')}
                            className="w-full flex items-center gap-4 px-6 py-4 hover:bg-slate-800/50 transition-colors group cursor-pointer"
                        >
                            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                                <HelpCircle className="w-5 h-5 text-blue-400" />
                            </div>
                            <span className="flex-1 text-sm font-medium text-white text-left">Help Center</span>
                            <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
                        </button>

                        <button
                            onClick={() => window.open('https://mail.google.com/mail/?view=cm&to=aibodyscan123@gmail.com&su=Support%20Request', '_blank')}
                            className="w-full flex items-center gap-4 px-6 py-4 hover:bg-slate-800/50 transition-colors group cursor-pointer"
                        >
                            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                                <MessageSquare className="w-5 h-5 text-emerald-400" />
                            </div>
                            <span className="flex-1 text-sm font-medium text-white text-left">Contact Us</span>
                            <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
                        </button>
                        <button
                            onClick={() => navigate('/privacy')}
                            className="w-full flex items-center gap-4 px-6 py-4 hover:bg-slate-800/50 transition-colors group"
                        >
                            <div className="w-10 h-10 bg-pink-500/10 rounded-xl flex items-center justify-center">
                                <FileText className="w-5 h-5 text-pink-400" />
                            </div>
                            <span className="flex-1 text-sm font-medium text-white text-left">Privacy Policy</span>
                            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
                        </button>

                        <button
                            onClick={() => navigate('/terms')}
                            className="w-full flex items-center gap-4 px-6 py-4 hover:bg-slate-800/50 transition-colors group"
                        >
                            <div className="w-10 h-10 bg-violet-500/10 rounded-xl flex items-center justify-center">
                                <Shield className="w-5 h-5 text-violet-400" />
                            </div>
                            <span className="flex-1 text-sm font-medium text-white text-left">Terms of Service</span>
                            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
                        </button>

                        <div className="flex items-center gap-4 px-6 py-4">
                            <div className="w-10 h-10 bg-slate-500/10 rounded-xl flex items-center justify-center">
                                <Info className="w-5 h-5 text-slate-400" />
                            </div>
                            <div className="flex-1">
                                <span className="text-sm font-medium text-white">About</span>
                                <p className="text-xs text-slate-400 mt-0.5">BodyScan AI v1.0.0</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Danger Zone */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-700/60 overflow-hidden"
                >
                    <div className="divide-y divide-slate-800/60">
                        <button
                            onClick={onLogout}
                            className="w-full flex items-center gap-4 px-6 py-4 hover:bg-rose-500/10 transition-colors text-left group"
                        >
                            <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center">
                                <LogOut className="w-5 h-5 text-rose-400" />
                            </div>
                            <span className="text-sm font-semibold text-rose-400">Logout</span>
                        </button>
                        <button
                            onClick={() => {
                                toast((t) => (
                                    <div>
                                        <p className="font-medium">Delete Account?</p>
                                        <p className="text-sm text-slate-400 mt-1">Contact aibodyscan123@gmail.com</p>
                                        <button
                                            onClick={() => {
                                                window.location.href = 'mailto:aibodyscan123@gmail.com?subject=Account%20Deletion%20Request';
                                                toast.dismiss(t.id);
                                            }}
                                            className="mt-2 text-sm text-rose-400 font-semibold hover:text-rose-300"
                                        >
                                            Send Email →
                                        </button>
                                    </div>
                                ), { duration: 6000 });
                            }}
                            className="w-full flex items-center gap-4 px-6 py-4 hover:bg-rose-500/10 transition-colors text-left group"
                        >
                            <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center">
                                <Trash2 className="w-5 h-5 text-rose-400" />
                            </div>
                            <span className="text-sm font-medium text-rose-400/70">Delete Account</span>
                        </button>
                    </div>
                </motion.div>

                {/* Member Since */}
                <p className="text-center text-sm text-slate-500 pb-8">
                    Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Unknown'} • BodyScan AI © {new Date().getFullYear()}
                </p>
            </div>

            {/* Change Password Modal */}
            <AnimatePresence>
                {showPasswordModal && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowPasswordModal(false)}
                            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed inset-0 flex items-center justify-center z-50 p-4"
                        >
                            <div className="bg-slate-900 rounded-2xl border border-slate-700/60 shadow-2xl w-full max-w-md p-6">
                                <h3 className="text-lg font-bold text-white mb-6">Change Password</h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Current Password</label>
                                        <div className="flex items-center gap-3 bg-slate-800 rounded-xl px-4 py-3 border border-slate-700 focus-within:border-accent-500 transition-colors">
                                            <Lock className="w-4 h-4 text-slate-400" />
                                            <input
                                                type={showCurrentPw ? 'text' : 'password'}
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                placeholder="Current password"
                                                className="flex-1 bg-transparent text-white placeholder:text-slate-500 outline-none text-sm"
                                            />
                                            <button onClick={() => setShowCurrentPw(!showCurrentPw)} className="text-slate-400 hover:text-white">
                                                {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">New Password</label>
                                        <div className="flex items-center gap-3 bg-slate-800 rounded-xl px-4 py-3 border border-slate-700 focus-within:border-accent-500 transition-colors">
                                            <Lock className="w-4 h-4 text-slate-400" />
                                            <input
                                                type={showNewPw ? 'text' : 'password'}
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                placeholder="New password (min 6 chars)"
                                                className="flex-1 bg-transparent text-white placeholder:text-slate-500 outline-none text-sm"
                                            />
                                            <button onClick={() => setShowNewPw(!showNewPw)} className="text-slate-400 hover:text-white">
                                                {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Confirm New Password</label>
                                        <div className="flex items-center gap-3 bg-slate-800 rounded-xl px-4 py-3 border border-slate-700 focus-within:border-accent-500 transition-colors">
                                            <Lock className="w-4 h-4 text-slate-400" />
                                            <input
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="Confirm new password"
                                                className="flex-1 bg-transparent text-white placeholder:text-slate-500 outline-none text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={() => {
                                            setShowPasswordModal(false);
                                            setCurrentPassword('');
                                            setNewPassword('');
                                            setConfirmPassword('');
                                        }}
                                        className="flex-1 px-4 py-3 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleChangePassword}
                                        disabled={savingPassword}
                                        className="flex-1 px-4 py-3 text-sm font-semibold text-white btn-gradient rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {savingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                        Change Password
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProfilePage;
