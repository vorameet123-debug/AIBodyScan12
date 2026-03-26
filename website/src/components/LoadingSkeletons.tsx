/**
 * Reusable Loading Skeletons and Empty States
 * Premium-styled shimmer loading effects and empty state displays.
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Package, BarChart3, Scan, History } from 'lucide-react';

// ─── Shimmer Base ─────────────────────────────────────
const shimmer = "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent";

// ─── Skeleton Blocks ──────────────────────────────────
export const SkeletonText: React.FC<{ width?: string; className?: string }> = ({ width = 'w-full', className = '' }) => (
  <div className={`h-4 rounded-lg bg-slate-700/50 ${shimmer} ${width} ${className}`} />
);

export const SkeletonCircle: React.FC<{ size?: string }> = ({ size = 'w-12 h-12' }) => (
  <div className={`rounded-full bg-slate-700/50 ${shimmer} ${size}`} />
);

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/40 p-6 ${className}`}>
    <div className="flex items-center gap-3 mb-4">
      <SkeletonCircle size="w-10 h-10" />
      <div className="flex-1 space-y-2">
        <SkeletonText width="w-1/3" />
        <SkeletonText width="w-1/2" />
      </div>
    </div>
    <div className="space-y-3">
      <SkeletonText />
      <SkeletonText width="w-4/5" />
      <SkeletonText width="w-2/3" />
    </div>
  </div>
);

// ─── Page-Specific Skeletons ──────────────────────────

/** Dashboard loading skeleton */
export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-6 p-6 max-w-7xl mx-auto">
    {/* Stats row */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-slate-800/60 rounded-2xl border border-slate-700/40 p-5">
          <SkeletonText width="w-16" className="mb-3" />
          <div className={`h-8 rounded-lg bg-slate-700/50 ${shimmer} w-24`} />
        </div>
      ))}
    </div>
    {/* Main content */}
    <div className="grid md:grid-cols-2 gap-6">
      <SkeletonCard />
      <SkeletonCard />
    </div>
  </div>
);

/** Measurement history loading skeleton */
export const HistorySkeleton: React.FC = () => (
  <div className="space-y-4 p-6 max-w-4xl mx-auto">
    <SkeletonText width="w-48" className="h-7 mb-6" />
    {[...Array(3)].map((_, i) => (
      <div key={i} className="bg-slate-800/60 rounded-2xl border border-slate-700/40 p-5 flex items-center gap-4">
        <SkeletonCircle />
        <div className="flex-1 space-y-2">
          <SkeletonText width="w-1/4" />
          <SkeletonText width="w-1/2" />
        </div>
        <div className={`h-8 w-20 rounded-lg bg-slate-700/50 ${shimmer}`} />
      </div>
    ))}
  </div>
);

/** Profile page loading skeleton */
export const ProfileSkeleton: React.FC = () => (
  <div className="max-w-2xl mx-auto p-6 space-y-6">
    <div className="flex items-center gap-4 mb-8">
      <SkeletonCircle size="w-20 h-20" />
      <div className="space-y-2 flex-1">
        <SkeletonText width="w-1/3" className="h-6" />
        <SkeletonText width="w-1/2" />
      </div>
    </div>
    <SkeletonCard />
    <SkeletonCard />
  </div>
);

// ─── Empty States ─────────────────────────────────────

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-16 px-6 text-center"
  >
    <div className="w-20 h-20 rounded-2xl bg-slate-800/80 border border-slate-700/40 flex items-center justify-center mb-6">
      {icon || <Package className="w-9 h-9 text-slate-500" />}
    </div>
    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
    <p className="text-slate-400 text-sm max-w-sm mb-6 leading-relaxed">{description}</p>
    {actionLabel && onAction && (
      <button
        onClick={onAction}
        className="px-6 py-3 text-sm font-semibold text-white btn-gradient rounded-xl"
      >
        {actionLabel}
      </button>
    )}
  </motion.div>
);

// ─── Pre-built Empty States ───────────────────────────

export const NoMeasurementsEmpty: React.FC<{ onScan?: () => void }> = ({ onScan }) => (
  <EmptyState
    icon={<Scan className="w-9 h-9 text-accent-400" />}
    title="No Measurements Yet"
    description="Take your first body scan to get accurate measurements, size recommendations, and style insights."
    actionLabel="Start Body Scan"
    onAction={onScan}
  />
);

export const NoHistoryEmpty: React.FC = () => (
  <EmptyState
    icon={<History className="w-9 h-9 text-blue-400" />}
    title="No Scan History"
    description="Your past body scans will appear here. Start scanning to track your body changes over time."
  />
);

export const NoAnalyticsEmpty: React.FC = () => (
  <EmptyState
    icon={<BarChart3 className="w-9 h-9 text-emerald-400" />}
    title="No Analytics Available"
    description="Complete at least one body scan to unlock personalized analytics and insights."
  />
);

export default {
  SkeletonText,
  SkeletonCircle,
  SkeletonCard,
  DashboardSkeleton,
  HistorySkeleton,
  ProfileSkeleton,
  EmptyState,
  NoMeasurementsEmpty,
  NoHistoryEmpty,
  NoAnalyticsEmpty,
};
