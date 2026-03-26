// Wardrobe Analytics Data Types

export interface WardrobeComposition {
    total_items: number;
    by_type: Record<string, number>;
    by_color: Record<string, number>;
}

export interface WardrobeConversion {
    purchased: number;
    wishlist: number;
    conversion_rate: number;
    avg_purchased_score?: number;
}

export interface FitHistoryItem {
    garment: string;
    score: number;
    date: string;
    purchased: boolean;
    wishlist?: boolean;
}

export interface WardrobeGap {
    item: string;
    reason: string;
    priority?: string;
}

export interface WishlistItem {
    garment: string;
    brand?: string;
    size?: string;
    color?: string;
    fit_score?: number;
    purchased?: boolean;
    date_added?: string;
}

export interface WardrobeAnalyticsData {
    composition: WardrobeComposition;
    conversion: WardrobeConversion;
    fit_history: FitHistoryItem[];
    wishlist: WishlistItem[];
    gaps: WardrobeGap[];
}

// Color Palette Types
export interface ColorData {
    dominant_colors: Array<{
        color: string;
        hex: string;
        percentage: number;
    }>;
    color_harmony: string;
    recommendations: string[];
}

// Trend Types
export interface ExternalTrendItem {
    name: string;
    popularity_score: number;
    trend_direction: string;
    data?: {
        description?: string;
        why_trending?: string;
    };
}

export interface ApiError {
    response?: {
        data?: {
            detail?: string;
        };
    };
    message?: string;
}
