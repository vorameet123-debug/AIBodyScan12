/**
 * Google OAuth Hook
 * Uses expo-auth-session for Google Sign-In
 */
import { useState, useEffect } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { AuthAPI, TokenService } from '../services/api';
import { useAuthStore } from '../stores/authStore';

// Complete auth session on web
WebBrowser.maybeCompleteAuthSession();

// Google OAuth Client IDs
// Replace these with your actual Google Cloud Console credentials
const GOOGLE_CLIENT_ID = {
    expoClientId: 'YOUR_EXPO_CLIENT_ID.apps.googleusercontent.com',
    iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
    androidClientId: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',
    webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
};

interface UseGoogleAuthResult {
    signIn: () => Promise<void>;
    isLoading: boolean;
    error: string | null;
}


export const useGoogleAuth = (): UseGoogleAuthResult => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { checkAuth } = useAuthStore();

    const [request, response, promptAsync] = Google.useAuthRequest({
        clientId: GOOGLE_CLIENT_ID.webClientId,
        iosClientId: GOOGLE_CLIENT_ID.iosClientId,
        androidClientId: GOOGLE_CLIENT_ID.androidClientId,
        scopes: ['profile', 'email'],
    });

    useEffect(() => {
        handleGoogleResponse();
    }, [response]);

    const handleGoogleResponse = async () => {
        if (response?.type === 'success') {
            setIsLoading(true);
            setError(null);

            try {
                const { authentication } = response;
                if (authentication?.accessToken) {
                    // Exchange Google token with our backend
                    const result = await AuthAPI.googleAuth(authentication.accessToken);

                    // Store token and user data
                    await TokenService.setToken(result.access_token);
                    await TokenService.setUser(result.user);

                    // Refresh auth state
                    await checkAuth();
                }
            } catch (err: any) {
                const message = err.response?.data?.detail || 'Google sign-in failed';
                setError(message);
            } finally {
                setIsLoading(false);
            }
        } else if (response?.type === 'error') {
            setError(response.error?.message || 'Google sign-in cancelled');
        }
    };

    const signIn = async () => {
        setError(null);
        try {
            await promptAsync();
        } catch (err: any) {
            setError(err.message || 'Failed to start Google sign-in');
        }
    };

    return {
        signIn,
        isLoading,
        error,
    };
};

export default useGoogleAuth;
