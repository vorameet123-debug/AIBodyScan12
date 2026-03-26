/**
 * PaymentService Tests
 * Tests payment flow: order creation, verification, and subscription status
 */

// Mock the api module and apiConfig
jest.mock('../../config/apiConfig', () => ({
    API_BASE_URL: 'http://localhost:8000',
}));

// Mock axios — payment service imports it directly
const mockAxiosPost = jest.fn();
const mockAxiosGet = jest.fn();
jest.mock('axios', () => ({
    __esModule: true,
    default: {
        post: (...args: any[]) => mockAxiosPost(...args),
        get: (...args: any[]) => mockAxiosGet(...args),
        create: jest.fn(() => ({
            defaults: { headers: { common: {} } },
        })),
    },
    post: (...args: any[]) => mockAxiosPost(...args),
    get: (...args: any[]) => mockAxiosGet(...args),
}));

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: jest.fn((key: string) => store[key] || null),
        setItem: jest.fn((key: string, value: string) => { store[key] = value; }),
        removeItem: jest.fn((key: string) => { delete store[key]; }),
        clear: jest.fn(() => { store = {}; }),
    };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

import { paymentService } from '../../services/paymentService';

describe('PaymentService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorageMock.clear();
        localStorageMock.getItem.mockReturnValue('test-auth-token');
    });

    describe('createOrder', () => {
        it('creates a payment order successfully', async () => {
            const mockResponse = {
                data: {
                    order_id: 'order_test123',
                    amount: 99900,
                    currency: 'INR',
                    receipt: 'receipt_123',
                },
            };
            mockAxiosPost.mockResolvedValue(mockResponse);

            const result = await paymentService.createOrder('pro', 'monthly');

            expect(mockAxiosPost).toHaveBeenCalledWith(
                expect.stringContaining('/api/v1/payments/create-order'),
                { plan_id: 'pro', billing_cycle: 'monthly' },
                expect.objectContaining({
                    headers: expect.objectContaining({
                        Authorization: 'Bearer test-auth-token',
                    }),
                })
            );
            expect(result.order_id).toBe('order_test123');
            expect(result.amount).toBe(99900);
        });

        it('throws error on failed order creation', async () => {
            mockAxiosPost.mockRejectedValue({
                response: { data: { detail: 'Payment service unavailable' } },
            });

            await expect(paymentService.createOrder('pro', 'monthly'))
                .rejects.toThrow('Payment service unavailable');
        });

        it('sends auth token from localStorage', async () => {
            localStorageMock.getItem.mockReturnValue('my-jwt-token');
            mockAxiosPost.mockResolvedValue({ data: { order_id: 'test' } });

            await paymentService.createOrder('pro', 'monthly');

            expect(mockAxiosPost).toHaveBeenCalledWith(
                expect.any(String),
                expect.any(Object),
                expect.objectContaining({
                    headers: { Authorization: 'Bearer my-jwt-token' },
                })
            );
        });
    });

    describe('verifyPayment', () => {
        it('verifies payment successfully', async () => {
            const mockResponse = {
                data: { success: true, message: 'Payment successful!' },
            };
            mockAxiosPost.mockResolvedValue(mockResponse);

            const result = await paymentService.verifyPayment({
                razorpay_order_id: 'order_123',
                razorpay_payment_id: 'pay_123',
                razorpay_signature: 'sig_123',
                plan_id: 'pro',
                billing_cycle: 'monthly',
            });

            expect(result.success).toBe(true);
            expect(mockAxiosPost).toHaveBeenCalledWith(
                expect.stringContaining('/api/v1/payments/verify'),
                expect.objectContaining({
                    razorpay_order_id: 'order_123',
                    razorpay_payment_id: 'pay_123',
                }),
                expect.any(Object)
            );
        });

        it('throws error on verification failure', async () => {
            mockAxiosPost.mockRejectedValue({
                response: { data: { detail: 'Invalid payment signature' } },
            });

            await expect(paymentService.verifyPayment({
                razorpay_order_id: 'order_123',
                razorpay_payment_id: 'pay_123',
                razorpay_signature: 'bad_sig',
                plan_id: 'pro',
                billing_cycle: 'monthly',
            })).rejects.toThrow('Invalid payment signature');
        });
    });

    describe('getSubscriptionStatus', () => {
        it('fetches subscription status', async () => {
            const mockResponse = {
                data: {
                    plan_type: 'premium',
                    is_active: true,
                    days_remaining: 25,
                    access_expires_at: '2026-04-01T00:00:00Z',
                },
            };
            mockAxiosGet.mockResolvedValue(mockResponse);

            const result = await paymentService.getSubscriptionStatus();

            expect(result.plan_type).toBe('premium');
            expect(result.is_active).toBe(true);
            expect(result.days_remaining).toBe(25);
        });

        it('returns free plan when no subscription', async () => {
            mockAxiosGet.mockResolvedValue({
                data: {
                    plan_type: 'free',
                    is_active: true,
                    days_remaining: null,
                    access_expires_at: null,
                },
            });

            const result = await paymentService.getSubscriptionStatus();
            expect(result.plan_type).toBe('free');
            expect(result.days_remaining).toBeNull();
        });
    });
});
