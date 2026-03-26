/**
 * Secure Token Storage Utilities
 * Enhanced security for JWT token management
 */

// Storage keys
const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const TOKEN_TIMESTAMP_KEY = 'auth_token_ts';

/**
 * Token storage with enhanced security
 */
export class SecureTokenStorage {
    private static instance: SecureTokenStorage;

    private constructor() { }

    static getInstance(): SecureTokenStorage {
        if (!SecureTokenStorage.instance) {
            SecureTokenStorage.instance = new SecureTokenStorage();
        }
        return SecureTokenStorage.instance;
    }

    /**
     * Store access token securely
     * Note: For SPAs, localStorage is acceptable since we can't use HttpOnly cookies
     * from the frontend. The real protection comes from CORS, CSRF tokens, and CSP.
     */
    setToken(token: string): void {
        if (!token) {
            console.warn('Attempted to store empty token');
            return;
        }

        // Basic JWT format validation
        const parts = token.split('.');
        if (parts.length !== 3) {
            console.error('Invalid JWT token format');
            return;
        }

        try {
            localStorage.setItem(TOKEN_KEY, token);
            localStorage.setItem(TOKEN_TIMESTAMP_KEY, Date.now().toString());
        } catch (error) {
            console.error('Failed to store token:', error);
        }
    }

    /**
     * Get stored access token
     * Returns null if token is missing or potentially compromised
     */
    getToken(): string | null {
        try {
            const token = localStorage.getItem(TOKEN_KEY);

            if (!token) return null;

            // Validate format
            const parts = token.split('.');
            if (parts.length !== 3) {
                this.clearAll();
                return null;
            }

            // Check if token was set too long ago (potential storage attack)
            const timestamp = localStorage.getItem(TOKEN_TIMESTAMP_KEY);
            if (timestamp) {
                const tokenAge = Date.now() - parseInt(timestamp, 10);
                const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
                if (tokenAge > maxAge) {
                    console.warn('Token timestamp too old, clearing');
                    this.clearAll();
                    return null;
                }
            }

            return token;
        } catch (error) {
            console.error('Failed to retrieve token:', error);
            return null;
        }
    }

    /**
     * Store refresh token
     */
    setRefreshToken(token: string): void {
        if (!token) return;
        try {
            localStorage.setItem(REFRESH_TOKEN_KEY, token);
        } catch (error) {
            console.error('Failed to store refresh token:', error);
        }
    }

    /**
     * Get refresh token
     */
    getRefreshToken(): string | null {
        try {
            return localStorage.getItem(REFRESH_TOKEN_KEY);
        } catch (error) {
            return null;
        }
    }

    /**
     * Clear all stored tokens
     */
    clearAll(): void {
        try {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(REFRESH_TOKEN_KEY);
            localStorage.removeItem(TOKEN_TIMESTAMP_KEY);
            localStorage.removeItem('user');
        } catch (error) {
            console.error('Failed to clear tokens:', error);
        }
    }

    /**
     * Check if token exists and appears valid
     */
    hasValidToken(): boolean {
        const token = this.getToken();
        return token !== null && token.length > 0;
    }

    /**
     * Decode JWT payload (without verification - that's server-side)
     * Returns null if decoding fails
     */
    decodeTokenPayload(): Record<string, unknown> | null {
        const token = this.getToken();
        if (!token) return null;

        try {
            const parts = token.split('.');
            if (parts.length !== 3) return null;

            const payload = JSON.parse(atob(parts[1]));
            return payload;
        } catch {
            return null;
        }
    }

    /**
     * Check if token is expired based on exp claim
     */
    isTokenExpired(): boolean {
        const payload = this.decodeTokenPayload();
        if (!payload || typeof payload.exp !== 'number') {
            return true; // Assume expired if can't verify
        }

        const now = Math.floor(Date.now() / 1000);
        return payload.exp < now;
    }

    /**
     * Get time until token expires (in seconds)
     * Returns 0 if expired or invalid
     */
    getTimeUntilExpiry(): number {
        const payload = this.decodeTokenPayload();
        if (!payload || typeof payload.exp !== 'number') {
            return 0;
        }

        const now = Math.floor(Date.now() / 1000);
        return Math.max(0, payload.exp - now);
    }
}

// Export singleton instance
export const tokenStorage = SecureTokenStorage.getInstance();

// Convenience exports
export const getToken = () => tokenStorage.getToken();
export const setToken = (token: string) => tokenStorage.setToken(token);
export const clearTokens = () => tokenStorage.clearAll();
export const isTokenValid = () => !tokenStorage.isTokenExpired();
