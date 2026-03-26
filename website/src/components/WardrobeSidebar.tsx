import React from 'react';
import { motion } from 'framer-motion';
import {
    BarChart3,
    ShoppingBag,
    Palette,
    TrendingUp,
    Flame,
    Sparkles,
    Target,
    ChevronLeft,
    ChevronRight,
    LayoutDashboard,
    Clock
} from 'lucide-react';

export type WardrobeSection =
    | 'overview'
    | 'items'
    | 'colors'
    | 'analytics'
    | 'history'
    | 'trending'
    | 'foryou';

interface SidebarItemProps {
    id: WardrobeSection;
    label: string;
    icon: React.ElementType;
    active: boolean;
    collapsed: boolean;
    onClick: (id: WardrobeSection) => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
    id,
    label,
    icon: Icon,
    active,
    collapsed,
    onClick
}) => {
    return (
        <motion.button
            whileHover={{ x: collapsed ? 0 : 2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onClick(id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${active
                ? 'bg-gradient-to-r from-accent-500/20 to-purple-500/20 text-white border border-accent-500/30'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                }`}
        >
            <Icon size={18} className={active ? 'text-accent-400' : 'text-slate-500 group-hover:text-accent-400'} />
            {!collapsed && (
                <span className="font-medium text-sm whitespace-nowrap overflow-hidden transition-all duration-300">
                    {label}
                </span>
            )}
            {collapsed && (
                <div className="absolute left-14 bg-slate-800 text-white px-2 py-1 rounded-lg text-xs opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap shadow-lg border border-slate-700">
                    {label}
                </div>
            )}
            {active && !collapsed && (
                <motion.div
                    layoutId="activePill"
                    className="absolute right-3 w-1.5 h-1.5 rounded-full bg-accent-400"
                />
            )}
        </motion.button>
    );
};

interface WardrobeSidebarProps {
    activeSection: WardrobeSection;
    onSectionChange: (section: WardrobeSection) => void;
    collapsed: boolean;
    onToggleCollapse: () => void;
}

export const WardrobeSidebar: React.FC<WardrobeSidebarProps> = ({
    activeSection,
    onSectionChange,
    collapsed,
    onToggleCollapse
}) => {
    const groups = [
        {
            title: 'WARDROBE',
            items: [
                { id: 'overview' as const, label: 'Overview', icon: LayoutDashboard },
                { id: 'items' as const, label: 'My Items', icon: ShoppingBag },
                { id: 'colors' as const, label: 'Color Palette', icon: Palette },
                { id: 'analytics' as const, label: 'Analytics', icon: BarChart3 },
                { id: 'history' as const, label: 'Activity History', icon: Clock }
            ]
        },
        {
            title: 'TRENDS',
            items: [
                { id: 'trending' as const, label: 'Trending Now', icon: Flame },
                { id: 'foryou' as const, label: 'Trends for You', icon: Sparkles }
            ]
        }
    ];

    return (
        <motion.aside
            animate={{ width: collapsed ? 72 : 240 }}
            className="sticky top-0 h-screen bg-slate-900/80 backdrop-blur-xl border-r border-slate-800/50 flex flex-col p-3 z-20"
        >
            <div className="flex items-center justify-between mb-6 px-1">
                {!collapsed && (
                    <motion.h2
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase"
                    >
                        Dashboard
                    </motion.h2>
                )}
                <button
                    onClick={onToggleCollapse}
                    className="p-1.5 rounded-lg bg-slate-800/50 text-slate-500 hover:text-accent-400 hover:bg-slate-800 transition-colors"
                >
                    {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>
            </div>

            <div className="flex-1 flex flex-col gap-6">
                {groups.map((group) => (
                    <div key={group.title} className="flex flex-col gap-1">
                        {!collapsed && (
                            <h3 className="text-[10px] font-semibold text-slate-600 px-3 mb-2 tracking-wide">
                                {group.title}
                            </h3>
                        )}
                        {group.items.map((item) => (
                            <SidebarItem
                                key={item.id}
                                {...item}
                                active={activeSection === item.id}
                                collapsed={collapsed}
                                onClick={onSectionChange}
                            />
                        ))}
                    </div>
                ))}
            </div>

        </motion.aside>
    );
};
