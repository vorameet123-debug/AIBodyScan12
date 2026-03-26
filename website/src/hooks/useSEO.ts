import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../services/analyticsService';

/**
 * Hook to track page views on route changes
 */
export const usePageTracking = (): void => {
    const location = useLocation();

    useEffect(() => {
        // Track page view on route change
        trackPageView(location.pathname + location.search, document.title);
    }, [location]);
};

/**
 * Hook to update document title and meta tags
 */
export const useSEO = (options: {
    title: string;
    description?: string;
    canonical?: string;
    image?: string;
}): void => {
    useEffect(() => {
        // Update title
        document.title = options.title ? `${options.title} | AIBodyScan` : 'AIBodyScan';

        // Update meta description
        if (options.description) {
            let metaDescription = document.querySelector('meta[name="description"]');
            if (!metaDescription) {
                metaDescription = document.createElement('meta');
                metaDescription.setAttribute('name', 'description');
                document.head.appendChild(metaDescription);
            }
            metaDescription.setAttribute('content', options.description);
        }

        // Update canonical URL
        if (options.canonical) {
            let canonicalLink = document.querySelector('link[rel="canonical"]');
            if (!canonicalLink) {
                canonicalLink = document.createElement('link');
                canonicalLink.setAttribute('rel', 'canonical');
                document.head.appendChild(canonicalLink);
            }
            canonicalLink.setAttribute('href', options.canonical);
        }

        // Update OG image
        if (options.image) {
            let ogImage = document.querySelector('meta[property="og:image"]');
            if (!ogImage) {
                ogImage = document.createElement('meta');
                ogImage.setAttribute('property', 'og:image');
                document.head.appendChild(ogImage);
            }
            ogImage.setAttribute('content', options.image);
        }

        // Update OG title
        let ogTitle = document.querySelector('meta[property="og:title"]');
        if (!ogTitle) {
            ogTitle = document.createElement('meta');
            ogTitle.setAttribute('property', 'og:title');
            document.head.appendChild(ogTitle);
        }
        ogTitle.setAttribute('content', options.title || 'AIBodyScan');

        // Update OG description
        if (options.description) {
            let ogDescription = document.querySelector('meta[property="og:description"]');
            if (!ogDescription) {
                ogDescription = document.createElement('meta');
                ogDescription.setAttribute('property', 'og:description');
                document.head.appendChild(ogDescription);
            }
            ogDescription.setAttribute('content', options.description);
        }
    }, [options.title, options.description, options.canonical, options.image]);
};

export default usePageTracking;
