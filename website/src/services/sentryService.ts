/**
 * Sentry Error Tracking Integration for Frontend
 * 
 * Provides error tracking, performance monitoring, and user feedback
 * for the AIBodyScan React application.
 * 
 * Setup:
 * 1. Create a Sentry account at https://sentry.io
 * 2. Create a new project (React)
 * 3. Get your DSN from Project Settings > Client Keys
 * 4. Set REACT_APP_SENTRY_DSN in .env
 * 
 * Features:
 * - Automatic error boundary integration
 * - React component tracking
 * - User feedback collection on errors
 * - Session replay (optional)
 * - Performance tracing
 */

// Check if Sentry is available (will be installed as dependency)
let Sentry: any = null;
let BrowserTracing: any = null;
let Replay: any = null;

try {
    // Dynamic import to handle cases when Sentry isn't installed
    Sentry = require('@sentry/react');
    BrowserTracing = require('@sentry/browser').BrowserTracing;
    Replay = require('@sentry/browser').Replay;
} catch (e) {
    console.warn('Sentry SDK not installed. Run: npm install @sentry/react @sentry/browser');
}

// Configuration
const SENTRY_DSN = process.env.REACT_APP_SENTRY_DSN;
const ENVIRONMENT = process.env.REACT_APP_ENVIRONMENT || 'development';
const RELEASE = process.env.REACT_APP_VERSION || 'aibodyscan-web@1.0.0';

// Whether Sentry is enabled
export const isSentryEnabled = (): boolean => {
    return Boolean(Sentry && SENTRY_DSN);
};

/**
 * Initialize Sentry for the React application.
 * Call this at the app entry point (index.tsx).
 */
export function initSentry(): void {
    if (!Sentry) {
        console.warn('Sentry SDK not available');
        return;
    }

    if (!SENTRY_DSN) {
        console.info('Sentry DSN not configured. Error tracking disabled.');
        return;
    }

    const integrations = [
        // Performance monitoring
        new BrowserTracing({
            // Set sampling rate for performance monitoring
            tracingOrigins: ['localhost', /^https:\/\/.*\.aibodyscan\.com/],
        }),
    ];

    // Add session replay in production
    if (ENVIRONMENT === 'production' && Replay) {
        integrations.push(
            new Replay({
                maskAllText: true,
                blockAllMedia: true,
            })
        );
    }

    Sentry.init({
        dsn: SENTRY_DSN,
        environment: ENVIRONMENT,
        release: RELEASE,
        integrations,

        // Performance monitoring
        tracesSampleRate: ENVIRONMENT === 'production' ? 0.1 : 0.5,

        // Session replay sample rate
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,

        // Filter errors before sending
        beforeSend(event: any, hint: any) {
            return filterEvent(event, hint);
        },

        // Don't send PII by default
        beforeBreadcrumb(breadcrumb: any) {
            // Redact sensitive URLs
            if (breadcrumb.category === 'navigation') {
                const url = breadcrumb.data?.to || '';
                if (url.includes('token') || url.includes('password')) {
                    breadcrumb.data.to = '[REDACTED]';
                }
            }
            return breadcrumb;
        },
    });

    console.info(`Sentry initialized: env=${ENVIRONMENT}, release=${RELEASE}`);
}

/**
 * Filter events before sending to Sentry.
 */
function filterEvent(event: any, hint: any): any | null {
    const error = hint?.originalException;

    if (error) {
        const message = error.message || String(error);

        // Filter out common non-actionable errors
        const ignoredErrors = [
            'ResizeObserver loop limit exceeded',
            'ResizeObserver loop completed with undelivered notifications',
            'Network Error',
            'Request aborted',
            'Unauthorized', // Expected auth failures
            'Failed to fetch', // Network issues
            'Load failed', // Asset loading issues
            'ChunkLoadError', // Code splitting issues (recoverable)
        ];

        for (const ignored of ignoredErrors) {
            if (message.includes(ignored)) {
                return null;
            }
        }
    }

    // Redact sensitive data
    if (event.request?.data) {
        const data = event.request.data;
        if (typeof data === 'string' && data.includes('password')) {
            event.request.data = '[REDACTED]';
        }
    }

    return event;
}

/**
 * Set user context for error tracking.
 * Call after successful authentication.
 */
export function setUserContext(
    userId: string | number,
    email?: string,
    username?: string
): void {
    if (!isSentryEnabled()) return;

    Sentry.setUser({
        id: String(userId),
        email,
        username,
    });
}

/**
 * Clear user context.
 * Call on logout.
 */
export function clearUserContext(): void {
    if (!isSentryEnabled()) return;
    Sentry.setUser(null);
}

/**
 * Capture a custom error.
 */
export function captureException(
    error: Error,
    context?: Record<string, any>
): string | undefined {
    if (!isSentryEnabled()) {
        console.error('Uncaught error:', error);
        return undefined;
    }

    return Sentry.captureException(error, {
        extra: context,
    });
}

/**
 * Capture a custom message.
 */
export function captureMessage(
    message: string,
    level: 'info' | 'warning' | 'error' = 'info',
    context?: Record<string, any>
): string | undefined {
    if (!isSentryEnabled()) {
        console.log(`[${level}]`, message);
        return undefined;
    }

    return Sentry.captureMessage(message, {
        level,
        extra: context,
    });
}

/**
 * Add a breadcrumb for debugging context.
 */
export function addBreadcrumb(
    message: string,
    category: string = 'custom',
    level: 'debug' | 'info' | 'warning' | 'error' = 'info',
    data?: Record<string, any>
): void {
    if (!isSentryEnabled()) return;

    Sentry.addBreadcrumb({
        message,
        category,
        level,
        data,
    });
}

/**
 * Set a tag for filtering/grouping errors.
 */
export function setTag(key: string, value: string): void {
    if (!isSentryEnabled()) return;
    Sentry.setTag(key, value);
}

/**
 * Set additional context for debugging.
 */
export function setContext(name: string, data: Record<string, any>): void {
    if (!isSentryEnabled()) return;
    Sentry.setContext(name, data);
}

/**
 * Wrap a component with Sentry error boundary.
 * Use this for critical components that should show fallback UI on error.
 */
export function withSentryErrorBoundary<P extends object>(
    Component: React.ComponentType<P>,
    fallback: React.ReactNode
): React.ComponentType<P> {
    if (!isSentryEnabled()) return Component;

    return Sentry.withErrorBoundary(Component, {
        fallback,
        showDialog: true,
    });
}

/**
 * Create a Sentry error boundary component.
 * Use this to wrap sections of your app.
 */
export const SentryErrorBoundary = isSentryEnabled()
    ? Sentry.ErrorBoundary
    : ({ children }: { children: React.ReactNode }) => children;

/**
 * Show user feedback dialog.
 * Call this when you want to collect user feedback about an error.
 */
export function showReportDialog(eventId?: string): void {
    if (!isSentryEnabled()) return;

    Sentry.showReportDialog({
        eventId: eventId || Sentry.lastEventId(),
        title: 'Something went wrong',
        subtitle: 'Our team has been notified.',
        subtitle2: 'If you\'d like to help, tell us what happened below.',
        labelName: 'Name',
        labelEmail: 'Email',
        labelComments: 'What happened?',
        labelClose: 'Close',
        labelSubmit: 'Submit',
        successMessage: 'Thank you for your feedback!',
    });
}

/**
 * Performance monitoring: Start a transaction.
 */
export function startTransaction(
    name: string,
    op: string = 'custom'
): any {
    if (!isSentryEnabled()) return null;

    return Sentry.startTransaction({
        name,
        op,
    });
}

/**
 * Performance monitoring: Create a span within a transaction.
 */
export function startSpan(
    transaction: any,
    description: string,
    op: string = 'custom'
): any {
    if (!transaction) return null;

    return transaction.startChild({
        description,
        op,
    });
}
