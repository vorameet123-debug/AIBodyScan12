/**
 * Auth Flow Tests
 * Tests the AuthServiceClass: login, registration, token management, logout
 */

// Mock the api module (the shared axios instance used by AuthService)
const mockPost = jest.fn();
const mockGet = jest.fn();
jest.mock('../../services/api', () => ({
    __esModule: true,
    default: {
        post: (...args: any[]) => mockPost(...args),
        get: (...args: any[]) => mockGet(...args),
        defaults: { headers: { common: {} } },
    },
}));

// Mock tokenStorage
jest.mock('../../utils/tokenStorage', () => ({
    tokenStorage: {
        getToken: jest.fn(() => null),
        setToken: jest.fn(),
        setRefreshToken: jest.fn(),
        getRefreshToken: jest.fn(() => null),
        clearAll: jest.fn(),
        hasValidToken: jest.fn(() => false),
        isTokenExpired: jest.fn(() => true),
        getTimeUntilExpiry: jest.fn(() => 0),
    },
}));

import { AuthService } from '../../services/auth';

describe('AuthService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('login', () => {
        it('logs in successfully and returns auth response', async () => {
            const mockResponse = {
                data: {
                    id: 1,
                    email: 'test@example.com',
                    full_name: 'Test User',
                    access_token: 'jwt-test-token',
                    token_type: 'bearer',
                },
            };
            mockPost.mockResolvedValue(mockResponse);

            const result = await AuthService.login({
                email: 'test@example.com',
                password: 'password123',
            });

            expect(mockPost).toHaveBeenCalledWith(
                '/api/v1/auth/login',
                { email: 'test@example.com', password: 'password123' }
            );
            expect(result.access_token).toBe('jwt-test-token');
            expect(result.email).toBe('test@example.com');
        });

        it('throws error on invalid credentials', async () => {
            mockPost.mockRejectedValue({
                response: {
                    status: 401,
                    data: { detail: 'Invalid email or password' },
                },
            });

            await expect(
                AuthService.login({ email: 'bad@email.com', password: 'wrong' })
            ).rejects.toBeDefined();
        });

        it('handles network errors', async () => {
            mockPost.mockRejectedValue(new Error('Network Error'));

            await expect(
                AuthService.login({ email: 'test@example.com', password: 'pass' })
            ).rejects.toThrow('Network Error');
        });
    });

    describe('register', () => {
        it('registers a new user successfully', async () => {
            const mockResponse = {
                data: {
                    id: 2,
                    email: 'new@example.com',
                    full_name: 'New User',
                    access_token: 'new-jwt',
                    token_type: 'bearer',
                },
            };
            mockPost.mockResolvedValue(mockResponse);

            const result = await AuthService.register({
                email: 'new@example.com',
                password: 'StrongPass123!',
                full_name: 'New User',
            });

            expect(mockPost).toHaveBeenCalledWith(
                '/api/v1/auth/register',
                expect.objectContaining({
                    email: 'new@example.com',
                    full_name: 'New User',
                })
            );
            expect(result.email).toBe('new@example.com');
            expect(result.access_token).toBe('new-jwt');
        });

        it('throws on duplicate email', async () => {
            mockPost.mockRejectedValue({
                response: {
                    status: 409,
                    data: { detail: 'Email already registered' },
                },
            });

            await expect(
                AuthService.register({
                    email: 'existing@email.com',
                    password: 'pass',
                    full_name: 'User',
                })
            ).rejects.toBeDefined();
        });
    });

    describe('getCurrentUser', () => {
        it('fetches current user profile', async () => {
            const mockResponse = {
                data: {
                    id: 1,
                    email: 'test@example.com',
                    full_name: 'Test User',
                    created_at: '2026-01-01T00:00:00Z',
                },
            };
            mockGet.mockResolvedValue(mockResponse);

            const result = await AuthService.getCurrentUser();

            expect(mockGet).toHaveBeenCalledWith('/api/v1/auth/me');
            expect(result.email).toBe('test@example.com');
        });

        it('throws on expired/invalid token', async () => {
            mockGet.mockRejectedValue({
                response: { status: 401, data: { detail: 'Token has expired' } },
            });

            await expect(AuthService.getCurrentUser()).rejects.toBeDefined();
        });
    });

    describe('logout', () => {
        it('clears token on logout', () => {
            const { tokenStorage } = require('../../utils/tokenStorage');
            AuthService.logout();
            expect(tokenStorage.clearAll).toHaveBeenCalled();
        });
    });

    describe('isAuthenticated', () => {
        it('returns false when no valid token', () => {
            expect(AuthService.isAuthenticated()).toBeFalsy();
        });

        it('returns true when valid token exists', () => {
            const { tokenStorage } = require('../../utils/tokenStorage');
            tokenStorage.hasValidToken.mockReturnValue(true);
            tokenStorage.isTokenExpired.mockReturnValue(false);

            expect(AuthService.isAuthenticated()).toBe(true);
        });
    });
});
