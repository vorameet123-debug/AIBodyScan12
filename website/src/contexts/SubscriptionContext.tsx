import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import axios from 'axios';

// API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || (
    window.location.hostname === 'localhost' ? 'http://localhost:8000' : ''
);

// Types
interface UsageStatus {
    is_pro: boolean;
    body_scan_count: number;
    body_scan_limit: number;
    fit_check_count: number;
    fit_check_limit: number;
    saved_measurement_count: number;
    saved_measurement_limit: number;
    can_use_wardrobe_analytics: boolean;
    can_use_trend_dashboard: boolean;
    current_month: string;
}

interface CanUseResult {
    can_use: boolean;
    current_count: number;
    limit: number;
    message: string;
}

interface SubscriptionContextType {
    // State
    isPro: boolean;
    isLoading: boolean;
    usage: UsageStatus | null;

    // Methods
    checkCanUse: (feature: string) => Promise<CanUseResult>;
    trackUsage: (feature: string) => Promise<void>;
    refreshUsage: () => Promise<void>;

    // Quick checks
    canScanBody: () => boolean;
    canUseFitCheck: () => boolean;
    canSaveMeasurement: () => boolean;
    canUseWardrobeAnalytics: () => boolean;
    canUseTrendDashboard: () => boolean;

    // Remaining counts
    remainingBodyScans: number;
    remainingFitChecks: number;
    remainingSavedMeasurements: number;
}

const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

export const useSubscription = () => {
    const context = useContext(SubscriptionContext);
    if (!context) {
        throw new Error('useSubscription must be used within a SubscriptionProvider');
    }
    return context;
};

// Safe hook that returns defaults if not authenticated
export const useSubscriptionSafe = () => {
    const context = useContext(SubscriptionContext);
    if (!context) {
        return {
            isPro: false,
            isLoading: false,
            usage: null,
            checkCanUse: async () => ({ can_use: false, current_count: 0, limit: 0, message: 'Not authenticated' }),
            trackUsage: async () => { },
            refreshUsage: async () => { },
            canScanBody: () => false,
            canUseFitCheck: () => false,
            canSaveMeasurement: () => false,
            canUseWardrobeAnalytics: () => false,
            canUseTrendDashboard: () => false,
            remainingBodyScans: 0,
            remainingFitChecks: 0,
            remainingSavedMeasurements: 0,
        };
    }
    return context;
};

interface SubscriptionProviderProps {
    children: ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
    const [isPro, setIsPro] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [usage, setUsage] = useState<UsageStatus | null>(null);

    const getAuthHeader = () => {
        const token = localStorage.getItem('auth_token');
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    const refreshUsage = useCallback(async () => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            setIsLoading(false);
            setIsPro(false);
            setUsage(null);
            return;
        }

        try {
            const response = await axios.get<UsageStatus>(
                `${API_BASE_URL}/api/v1/usage/status`,
                { headers: getAuthHeader() }
            );
            setUsage(response.data);
            setIsPro(response.data.is_pro);
        } catch (error) {
            console.error('Failed to fetch usage status:', error);
            setIsPro(false);
            setUsage(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Fetch usage on mount and when auth changes
    useEffect(() => {
        refreshUsage();

        // Listen for auth changes
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'auth_token') {
                refreshUsage();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [refreshUsage]);

    const checkCanUse = async (feature: string): Promise<CanUseResult> => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            return {
                can_use: false,
                current_count: 0,
                limit: 0,
                message: 'Please sign in to use this feature'
            };
        }

        try {
            const response = await axios.get<CanUseResult>(
                `${API_BASE_URL}/api/v1/usage/can-use/${feature}`,
                { headers: getAuthHeader() }
            );
            return response.data;
        } catch (error) {
            console.error('Failed to check feature access:', error);
            return {
                can_use: false,
                current_count: 0,
                limit: 0,
                message: 'Failed to check access'
            };
        }
    };

    const trackUsage = async (feature: string): Promise<void> => {
        const token = localStorage.getItem('auth_token');
        if (!token) return;

        try {
            await axios.post(
                `${API_BASE_URL}/api/v1/usage/track`,
                { feature },
                { headers: getAuthHeader() }
            );
            // Refresh usage after tracking
            await refreshUsage();
        } catch (error) {
            console.error('Failed to track usage:', error);
        }
    };

    // Quick check methods
    const canScanBody = () => {
        if (isPro) return true;
        if (!usage) return false;
        return usage.body_scan_count < usage.body_scan_limit;
    };

    const canUseFitCheck = () => {
        if (isPro) return true;
        if (!usage) return false;
        return usage.fit_check_count < usage.fit_check_limit;
    };

    const canSaveMeasurement = () => {
        if (isPro) return true;
        if (!usage) return false;
        return usage.saved_measurement_count < usage.saved_measurement_limit;
    };

    const canUseWardrobeAnalytics = () => {
        if (!usage) return false;
        return usage.can_use_wardrobe_analytics;
    };

    const canUseTrendDashboard = () => {
        if (!usage) return false;
        return usage.can_use_trend_dashboard;
    };

    // Remaining counts
    const remainingBodyScans = usage ? Math.max(0, usage.body_scan_limit - usage.body_scan_count) : 0;
    const remainingFitChecks = usage ? Math.max(0, usage.fit_check_limit - usage.fit_check_count) : 0;
    const remainingSavedMeasurements = usage ? Math.max(0, usage.saved_measurement_limit - usage.saved_measurement_count) : 0;

    const value: SubscriptionContextType = {
        isPro,
        isLoading,
        usage,
        checkCanUse,
        trackUsage,
        refreshUsage,
        canScanBody,
        canUseFitCheck,
        canSaveMeasurement,
        canUseWardrobeAnalytics,
        canUseTrendDashboard,
        remainingBodyScans,
        remainingFitChecks,
        remainingSavedMeasurements,
    };

    return (
        <SubscriptionContext.Provider value={value}>
            {children}
        </SubscriptionContext.Provider>
    );
};
