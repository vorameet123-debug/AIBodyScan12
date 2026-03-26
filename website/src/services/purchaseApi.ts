/**
 * Purchase Tracking TypeScript Interfaces and API Methods
 */
import axios from 'axios';
import { API_BASE_URL } from '../config/apiConfig';

// Configure axios to skip ngrok browser warning
axios.defaults.headers.common['ngrok-skip-browser-warning'] = 'true';

// API Methods
export const PurchaseAPI = {
    markAsPurchased: async (checkId: number, purchased: boolean): Promise<any> => {
        const response = await axios.post(
            `${API_BASE_URL}/api/v1/wardrobe/mark-purchased/${checkId}?purchased=${purchased}`
        );
        return response.data;
    },

    setPurchaseIntent: async (checkId: number, intent: 'yes' | 'maybe' | 'no'): Promise<any> => {
        const response = await axios.post(
            `${API_BASE_URL}/api/v1/wardrobe/purchase-intent/${checkId}?intent=${intent}`
        );
        return response.data;
    },
};
