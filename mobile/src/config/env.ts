/**
 * API & App Configuration
 *
 * DEV SETUP:
 *   1. Find your machine's local IP:
 *      - Windows:  ipconfig → look for "IPv4 Address" under Wi-Fi/Ethernet
 *      - Mac/Linux: ifconfig | grep inet
 *   2. Replace the IP below with your machine's IP
 *   3. Make sure your phone and computer are on the SAME Wi-Fi network
 *   4. Backend must be running on port 8000 (python api/app.py)
 *
 * PRODUCTION:
 *   - Set your real API domain below in the production branch
 */
import Constants from 'expo-constants';

// Detect environment
const isProduction = Constants.expoConfig?.extra?.eas?.projectId
    && !__DEV__;

// ─── API URL ───────────────────────────────────────────
// Auto-detect dev machine IP from Expo's debugger connection
// No need to manually update IP anymore!
const getDevApiUrl = (): string => {
    // Expo Go knows the dev machine IP via debuggerHost
    const debuggerHost = Constants.expoConfig?.hostUri
        || (Constants as any).manifest?.debuggerHost;
    if (debuggerHost) {
        const ip = debuggerHost.split(':')[0]; // extract IP without port
        return `http://${ip}:8000`;
    }
    // Fallback: manual IP (only needed if auto-detect fails)
    return 'http://10.201.127.213:8000';
};

export const API_URL = __DEV__
    ? getDevApiUrl()
    : 'https://api.aibodyscan.com';

// ─── App Config ────────────────────────────────────────
export const APP_CONFIG = {
    appName: 'AIBodyScan',
    version: Constants.expoConfig?.version || '1.0.0',
    supportEmail: 'aibodyscan123@gmail.com',
};

// ─── Feature Flags ─────────────────────────────────────
export const FEATURES = {
    enable3DModel: true,
    enableFashionIQ: true,
    enableTrends: true,
};

// ─── Razorpay Configuration ────────────────────────────
export const RAZORPAY_KEY = __DEV__
    ? 'rzp_test_S9zotWhZ4RJjOM'  // Razorpay TEST key
    : 'rzp_live_xxx'; // Replace with your Razorpay LIVE key before production

// ─── Google OAuth Configuration ────────────────────────
export const GOOGLE_OAUTH = {
    webClientId: '643891790108-lcj3pd5fllo90ai6hord7j2q44sh1c65.apps.googleusercontent.com',
};
