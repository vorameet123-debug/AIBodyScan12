/**
 * Body Intelligence TypeScript Interfaces and API Methods
 */
import axios from 'axios';
import { API_BASE_URL } from '../config/apiConfig';

// Configure axios to skip ngrok browser warning
axios.defaults.headers.common['ngrok-skip-browser-warning'] = 'true';

// Interfaces
export interface MeasurementPoint {
    id: number;
    date: string;
    chest: number | null;
    waist: number | null;
    hips: number | null;
    weight: number | null;
    height: number | null;
    name: string | null;
}

export interface TrendData {
    change: number;
    percentage: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    latest: number;
    oldest: number;
}

export type SizeData = string | {
    recommended_size?: string;
    size?: string;
    [key: string]: string | number | undefined;
};

export interface TrendsResponse {
    period: string;
    trends: {
        [key: string]: TrendData;
    };
}

export interface ComparisonData {
    measurement1: {
        id: number;
        date: string;
        name: string | null;
    };
    measurement2: {
        id: number;
        date: string;
        name: string | null;
    };
    differences: {
        [key: string]: {
            before: number;
            after: number;
            change: number;
            percentage: number;
        };
    };
}

export interface BodyShape {
    shape: string;
    confidence: number;
    ratios: {
        waist_to_hip: number;
        waist_to_chest: number;
        chest_to_hip: number;
    };
}

export interface BodyPattern {
    pattern: string;
    description: string;
    confidence: 'high' | 'medium' | 'low';
    change: number;
}

export interface TrendVelocity {
    [key: string]: {
        velocity: number;  // Per month
        acceleration: number;  // Per month
        direction: 'increasing' | 'decreasing' | 'stable';
        trend: 'accelerating' | 'decelerating' | 'constant';
    };
}

export interface SizeChange {
    before: SizeData;
    after: SizeData;
    changed: boolean;
    date?: string;
}

export interface SizeChanges {
    first_measurement_date?: string;
    latest_measurement_date?: string;
    changes?: {
        [category: string]: SizeChange;
    };
    total_changes?: number;
    message?: string;  // Error message when insufficient data
}

export interface ProgressSummary {
    total_measurements: number;
    first_measurement: string | null;
    latest_measurement: string | null;
    trends: {
        [key: string]: TrendData;
    };
    significant_changes: string[];
    period_analyzed: string;
    overall_progress?: {
        [key: string]: {
            before: number;
            after: number;
            change: number;
            percentage: number;
        };
    };
    body_shape?: BodyShape;
    pattern_insights?: BodyPattern[];
    trend_velocity?: TrendVelocity;
    size_recommendation_changes?: SizeChanges;
}

// API Methods
export const BodyIntelligenceAPI = {
    getHistory: async (userId: number, days: number = 90, personName?: string): Promise<MeasurementPoint[]> => {
        const params = new URLSearchParams({ days: days.toString() });
        if (personName) {
            params.append('person_name', personName);
        }
        const response = await axios.get(
            `${API_BASE_URL}/api/v1/body/history/${userId}?${params.toString()}`
        );
        return response.data.data;
    },

    getTrends: async (userId: number, lookback: number = 5): Promise<{ trends: TrendsResponse; significant_changes: string[] }> => {
        const response = await axios.get(
            `${API_BASE_URL}/api/v1/body/trends/${userId}?lookback=${lookback}`
        );
        return {
            trends: response.data.trends,
            significant_changes: response.data.significant_changes
        };
    },

    getComparison: async (userId: number, id1: number, id2: number): Promise<ComparisonData> => {
        const response = await axios.get(
            `${API_BASE_URL}/api/v1/body/comparison/${userId}?id1=${id1}&id2=${id2}`
        );
        return response.data.comparison;
    },

    getProgress: async (userId: number, personName?: string): Promise<ProgressSummary> => {
        const params = personName ? `?person_name=${encodeURIComponent(personName)}` : '';
        const response = await axios.get(
            `${API_BASE_URL}/api/v1/body/progress/${userId}${params}`
        );
        return response.data.summary;
    },

    getBodyShape: async (userId: number): Promise<BodyShape> => {
        const response = await axios.get(
            `${API_BASE_URL}/api/v1/body/body-shape/${userId}`
        );
        return response.data.body_shape;
    },

    getBodyPatterns: async (userId: number): Promise<BodyPattern[]> => {
        const response = await axios.get(
            `${API_BASE_URL}/api/v1/body/patterns/${userId}`
        );
        return response.data.patterns;
    },

    getTrendVelocity: async (userId: number): Promise<TrendVelocity> => {
        const response = await axios.get(
            `${API_BASE_URL}/api/v1/body/velocity/${userId}`
        );
        return response.data.velocity;
    },

    getSizeChanges: async (userId: number): Promise<SizeChanges> => {
        const response = await axios.get(
            `${API_BASE_URL}/api/v1/body/size-changes/${userId}`
        );
        return response.data.size_changes;
    },
};
