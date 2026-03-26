/**
 * Trend Intelligence API Service
 * Handles all API calls related to trend analysis
 */
import api from './api';

// Type Definitions
export interface TrendingItem {
    item: string;
    current_checks: number;
    previous_checks: number;
    velocity: number;
    trend: 'rising' | 'stable' | 'falling';
    change: number;
}

export interface CurrentTrendsResponse {
    success: boolean;
    trends: TrendingItem[];
    period_days: number;
    total_trending: number;
}

export interface StyleTrends {
    trending_styles: Record<string, number>;
    trending_colors: Record<string, number>;
    total_checks: number;
    period_days: number;
}

export interface StyleTrendsResponse {
    success: boolean;
    style_trends: StyleTrends;
}

export interface TrendAlignment {
    alignment_score: number;
    trending_items_checked: string[];
    trending_items_missed: string[];
    total_trending: number;
    user_checked: number;
    user_total_checks?: number;
    message?: string;
}

export interface TrendAlignmentResponse {
    success: boolean;
    alignment: TrendAlignment;
}

export interface TrendForecast {
    item: string;
    current_velocity: number;
    previous_velocity: number;
    acceleration: number;
    forecast: 'rising' | 'falling';
    confidence: number;
}

export interface ShapeChange {
    from_shape: string;
    to_shape: string;
    confidence: number;
    change_date: string;
    measurement_id: number;
    from_measurement_id?: number;
}

export interface BodyInsights {
    shape_changes: ShapeChange[];
    latest_shape: string;
}

export interface TrendForecastResponse {
    success: boolean;
    forecasts: TrendForecast[];
    total_forecasts: number;
}

// API Methods
export const TrendAPI = {
    /**
     * Get currently trending items
     */
    getCurrentTrends: async (days: number = 7, minVelocity: number = 20.0): Promise<CurrentTrendsResponse> => {
        const response = await api.get<CurrentTrendsResponse>(
            `/api/v1/trends/current`,
            {
                params: { days, min_velocity: minVelocity }
            }
        );
        return response.data;
    },

    /**
     * Get user's alignment with current trends
     */
    getUserAlignment: async (userId: number, days: number = 7): Promise<TrendAlignmentResponse> => {
        const response = await api.get<TrendAlignmentResponse>(
            `/api/v1/trends/user-alignment/${userId}`,
            {
                params: { days }
            }
        );
        return response.data;
    },

    /**
     * Get trending styles and colors
     */
    getStyleTrends: async (days: number = 30): Promise<StyleTrendsResponse> => {
        const response = await api.get<StyleTrendsResponse>(
            `/api/v1/trends/styles`,
            {
                params: { days }
            }
        );
        return response.data;
    },

    /**
     * Get trend forecasts
     */
    getTrendForecast: async (days: number = 7): Promise<TrendForecastResponse> => {
        const response = await api.get<TrendForecastResponse>(
            `/api/v1/trends/forecast`,
            {
                params: { days }
            }
        );
        return response.data;
    },

    /**
     * Get personalized trends for user
     */
    getTrendsForUser: async (userId: number, days: number = 7, minMatch: number = 60): Promise<any> => {
        const response = await api.get(
            `/api/v1/trends/for-you/${userId}`,
            {
                params: { days, min_match: minMatch }
            }
        );
        return response.data;
    },

    /**
     * Get combined internal and external trends
     */
    getCombinedTrends: async (days: number = 7): Promise<any> => {
        const response = await api.get(
            `/api/v1/trends/combined`,
            {
                params: { days }
            }
        );
        return response.data;
    },

    /**
     * Get detailed explanation for a trend
     */
    explainTrend: async (userId: number, item: string): Promise<any> => {
        const response = await api.get(
            `/api/v1/trends/explain/${userId}`,
            {
                params: { item }
            }
        );
        return response.data;
    },

    /**
     * Trigger external trend analysis using AI
     */
    analyzeExternalTrends: async (season?: string, category?: string): Promise<any> => {
        const response = await api.post(
            `/api/v1/trends/analyze-external`,
            null,
            {
                params: { season, category }
            }
        );
        return response.data;
    },
};
