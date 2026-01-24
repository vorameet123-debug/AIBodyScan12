/**
 * Purchase Tracking TypeScript Interfaces and API Methods
 */
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

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
