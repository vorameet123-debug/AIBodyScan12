/**
 * Fashion IQ TypeScript Interfaces and API Methods
 */
import axios from 'axios';

// TypeScript Interfaces
export interface Badge {
    name: string;
    description: string;
    icon: string;
}

export interface FashionIQData {
    overall_score: number;
    fit_knowledge: number;
    style_consistency: number;
    trend_awareness: number;
    level: 'Novice' | 'Learner' | 'Expert' | 'Master';
    badges: Badge[];
    total_checks: number;
    last_calculated?: string;
}

export interface FashionIQResponse {
    success: boolean;
    data: FashionIQData;
}

export interface LeaderboardEntry {
    rank: number;
    user_id: number;
    user_name: string;
    overall_score: number;
    level: string;
    total_checks: number;
}

export interface LeaderboardResponse {
    success: boolean;
    leaderboard: LeaderboardEntry[];
    total_users: number;
}

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// API Methods
export const FashionIQAPI = {
    getFashionIQ: async (userId: number): Promise<FashionIQResponse> => {
        const response = await axios.get<FashionIQResponse>(`${API_BASE_URL}/api/v1/fashion-iq/${userId}`);
        return response.data;
    },

    getLeaderboard: async (limit: number = 10): Promise<LeaderboardResponse> => {
        const response = await axios.get<LeaderboardResponse>(`${API_BASE_URL}/api/v1/fashion-iq/leaderboard?limit=${limit}`);
        return response.data;
    },

    recalculateFashionIQ: async (userId: number): Promise<any> => {
        const response = await axios.post(`${API_BASE_URL}/api/v1/fashion-iq/recalculate/${userId}`);
        return response.data;
    },
};
