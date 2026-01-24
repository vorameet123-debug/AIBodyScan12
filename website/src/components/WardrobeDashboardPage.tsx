import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WardrobeSidebar, WardrobeSection } from './WardrobeSidebar';
import { WardrobeAnalytics } from './WardrobeAnalytics';
import { TrendDashboard } from './TrendDashboard';
import { OverviewTab } from './wardrobe/OverviewTab';
import { MyItemsTab } from './wardrobe/MyItemsTab';
import { ColorPaletteTab } from './wardrobe/ColorPaletteTab';
import { useSearchParams } from 'react-router-dom';
import { Package, TrendingUp, Sparkles } from 'lucide-react';

export const WardrobeDashboardPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeSection = (searchParams.get('section') as WardrobeSection) || 'overview';
    const [collapsed, setCollapsed] = useState(false);
    const userId = 1; // TODO: Get from auth context

    const handleSectionChange = (section: WardrobeSection) => {
        setSearchParams({ section });
    };

    const renderContent = () => {
        switch (activeSection) {
            case 'overview':
                return <OverviewTab userId={userId} />;
            case 'items':
                return <MyItemsTab userId={userId} />;
            case 'colors':
                return <ColorPaletteTab userId={userId} />;
            case 'analytics':
                return <WardrobeAnalytics userId={userId} hideHeader={true} />;
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
            case 'trending': return 'Trending Now';
            case 'foryou': return 'Trends for You';
            default: return 'Wardrobe & Trends';
        }
    };

    const getSectionIcon = () => {
        switch (activeSection) {
            case 'trending':
            case 'foryou':
                return <TrendingUp className="w-5 h-5" />;
            default:
                return <Package className="w-5 h-5" />;
        }
    };

    return (
        <div className="flex h-screen bg-slate-950 overflow-hidden">
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
                <div className="p-8 max-w-7xl mx-auto">
                    {/* Dashboard Header - Premium */}
                    <div className="mb-10 flex items-end justify-between">
                        <div>
                            {/* Breadcrumb */}
                            <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">
                                <span>Wardrobe & Trends</span>
                                <span className="text-slate-600">/</span>
                                <span className="text-accent-400">{getSectionTitle()}</span>
                            </nav>
                            
                            {/* Title */}
                            <h1 className="text-4xl font-bold tracking-tight text-white flex items-center gap-3">
                                {getSectionTitle()}
                            </h1>
                        </div>

                        {/* Stats Pills */}
                        <div className="flex items-center gap-3">
                            {activeSection !== 'trending' && activeSection !== 'foryou' && (
                                <div className="flex items-center gap-4 bg-slate-900/80 backdrop-blur-xl px-5 py-3 rounded-2xl border border-slate-800/50">
                                    <div className="flex flex-col items-center border-r border-slate-700 pr-4">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Items</span>
                                        <span className="text-lg font-bold text-white">45</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Alignment</span>
                                        <span className="text-lg font-bold text-accent-400">78%</span>
                                    </div>
                                </div>
                            )}
                            
                            {(activeSection === 'trending' || activeSection === 'foryou') && (
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
                </div>
            </main>
        </div>
    );
};
