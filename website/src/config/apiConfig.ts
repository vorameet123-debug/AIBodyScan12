/**
 * Centralized API Configuration
 * Single source of truth for the API base URL across all service files.
 */

/**
 * Get the API base URL based on environment.
 *
 * Priority:
 * 1. REACT_APP_API_URL env variable (set in .env or .env.production)
 * 2. localhost fallback for local development
 * 3. Empty string (same-origin) for production deployments
 */
export const getApiBaseUrl = (): string => {
    // Environment variable takes highest priority
    if (process.env.REACT_APP_API_URL) {
        return process.env.REACT_APP_API_URL;
    }

    // Local development fallback
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        return 'http://localhost:8000';
    }

    // Production: same-origin (frontend and API on same domain)
    return '';
};

export const API_BASE_URL = getApiBaseUrl();
