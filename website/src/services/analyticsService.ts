/**
 * Analytics Service
 * 
 * Supports Google Analytics 4 and Plausible Analytics.
 * Privacy-focused with user consent management.
 */

// Analytics configuration
interface AnalyticsConfig {
    googleAnalyticsId?: string;
    plausibleDomain?: string;
    enabledByDefault: boolean;
}

const config: AnalyticsConfig = {
    googleAnalyticsId: process.env.REACT_APP_GA_MEASUREMENT_ID,
    plausibleDomain: process.env.REACT_APP_PLAUSIBLE_DOMAIN,
    enabledByDefault: false, // Respect privacy by default
};

// Consent state
let hasConsent = false;
let isInitialized = false;

/**
 * Initialize analytics with user consent
 */
export const initAnalytics = (userConsent: boolean = false): void => {
    hasConsent = userConsent;

    if (isInitialized) return;

    // Google Analytics 4
    if (config.googleAnalyticsId && hasConsent) {
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${config.googleAnalyticsId}`;
        document.head.appendChild(script);

        window.dataLayer = window.dataLayer || [];
        function gtag(...args: any[]) {
            window.dataLayer.push(args);
        }
        gtag('js', new Date());
        gtag('config', config.googleAnalyticsId, {
            anonymize_ip: true,
            cookie_flags: 'SameSite=Strict;Secure',
        });

        (window as any).gtag = gtag;
    }

    // Plausible (privacy-friendly, no consent needed)
    if (config.plausibleDomain) {
        const script = document.createElement('script');
        script.defer = true;
        script.dataset.domain = config.plausibleDomain;
        script.src = 'https://plausible.io/js/script.js';
        document.head.appendChild(script);
    }

    isInitialized = true;
};

/**
 * Track page view
 */
export const trackPageView = (path: string, title?: string): void => {
    // Google Analytics
    if ((window as any).gtag && hasConsent) {
        (window as any).gtag('event', 'page_view', {
            page_path: path,
            page_title: title,
        });
    }

    // Plausible
    if ((window as any).plausible) {
        (window as any).plausible('pageview', { props: { path } });
    }
};

/**
 * Track custom event
 */
export const trackEvent = (
    eventName: string,
    params?: Record<string, any>
): void => {
    // Google Analytics
    if ((window as any).gtag && hasConsent) {
        (window as any).gtag('event', eventName, params);
    }

    // Plausible
    if ((window as any).plausible) {
        (window as any).plausible(eventName, { props: params });
    }
};

/**
 * Track conversion events
 */
export const trackConversion = (conversionId: string, value?: number): void => {
    if ((window as any).gtag && hasConsent) {
        (window as any).gtag('event', 'conversion', {
            send_to: conversionId,
            value: value,
            currency: 'INR',
        });
    }
};

// Predefined event helpers
export const analytics = {
    // User events
    signUp: () => trackEvent('sign_up'),
    login: (method: string) => trackEvent('login', { method }),

    // Body scan events
    bodyScanStarted: () => trackEvent('body_scan_started'),
    bodyScanCompleted: () => trackEvent('body_scan_completed'),
    measurementSaved: () => trackEvent('measurement_saved'),

    // Wardrobe events
    itemAdded: (category: string) => trackEvent('wardrobe_item_added', { category }),
    outfitCreated: () => trackEvent('outfit_created'),

    // Subscription events
    subscriptionStarted: (plan: string) => trackEvent('subscription_started', { plan }),
    subscriptionPurchased: (plan: string, value: number) => {
        trackEvent('purchase', { plan, value, currency: 'INR' });
        trackConversion('AW-CONVERSION_ID', value);
    },

    // Feature usage
    featureUsed: (feature: string) => trackEvent('feature_used', { feature }),
};

// TypeScript declarations
declare global {
    interface Window {
        dataLayer: any[];
        gtag: (...args: any[]) => void;
        plausible: (event: string, options?: any) => void;
    }
}

export default analytics;
