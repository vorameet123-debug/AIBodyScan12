/**
 * Security Utilities for Frontend
 * XSS Protection, Input Sanitization, and Security Helpers
 */

// HTML entities to escape
const HTML_ENTITIES: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;',
};

/**
 * Escape HTML special characters to prevent XSS
 * @param str - String to escape
 * @returns Escaped string safe for HTML insertion
 */
export function escapeHtml(str: string): string {
    if (!str || typeof str !== 'string') return '';
    return str.replace(/[&<>"'`=/]/g, (char) => HTML_ENTITIES[char] || char);
}

/**
 * Sanitize user input by removing potentially dangerous patterns
 * @param input - User input string
 * @param options - Sanitization options
 * @returns Sanitized string
 */
export function sanitizeInput(
    input: string,
    options: {
        maxLength?: number;
        allowHtml?: boolean;
        trimWhitespace?: boolean;
    } = {}
): string {
    const { maxLength = 10000, allowHtml = false, trimWhitespace = true } = options;

    if (!input || typeof input !== 'string') return '';

    let result = input;

    // Trim whitespace
    if (trimWhitespace) {
        result = result.trim();
    }

    // Truncate to max length
    if (result.length > maxLength) {
        result = result.substring(0, maxLength);
    }

    // Escape HTML if not allowed
    if (!allowHtml) {
        result = escapeHtml(result);
    }

    // Remove null bytes and other control characters
    result = result.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

    return result;
}

/**
 * Validate email format
 * @param email - Email to validate
 * @returns True if valid email format
 */
export function isValidEmail(email: string): boolean {
    if (!email || typeof email !== 'string') return false;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email.trim());
}

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns Object with validation result and messages
 */
export function validatePassword(password: string): {
    valid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    if (!password || password.length < 8) {
        errors.push('Password must be at least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }
    if (!/\d/.test(password)) {
        errors.push('Password must contain at least one number');
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Sanitize URL to prevent javascript: and data: protocol attacks
 * @param url - URL to sanitize
 * @returns Sanitized URL or empty string if dangerous
 */
export function sanitizeUrl(url: string): string {
    if (!url || typeof url !== 'string') return '';

    const trimmed = url.trim().toLowerCase();

    // Block dangerous protocols
    const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
    for (const protocol of dangerousProtocols) {
        if (trimmed.startsWith(protocol)) {
            console.warn('Blocked dangerous URL protocol:', protocol);
            return '';
        }
    }

    // Allow relative URLs and safe protocols
    const safeProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
    if (trimmed.startsWith('/') || trimmed.startsWith('#')) {
        return url; // Relative URL
    }

    for (const protocol of safeProtocols) {
        if (trimmed.startsWith(protocol)) {
            return url;
        }
    }

    // If no protocol, assume relative
    if (!trimmed.includes(':')) {
        return url;
    }

    // Unknown protocol, block it
    console.warn('Blocked unknown URL protocol');
    return '';
}

/**
 * Create a secure random token for CSRF protection or similar
 * @param length - Length of the token
 * @returns Random token string
 */
export function generateSecureToken(length: number = 32): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Safely parse JSON with error handling
 * @param jsonString - JSON string to parse
 * @param fallback - Fallback value if parsing fails
 * @returns Parsed object or fallback
 */
export function safeJsonParse<T>(jsonString: string, fallback: T): T {
    try {
        return JSON.parse(jsonString) as T;
    } catch {
        console.warn('Failed to parse JSON');
        return fallback;
    }
}

/**
 * Check if current page is loaded over HTTPS
 * @returns True if HTTPS
 */
export function isSecureContext(): boolean {
    return window.isSecureContext ?? window.location.protocol === 'https:';
}

/**
 * Sanitize object keys and values recursively
 * Useful for sanitizing API request bodies
 * @param obj - Object to sanitize
 * @returns Sanitized object
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
        const sanitizedKey = sanitizeInput(key, { maxLength: 100 });

        if (typeof value === 'string') {
            result[sanitizedKey] = sanitizeInput(value);
        } else if (typeof value === 'object' && value !== null) {
            result[sanitizedKey] = sanitizeObject(value as Record<string, unknown>);
        } else {
            result[sanitizedKey] = value;
        }
    }

    return result as T;
}

// Export default security utilities
export const SecurityUtils = {
    escapeHtml,
    sanitizeInput,
    sanitizeUrl,
    sanitizeObject,
    isValidEmail,
    validatePassword,
    generateSecureToken,
    safeJsonParse,
    isSecureContext,
};

export default SecurityUtils;
