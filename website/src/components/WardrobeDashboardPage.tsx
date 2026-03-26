import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WardrobeSidebar, WardrobeSection } from './WardrobeSidebar';
import { useAuth } from '../contexts/AuthContext';
import { WardrobeAnalytics } from './WardrobeAnalytics';
import { TrendDashboard } from './TrendDashboard';
import { OverviewTab } from './wardrobe/OverviewTab';
import { MyItemsTab } from './wardrobe/MyItemsTab';
import { ColorPaletteTab } from './wardrobe/ColorPaletteTab';
import { ActivityHistoryTab } from './wardrobe/ActivityHistoryTab';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Package, TrendingUp, Sparkles, Crown, Lock, ArrowRight } from 'lucide-react';
import { useSubscription } from '../contexts/SubscriptionContext';

// Pro-only sections - ALL wardrobe and trend features
const PRO_ONLY_SECTIONS: WardrobeSection[] = ['overview', 'items', 'colors', 'analytics', 'history', 'trending', 'foryou'];

export const WardrobeDashboardPage: React.FC = () => {
    const { userId } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeSection = (searchParams.get('section') as WardrobeSection) || 'overview';
    const [collapsed, setCollapsed] = useState(false);
    const { isPro, isLoading: isLoadingSubscription } = useSubscription();

    const handleSectionChange = (section: WardrobeSection) => {
        setSearchParams({ section });
    };

    // Pro Feature Gate Component
    const ProFeatureGate: React.FC<{ feature: string }> = ({ feature }) => (
        <div className="flex flex-col items-center justify-center py-20 px-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center mb-6">
                <Lock className="w-10 h-10 text-violet-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Pro Feature</h2>
            <p className="text-slate-400 text-center max-w-md mb-6">
                {feature} is available exclusively for Pro subscribers. Upgrade now to unlock advanced analytics and trend insights.
            </p>
            <div className="flex flex-wrap gap-4 justify-center mb-8">
                <div className="flex items-center gap-2 text-sm text-slate-300">
                    <Crown className="w-4 h-4 text-amber-400" />
                    Unlimited access
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-300">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    Trend forecasting
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-300">
                    <Sparkles className="w-4 h-4 text-violet-400" />
                    AI insights
                </div>
            </div>
            <button
                onClick={() => navigate('/pricing')}
                className="px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-xl flex items-center gap-2 hover:shadow-lg hover:shadow-violet-500/25 transition-all"
            >
                Upgrade to Pro
                <ArrowRight className="w-4 h-4" />
            </button>
        </div>
    );

    const renderContent = () => {
        // Check if section is Pro-only and user is not Pro
        if (PRO_ONLY_SECTIONS.includes(activeSection) && !isPro && !isLoadingSubscription) {
            const featureNames: Record<string, string> = {
                'analytics': 'Wardrobe Analytics',
                'trending': 'Trending Now',
                'foryou': 'Trends for You',
            };
            return <ProFeatureGate feature={featureNames[activeSection] || 'This feature'} />;
        }

        switch (activeSection) {
            case 'overview':
                return <OverviewTab userId={userId} />;
            case 'items':
                return <MyItemsTab userId={userId} />;
            case 'colors':
                return <ColorPaletteTab userId={userId} />;
            case 'analytics':
                return <WardrobeAnalytics userId={userId} hideHeader={true} />;
            case 'history':
                return <ActivityHistoryTab userId={userId} />;
            case 'trending':
                return <TrendDashboard userId={userId} mode="trending" hideHeader={true} />;
            case 'foryou':
                return <TrendDashboard userId={userId} mode="foryou" hideHeader={true} />;
            default:
                return <OverviewTab userId={userId} />;
        }
    };

    const getSectionTitle = () => {
        switch (activeSection) {
            case 'overview': return 'Wardrobe Overview';
            case 'items': return 'My Items';
            case 'colors': return 'Color Palette';
            case 'analytics': return 'Wardrobe Analytics';
            case 'history': return 'Activity History';
            case 'trending': return 'Trending Now';
            case 'foryou': return 'Trends for You';
            default: return 'Wardrobe & Trends';
        }
    };

    // Check if current section is Pro-only
    const isProSection = PRO_ONLY_SECTIONS.includes(activeSection);

    return (
        <div className="flex min-h-screen bg-slate-950">
            {/* Premium Mesh Gradient Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-accent-600/20 to-purple-600/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-br from-pink-600/15 to-rose-600/15 rounded-full blur-3xl" />
            </div>

            {/* Sidebar */}
            <WardrobeSidebar
                activeSection={activeSection}
                onSectionChange={handleSectionChange}
                collapsed={collapsed}
                onToggleCollapse={() => setCollapsed(!collapsed)}
            />

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto relative">
                <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
                    {/* Dashboard Header - Premium */}
                    <div className="mb-10 flex items-end justify-between">
                        <div>
                            {/* Breadcrumb */}
                            <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">
                                <span>Wardrobe & Trends</span>
                                <span className="text-slate-600">/</span>
                                <span className="text-accent-400">{getSectionTitle()}</span>
                                {isProSection && !isPro && (
                                    <span className="ml-2 px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full">PRO</span>
                                )}
                            </nav>

                            {/* Title */}
                            <h1 className="text-4xl font-bold tracking-tight text-white flex items-center gap-3">
                                {getSectionTitle()}
                                {isProSection && !isPro && (
                                    <Lock className="w-6 h-6 text-slate-500" />
                                )}
                            </h1>
                        </div>

                        {/* Stats Pills - Only show AI badge for trend sections */}

                        {(activeSection === 'trending' || activeSection === 'foryou') && isPro && (
                            <div className="flex items-center gap-2 bg-gradient-to-r from-accent-500/20 to-purple-500/20 px-4 py-2 rounded-full border border-accent-500/30">
                                <Sparkles className="w-4 h-4 text-accent-400" />
                                <span className="text-sm font-semibold text-accent-300">AI Powered</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Dynamic Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeSection}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {renderContent()}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
};
