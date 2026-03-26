/**
 * Body Intelligence Context
 * 
 * Provides smart caching for body tracker data:
 * - Caches data after first fetch
 * - Only refetches when explicitly invalidated (after new measurement)
 * - Supports configurable stale time
 * - Prevents unnecessary API calls on tab switches
 */
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { BodyIntelligenceAPI, MeasurementPoint, ProgressSummary } from '../services/bodyIntelligenceApi';
import toast from 'react-hot-toast';

// Cache entry with timestamp
interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

interface BodyIntelligenceState {
    // Cached data
    history: MeasurementPoint[];
    progress: ProgressSummary | null;
    availableUsers: string[];

    // Cache metadata
    lastFetchTime: number | null;
    isLoading: boolean;
    isStale: boolean;
    selectedUser: string;

    // Actions
    fetchData: (userId: number, forceRefresh?: boolean) => Promise<void>;
    invalidateCache: () => void;
    setSelectedUser: (user: string) => void;
}

const STALE_TIME_MS = 5 * 60 * 1000; // 5 minutes - data is fresh for this long

const BodyIntelligenceContext = createContext<BodyIntelligenceState | null>(null);

export const BodyIntelligenceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Data state
    const [history, setHistory] = useState<MeasurementPoint[]>([]);
    const [progress, setProgress] = useState<ProgressSummary | null>(null);
    const [availableUsers, setAvailableUsers] = useState<string[]>([]);

    // Cache state
    const [lastFetchTime, setLastFetchTime] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isStale, setIsStale] = useState(true);
    const [selectedUser, setSelectedUser] = useState<string>('all');

    // Cache key for detecting user/filter changes
    const [cacheKey, setCacheKey] = useState<string>('');

    /**
     * Check if cached data is still valid
     */
    const isCacheValid = useCallback((userId: number, personName?: string): boolean => {
        if (isStale) return false;
        if (!lastFetchTime) return false;

        const currentKey = `${userId}-${personName || 'all'}`;
        if (cacheKey !== currentKey) return false;

        const age = Date.now() - lastFetchTime;
        return age < STALE_TIME_MS;
    }, [isStale, lastFetchTime, cacheKey]);

    /**
     * Fetch body intelligence data
     * @param userId - User ID to fetch data for
     * @param forceRefresh - If true, bypasses cache and fetches fresh data
     */
    const fetchData = useCallback(async (userId: number, forceRefresh = false) => {
        const personName = selectedUser !== 'all' ? selectedUser : undefined;
        const currentKey = `${userId}-${personName || 'all'}`;

        // Check if we can use cached data
        if (!forceRefresh && isCacheValid(userId, personName)) {
            return;
        }

        setIsLoading(true);

        try {
            // Fetch history and progress in parallel
            const [historyData, progressData] = await Promise.all([
                BodyIntelligenceAPI.getHistory(userId, 90, personName),
                BodyIntelligenceAPI.getProgress(userId, personName)
            ]);

            setHistory(historyData);
            setProgress(progressData);

            // Fetch all users for dropdown (only once, when no filter)
            if (!personName) {
                const users = Array.from(new Set(historyData.map(m => m.name).filter(Boolean))) as string[];
                setAvailableUsers(users);
            }

            // Update cache metadata
            setLastFetchTime(Date.now());
            setCacheKey(currentKey);
            setIsStale(false);

        } catch (error) {
            console.error('Failed to fetch body intelligence data:', error);
            toast.error('Failed to load body tracking data');
        } finally {
            setIsLoading(false);
        }
    }, [selectedUser, isCacheValid]);

    /**
     * Invalidate cache - call this after adding a new measurement
     */
    const invalidateCache = useCallback(() => {
        setIsStale(true);
        setLastFetchTime(null);
    }, []);

    /**
     * Change selected user filter
     * This also invalidates cache for the new selection
     */
    const handleSetSelectedUser = useCallback((user: string) => {
        if (user !== selectedUser) {
            setSelectedUser(user);
            setIsStale(true); // Need to fetch for new filter
        }
    }, [selectedUser]);

    const value: BodyIntelligenceState = {
        history,
        progress,
        availableUsers,
        lastFetchTime,
        isLoading,
        isStale,
        selectedUser,
        fetchData,
        invalidateCache,
        setSelectedUser: handleSetSelectedUser,
    };

    return (
        <BodyIntelligenceContext.Provider value={value}>
            {children}
        </BodyIntelligenceContext.Provider>
    );
};

/**
 * Hook to access body intelligence context
 */
export const useBodyIntelligence = (): BodyIntelligenceState => {
    const context = useContext(BodyIntelligenceContext);
    if (!context) {
        throw new Error('useBodyIntelligence must be used within a BodyIntelligenceProvider');
    }
    return context;
};

/**
 * Hook to invalidate body intelligence cache
 * Use this after adding/updating measurements
 */
export const useInvalidateBodyIntelligence = (): (() => void) => {
    const context = useContext(BodyIntelligenceContext);
    return context?.invalidateCache || (() => {
        console.warn('useInvalidateBodyIntelligence called outside of provider');
    });
};
