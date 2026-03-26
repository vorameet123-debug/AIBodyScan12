/**
 * Wardrobe Analytics TypeScript Interfaces and API Methods
 */
import axios from 'axios';
import { API_BASE_URL } from '../config/apiConfig';

// Interfaces
export interface WardrobeComposition {
    total_items: number;
    by_type: { [key: string]: number };
    by_color: { [key: string]: number };
    percentages: { [key: string]: number };
    filter_applied: string;
}

export interface ColorDistribution {
    distribution: { [key: string]: number };
    percentages: { [key: string]: number };
    dominant_color: string | null;
    filter_applied: string;
}

export interface FitScoreHistory {
    date: string;
    score: number;
    garment: string;
    purchased: boolean;
}

export interface WardrobeGap {
    item: string;
    category: string;
    reason: string;
    priority: string;
}

export interface WishlistItem {
    id: number;
    garment: string;
    size: string;
    score: number;
    color: string;
    checked_at: string;
    days_ago: number;
}

export interface ConversionStats {
    total_checks: number;
    purchased: number;
    wishlist: number;
    conversion_rate: number;
    avg_purchased_score: number;
}

export interface WardrobeAnalyticsData {
    composition: WardrobeComposition;
    colors: ColorDistribution;
    fit_history: FitScoreHistory[];
    gaps: WardrobeGap[];
    wishlist: WishlistItem[];
    conversion: ConversionStats;
}

export interface WardrobeAnalyticsResponse {
    success: boolean;
    data: WardrobeAnalyticsData;
}

// API Methods
export const WardrobeAPI = {
    getAnalytics: async (userId: number, filter: string = 'all'): Promise<WardrobeAnalyticsResponse> => {
        const response = await axios.get<WardrobeAnalyticsResponse>(
            `${API_BASE_URL}/api/v1/wardrobe/analytics/${userId}?filter=${filter}`
        );
        return response.data;
    },

    getComposition: async (userId: number, filter: string = 'all'): Promise<any> => {
        const response = await axios.get(
            `${API_BASE_URL}/api/v1/wardrobe/composition/${userId}?filter=${filter}`
        );
        return response.data;
    },

    getWishlist: async (userId: number): Promise<any> => {
        const response = await axios.get(`${API_BASE_URL}/api/v1/wardrobe/wishlist/${userId}`);
        return response.data;
    },
};
