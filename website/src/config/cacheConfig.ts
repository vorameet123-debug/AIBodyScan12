/**
 * Frontend Caching Configuration
 * 
 * This module provides constants and utilities for consistent caching
 * across the frontend application.
 */

// Cache keys used across the application
export const CACHE_KEYS = {
    BODY_INTELLIGENCE: 'body_intelligence',
    WARDROBE_DATA: 'wardrobe_data',
    FASHION_IQ: 'fashion_iq',
    USER_PREFERENCES: 'user_preferences',
    BRANDS: 'brands',
    TRENDS: 'trends',
} as const;

// Stale times in milliseconds
export const STALE_TIMES = {
    // User-specific data (5 minutes)
    USER_DATA: 5 * 60 * 1000,

    // Frequently changing data (1 minute)
    FAST_REFRESH: 60 * 1000,

    // Slow-changing data (30 minutes)
    SLOW_REFRESH: 30 * 60 * 1000,

    // Static data (1 hour)
    STATIC: 60 * 60 * 1000,

    // Never stale until invalidated
    INFINITE: Infinity,
} as const;

// Cache durations by data type
export const CACHE_CONFIG = {
    // Body tracker data - user can invalidate by adding measurements
    bodyIntelligence: {
        staleTime: STALE_TIMES.USER_DATA, // 5 minutes
        cacheKey: CACHE_KEYS.BODY_INTELLIGENCE,
    },

    // Wardrobe data - refreshes when items are added/removed
    wardrobe: {
        staleTime: STALE_TIMES.USER_DATA, // 5 minutes
        cacheKey: CACHE_KEYS.WARDROBE_DATA,
    },

    // Fashion IQ scores - calculated from measurements
    fashionIQ: {
        staleTime: STALE_TIMES.USER_DATA, // 5 minutes
        cacheKey: CACHE_KEYS.FASHION_IQ,
    },

    // Brand catalog - rarely changes
    brands: {
        staleTime: STALE_TIMES.SLOW_REFRESH, // 30 minutes
        cacheKey: CACHE_KEYS.BRANDS,
    },

    // Fashion trends - external data
    trends: {
        staleTime: STALE_TIMES.SLOW_REFRESH, // 30 minutes
        cacheKey: CACHE_KEYS.TRENDS,
    },

    // User preferences - changes infrequently
    preferences: {
        staleTime: STALE_TIMES.STATIC, // 1 hour
        cacheKey: CACHE_KEYS.USER_PREFERENCES,
    },
} as const;

/**
 * Simple in-memory cache for API responses
 * Use this when React Query/SWR is not available
 */
interface CacheEntry<T> {
    data: T;
    timestamp: number;
    staleTime: number;
}

const isDev = process.env.NODE_ENV !== 'production';

class SimpleCache {
    private cache: Map<string, CacheEntry<any>> = new Map();

    set<T>(key: string, data: T, staleTime: number = STALE_TIMES.USER_DATA): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            staleTime,
        });
        if (isDev) console.log(`📦 Cache SET: ${key}`);
    }

    get<T>(key: string): T | null {
        const entry = this.cache.get(key);

        if (!entry) {
            if (isDev) console.log(`📭 Cache MISS: ${key}`);
            return null;
        }

        const age = Date.now() - entry.timestamp;
        const isStale = age > entry.staleTime;

        if (isStale) {
            if (isDev) console.log(`⏰ Cache STALE: ${key} (age: ${Math.round(age / 1000)}s)`);
            return null;
        }

        if (isDev) console.log(`✅ Cache HIT: ${key} (age: ${Math.round(age / 1000)}s)`);
        return entry.data as T;
    }

    invalidate(key: string): void {
        this.cache.delete(key);
        if (isDev) console.log(`🗑️ Cache INVALIDATE: ${key}`);
    }

    invalidatePrefix(prefix: string): void {
        const keysToDelete: string[] = [];

        this.cache.forEach((_, key) => {
            if (key.startsWith(prefix)) {
                keysToDelete.push(key);
            }
        });

        keysToDelete.forEach(key => this.cache.delete(key));
        if (isDev) console.log(`🗑️ Cache INVALIDATE PREFIX: ${prefix} (${keysToDelete.length} keys)`);
    }

    clear(): void {
        this.cache.clear();
        if (isDev) console.log('🗑️ Cache CLEAR: All entries removed');
    }

    getStats(): { size: number; keys: string[] } {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys()),
        };
    }
}

// Global cache instance
export const apiCache = new SimpleCache();

/**
 * Create a cache key with user ID for user-specific data
 */
export function createUserCacheKey(baseKey: string, userId: number | string): string {
    return `${baseKey}:user:${userId}`;
}

/**
 * Create a cache key with additional parameters
 */
export function createCacheKey(baseKey: string, params: Record<string, any>): string {
    const paramStr = Object.entries(params)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}=${v}`)
        .join('&');
    return paramStr ? `${baseKey}:${paramStr}` : baseKey;
}
