/**
 * Auth Store using Zustand
 * Manages authentication state for the app
 */
import { create } from 'zustand';
import { AuthAPI, TokenService } from '../services/api';

interface User {
    id: number;
    email: string;
    fullname: string;
    is_premium: boolean;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    // Actions
    login: (email: string, password: string) => Promise<boolean>;
    register: (fullname: string, email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,

    login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await AuthAPI.login(email, password);
            // Backend returns flat response: { id, email, full_name, access_token, ... }
            await TokenService.setToken(response.access_token);
            const user = {
                id: response.id,
                email: response.email,
                fullname: response.full_name,
                is_premium: response.is_premium || false,
            };
            await TokenService.setUser(user);
            set({ user, isAuthenticated: true, isLoading: false });
            return true;
        } catch (error: any) {
            const message = error.response?.data?.detail || error.message || 'Login failed';
            set({ error: message, isLoading: false });
            return false;
        }
    },

    register: async (fullname: string, email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await AuthAPI.register(fullname, email, password);
            // Backend returns flat response: { id, email, full_name, access_token, ... }
            await TokenService.setToken(response.access_token);
            const user = {
                id: response.id,
                email: response.email,
                fullname: response.full_name,
                is_premium: response.is_premium || false,
            };
            await TokenService.setUser(user);
            set({ user, isAuthenticated: true, isLoading: false });
            return true;
        } catch (error: any) {
            const message = error.response?.data?.detail || error.message || 'Registration failed';
            set({ error: message, isLoading: false });
            return false;
        }
    },

    logout: async () => {
        await TokenService.removeToken();
        await TokenService.removeUser();
        set({ user: null, isAuthenticated: false });
    },

    checkAuth: async () => {
        set({ isLoading: true });
        try {
            const token = await TokenService.getToken();
            if (!token) {
                set({ isAuthenticated: false, isLoading: false });
                return;
            }

            const user = await TokenService.getUser();
            if (user) {
                set({ user, isAuthenticated: true, isLoading: false });
            } else {
                // Validate token with server
                const response = await AuthAPI.getMe();
                await TokenService.setUser(response);
                set({ user: response, isAuthenticated: true, isLoading: false });
            }
        } catch (error) {
            await TokenService.removeToken();
            await TokenService.removeUser();
            set({ isAuthenticated: false, isLoading: false });
        }
    },

    clearError: () => set({ error: null }),
}));

export default useAuthStore;
