import React, { useState, useEffect, useRef } from 'react';

interface OptimizedImageProps {
    src: string;
    alt: string;
    className?: string;
    width?: number;
    height?: number;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    onLoad?: () => void;
    onError?: () => void;
}

/**
 * Optimized Image Component
 * - Lazy loading with IntersectionObserver
 * - WebP support detection
 * - Blur placeholder while loading
 * - Error fallback
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
    src,
    alt,
    className = '',
    width,
    height,
    loading = 'lazy',
    placeholder = 'blur',
    onLoad,
    onError,
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [isInView, setIsInView] = useState(loading === 'eager');
    const imgRef = useRef<HTMLImageElement>(null);

    // Intersection Observer for lazy loading
    useEffect(() => {
        if (loading === 'eager') return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsInView(true);
                        observer.disconnect();
                    }
                });
            },
            {
                rootMargin: '100px', // Preload when 100px from viewport
                threshold: 0.01,
            }
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => observer.disconnect();
    }, [loading]);

    const handleLoad = () => {
        setIsLoaded(true);
        onLoad?.();
    };

    const handleError = () => {
        setHasError(true);
        onError?.();
    };

    // Error fallback
    if (hasError) {
        return (
            <div
                className={`bg-slate-800 flex items-center justify-center ${className}`}
                style={{ width, height }}
                role="img"
                aria-label={alt}
            >
                <span className="text-slate-500 text-sm">Failed to load image</span>
            </div>
        );
    }

    return (
        <div
            ref={imgRef}
            className={`relative overflow-hidden ${className}`}
            style={{ width, height }}
        >
            {/* Blur placeholder */}
            {placeholder === 'blur' && !isLoaded && (
                <div
                    className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-800 animate-pulse"
                    aria-hidden="true"
                />
            )}

            {/* Actual image */}
            {isInView && (
                <img
                    src={src}
                    alt={alt}
                    width={width}
                    height={height}
                    loading={loading}
                    onLoad={handleLoad}
                    onError={handleError}
                    className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'
                        } ${className}`}
                    decoding="async"
                />
            )}
        </div>
    );
};

/**
 * Check if WebP is supported
 */
export const supportsWebP = (): Promise<boolean> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img.width > 0 && img.height > 0);
        img.onerror = () => resolve(false);
        img.src = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';
    });
};

/**
 * Get optimized image URL (for future CDN integration)
 */
export const getOptimizedImageUrl = (
    src: string,
    options?: { width?: number; height?: number; quality?: number }
): string => {
    // For now, return original src
    // In production, this would return CDN URL with transformations
    // e.g., Cloudinary, imgix, or custom image service
    return src;
};

export default OptimizedImage;
