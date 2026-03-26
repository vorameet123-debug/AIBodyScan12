/**
 * API Service for AIBodyScan Mobile
 * Handles all HTTP requests to the backend
 */
import axios, { AxiosInstance, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { API_URL } from '../config/env';

// Platform-aware storage helpers (SecureStore doesn't work on web)
const Storage = {
    getItem: async (key: string): Promise<string | null> => {
        if (Platform.OS === 'web') {
            return localStorage.getItem(key);
        }
        return SecureStore.getItemAsync(key);
    },
    setItem: async (key: string, value: string): Promise<void> => {
        if (Platform.OS === 'web') {
            localStorage.setItem(key, value);
            return;
        }
        return SecureStore.setItemAsync(key, value);
    },
    deleteItem: async (key: string): Promise<void> => {
        if (Platform.OS === 'web') {
            localStorage.removeItem(key);
            return;
        }
        return SecureStore.deleteItemAsync(key);
    },
};

// Token storage keys
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

// Create axios instance
const api: AxiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - add auth token
api.interceptors.request.use(
    async (config) => {
        const token = await Storage.getItem(TOKEN_KEY);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - handle errors
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        if (error.response?.status === 401) {
            // Token expired - clear storage
            await Storage.deleteItem(TOKEN_KEY);
            await Storage.deleteItem(USER_KEY);
        }
        return Promise.reject(error);
    }
);

// Auth API
export const AuthAPI = {
    login: async (email: string, password: string) => {
        try {
            const response = await api.post('/api/v1/auth/login', { email, password });
            return response.data;
        } catch (error: any) {
            throw error;
        }
    },

    register: async (fullname: string, email: string, password: string) => {
        const response = await api.post('/api/v1/auth/register', { fullname, email, password });
        return response.data;
    },

    googleAuth: async (credential: string) => {
        const response = await api.post('/api/v1/auth/google', { credential });
        return response.data;
    },

    getMe: async () => {
        const response = await api.get('/api/v1/auth/me');
        return response.data;
    },

    updateProfile: async (data: { full_name?: string; phone_number?: string }) => {
        const response = await api.put('/api/v1/auth/profile', data);
        return response.data;
    },

    changePassword: async (currentPassword: string, newPassword: string) => {
        const response = await api.post('/api/v1/auth/change-password', {
            current_password: currentPassword,
            new_password: newPassword,
        });
        return response.data;
    },
};

// Body API - aligned with website endpoint
export const BodyAPI = {
    processScan: async (formData: FormData) => {
        const response = await api.post('/api/v1/measurements', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 120000, // 2 minutes for image processing
        });
        return response.data;
    },

    saveMeasurement: async (data: any) => {
        const response = await api.post('/api/v1/measurements/save', data);
        return response.data;
    },

    getHistory: async (limit = 30) => {
        const response = await api.get(`/api/v1/measurements/my-measurements?limit=${limit}`);
        return response.data;
    },

    getMeasurement: async (id: number) => {
        const response = await api.get(`/api/v1/measurements/${id}`);
        return response.data;
    },

    getProgress: async (userId?: number) => {
        const path = userId ? `/api/v1/body/progress/${userId}` : '/api/v1/body/progress';
        const response = await api.get(path);
        return response.data?.summary || response.data;
    },

    deleteMeasurement: async (id: number) => {
        const response = await api.delete(`/api/v1/measurements/${id}`);
        return response.data;
    },

    getBodyShape: async (userId: number) => {
        const response = await api.get(`/api/v1/body/body-shape/${userId}`);
        return response.data?.body_shape || response.data;
    },

    getPatterns: async (userId: number) => {
        const response = await api.get(`/api/v1/body/patterns/${userId}`);
        return response.data?.patterns || response.data;
    },

    getTrendVelocity: async (userId: number) => {
        const response = await api.get(`/api/v1/body/velocity/${userId}`);
        return response.data?.velocity || response.data;
    },

    getHistory2: async (userId: number, days = 90) => {
        const response = await api.get(`/api/v1/body/history/${userId}?days=${days}`);
        return response.data?.data || response.data;
    },
};

// ==========================================
// Wardrobe Analytics Types (matching website wardrobeApi.ts)
// ==========================================
export interface WardrobeComposition {
    total_items: number;
    by_type: { [key: string]: number };
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

// Wardrobe API
export const WardrobeAPI = {
    getItems: async (category?: string) => {
        const url = category ? `/api/v1/wardrobe?category=${category}` : '/api/v1/wardrobe';
        const response = await api.get(url);
        return response.data;
    },

    addItem: async (formData: FormData) => {
        const response = await api.post('/api/v1/wardrobe', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    analyzeItem: async (itemId: number) => {
        const response = await api.get(`/api/v1/wardrobe/${itemId}/analyze`);
        return response.data;
    },

    getAnalytics: async (userId: number, filter: string = 'all') => {
        const response = await api.get(`/api/v1/wardrobe/analytics/${userId}?filter=${filter}`);
        return response.data;
    },
};

// ==========================================
// Trend API Types (matching website trendApi.ts)
// ==========================================
export interface TrendItem {
    item: string;
    description: string;
    popularity_score: number;
    trend_direction: string;
    match_score?: number;
    confidence?: number;
    reasons?: string[];
    velocity?: number;
    change?: number;
}

export interface TrendExplanation {
    why_trending: {
        social_media?: string;
        celebrities?: string[];
        runway?: string;
        blogs?: string;
    };
    why_for_you: {
        body_type?: string;
        style?: string;
        colors?: string;
        overall?: string;
    };
    how_to_style: string[];
    occasions: string[];
    match_score: number;
    confidence: number;
}

export interface ColorTrend {
    color: string;
    hex: string;
    match_score?: number;
    popularity?: number;
    trend_direction?: string;
}

export interface ShapeChange {
    measurement: string;
    change: number;
    trend: string;
    significance: string;
}

export interface BodyInsights {
    shape_changes: ShapeChange[];
    recommendations?: string[];
    latest_shape?: string;
}

// Trend API (matching website trendApi.ts)
export const TrendAPI = {
    getCombinedTrends: async (days: number = 7) => {
        const response = await api.get('/api/v1/trends/combined', { params: { days } });
        return response.data;
    },

    getTrendsForUser: async (userId: number, days: number = 7, minMatch: number = 60) => {
        const response = await api.get(`/api/v1/trends/for-you/${userId}`, {
            params: { days, min_match: minMatch },
        });
        return response.data;
    },

    getStyleTrends: async (days: number = 30) => {
        const response = await api.get('/api/v1/trends/styles', { params: { days } });
        return response.data;
    },

    explainTrend: async (userId: number, item: string) => {
        const response = await api.get(`/api/v1/trends/explain/${userId}`, { params: { item } });
        return response.data;
    },

    analyzeExternalTrends: async (season?: string, category?: string) => {
        const response = await api.post('/api/v1/trends/analyze-external', null, {
            params: { season, category },
        });
        return response.data;
    },
};

// ==========================================
// Clothing Fit Check V2 Types (matching website)
// ==========================================
export interface FitMeter {
    status: string;
    ease: number;
    user_measurement: number;
    garment_measurement: number;
    zone: string;
    score: number;
}

export interface FitMetersResponse {
    fit_meters: { [key: string]: FitMeter };
    overall_fit_score: number;
    worst_metric: string;
}

export interface GarmentAnalysis {
    garment_type: string;
    material: string;
    colors: { rgb: { r: number; g: number; b: number } | number[]; name: string; percentage?: number }[];
    style: string;
    pattern: string;
    fit_type: string;
    formality_level: number;
}

export interface RoastResponse {
    fit_roast: string;
    verdict_stamp: string;
    stamp_color: string;
}

export interface ColorMatchResponse {
    match_score: number;
    roast: string;
    suggested_colors: string[];
    skin_tone: { category: string } | any;
    primary_color: { name: string; rgb: { r: number; g: number; b: number } | any } | any;
}

export interface StyleRecommendationResponse {
    outfit_suggestions: string[];
    style_score: number;
}

export interface OccasionAnalysisResponse {
    occasion_match_score: number;
    is_appropriate: boolean;
    recommendation: string;
    alternative_occasions: string[];
}

export interface FitCheckV2Response {
    success: boolean;
    garment_analysis: GarmentAnalysis;
    fit_meters: FitMetersResponse;
    roast: RoastResponse;
    color_analysis: ColorMatchResponse;
    style_recommendations: StyleRecommendationResponse;
    occasion_analysis: OccasionAnalysisResponse;
    material_comfort: { score: number; description: string };
    overall_score: number;
    size_recommendation?: {
        recommended_size: string;
        recommended_score: number;
        alternatives: Array<{ size: string; score: number; difference: number }>;
    };
    all_sizes?: { [size: string]: number };
    user_selected_size?: string;
    check_id?: number;
}

// Clothing API (V2 — matching website)
export const ClothingAPI = {
    checkClothingFitV2: async (
        productImage: any,
        measurementId: number,
        size: string,
        occasion: string,
        fitType: string = 'slim'
    ): Promise<FitCheckV2Response> => {
        const formData = new FormData();
        if (productImage.uri) {
            const uri = productImage.uri;
            const filename = uri.split('/').pop() || 'photo.jpg';
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : 'image/jpeg';
            formData.append('productImage', { uri, name: filename, type } as any);
        } else {
            formData.append('productImage', productImage);
        }
        formData.append('measurement_id', measurementId.toString());
        formData.append('size', size);
        formData.append('occasion', occasion);
        formData.append('fit_type', fitType);
        const response = await api.post<FitCheckV2Response>('/api/v1/clothing/fit-check', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 120000,
        });
        return response.data;
    },
};

// Fashion API
export const FashionAPI = {
    getIQ: async (userId: number) => {
        const response = await api.get(`/api/v1/fashion-iq/${userId}`);
        return response.data;
    },

    getTrends: async (days: number = 7) => {
        const response = await api.get('/api/v1/trends/combined', { params: { days } });
        return response.data;
    },
};

// Payments API
export const PaymentsAPI = {
    createSubscription: async (data: { plan_id: string; billing_cycle?: 'monthly' | 'yearly' }) => {
        const response = await api.post('/api/v1/payments/create-order', data);
        return response.data;
    },

    verifyPayment: async (data: any) => {
        const response = await api.post('/api/v1/payments/verify', data);
        return response.data;
    },

    getSubscription: async () => {
        const response = await api.get('/api/v1/payments/subscription-status');
        return response.data;
    },

    cancelSubscription: async () => {
        const response = await api.post('/api/v1/payments/cancel-subscription');
        return response.data;
    },
};

// Token management
export const TokenService = {
    getToken: () => Storage.getItem(TOKEN_KEY),
    setToken: (token: string) => Storage.setItem(TOKEN_KEY, token),
    removeToken: () => Storage.deleteItem(TOKEN_KEY),

    getUser: async () => {
        const data = await Storage.getItem(USER_KEY);
        return data ? JSON.parse(data) : null;
    },
    setUser: (user: any) => Storage.setItem(USER_KEY, JSON.stringify(user)),
    removeUser: () => Storage.deleteItem(USER_KEY),
};

export default api;
