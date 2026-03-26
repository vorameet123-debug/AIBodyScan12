import axios from 'axios';
import { API_BASE_URL } from '../config/apiConfig';

// Payment Plan Types
export type PlanId = 'free' | 'pro' | 'enterprise';
export type BillingCycle = 'monthly' | 'yearly';

// Razorpay Order Response
export interface RazorpayOrderResponse {
    order_id: string;
    amount: number;
    currency: string;
    receipt: string;
}

// Payment Verification Request
export interface PaymentVerificationData {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    plan_id: string;
    billing_cycle: string;
}

// Subscription Status
export interface SubscriptionStatus {
    plan_type: 'free' | 'pro' | 'premium';
    access_expires_at: string | null;
    is_active: boolean;
    days_remaining: number | null;
}

class PaymentService {
    /**
     * Create a Razorpay order for subscription payment
     */
    async createOrder(planId: PlanId, billingCycle: BillingCycle): Promise<RazorpayOrderResponse> {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/v1/payments/create-order`, {
                plan_id: planId,
                billing_cycle: billingCycle,
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                },
            });

            return response.data;
        } catch (error: any) {
            console.error('Failed to create order:', error);
            throw new Error(error.response?.data?.detail || 'Failed to create payment order');
        }
    }

    /**
     * Verify payment after successful Razorpay checkout
     */
    async verifyPayment(data: PaymentVerificationData): Promise<{ success: boolean; message: string }> {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/v1/payments/verify`, data, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                },
            });

            return response.data;
        } catch (error: any) {
            console.error('Payment verification failed:', error);
            throw new Error(error.response?.data?.detail || 'Payment verification failed');
        }
    }

    /**
     * Get user's current subscription status
     */
    async getSubscriptionStatus(): Promise<SubscriptionStatus> {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/v1/payments/subscription-status`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                },
            });

            return response.data;
        } catch (error: any) {
            console.error('Failed to fetch subscription status:', error);
            throw new Error(error.response?.data?.detail || 'Failed to fetch subscription status');
        }
    }

    /**
     * Initialize Razorpay checkout and handle payment
     */
    async initiateCheckout(
        planId: PlanId,
        billingCycle: BillingCycle,
        onSuccess: () => void,
        onFailure: (error: string) => void
    ): Promise<void> {
        try {
            // Step 1: Create order on backend
            const orderData = await this.createOrder(planId, billingCycle);

            // Step 2: Get user details from localStorage (or pass as param)
            const userEmail = localStorage.getItem('userEmail') || '';
            const userName = localStorage.getItem('userName') || '';

            // Step 3: Configure Razorpay options
            const options = {
                key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_placeholder', // Will be set when you get keys
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'BodyScan AI',
                description: `${planId.charAt(0).toUpperCase() + planId.slice(1)} Plan - ${billingCycle}`,
                order_id: orderData.order_id,
                prefill: {
                    email: userEmail,
                    name: userName,
                },
                theme: {
                    color: '#8B5CF6', // Violet theme color
                },
                handler: async (response: any) => {
                    try {
                        // Step 4: Verify payment on backend
                        await this.verifyPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            plan_id: planId,
                            billing_cycle: billingCycle,
                        });

                        onSuccess();
                    } catch (error: any) {
                        onFailure(error.message);
                    }
                },
                modal: {
                    ondismiss: () => {
                        onFailure('Payment cancelled by user');
                    },
                },
            };

            // Step 5: Open Razorpay checkout
            const razorpay = new (window as any).Razorpay(options);
            razorpay.open();
        } catch (error: any) {
            onFailure(error.message);
        }
    }
}

export const paymentService = new PaymentService();
