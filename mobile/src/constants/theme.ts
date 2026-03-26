// AIBodyScan Theme Configuration
// Matches the website dark theme

export const Colors = {
    // Primary
    primary: '#8b5cf6',      // Violet-500
    primaryDark: '#7c3aed',  // Violet-600
    primaryLight: '#a78bfa', // Violet-400

    // Background
    background: '#0f172a',   // Slate-950
    surface: '#1e293b',      // Slate-800
    surfaceLight: '#334155', // Slate-700

    // Text
    text: '#f8fafc',         // Slate-50
    textSecondary: '#94a3b8', // Slate-400
    textMuted: '#64748b',    // Slate-500

    // Status
    success: '#10b981',      // Emerald-500
    warning: '#f59e0b',      // Amber-500
    error: '#ef4444',        // Red-500
    info: '#3b82f6',         // Blue-500

    // Other
    border: '#334155',       // Slate-700
    overlay: 'rgba(0, 0, 0, 0.5)',

    // Gradients (as arrays for LinearGradient)
    gradientPrimary: ['#8b5cf6', '#6366f1'],
    gradientSuccess: ['#10b981', '#059669'],
};

export const Spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const BorderRadius = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
};

export const FontSize = {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
};

export const FontWeight = {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
};

export default { Colors, Spacing, BorderRadius, FontSize, FontWeight };
