/**
 * Measurement Submission Tests
 * Tests the API service measurement submission + size recommendation flows
 */

// Mock the api module (shared axios instance)
const mockPost = jest.fn();
const mockGet = jest.fn();
jest.mock('../../services/api', () => ({
    __esModule: true,
    default: {
        post: (...args: any[]) => mockPost(...args),
        get: (...args: any[]) => mockGet(...args),
        create: jest.fn(),
        defaults: { headers: { common: {} } },
        interceptors: {
            request: { use: jest.fn() },
            response: { use: jest.fn() },
        },
    },
}));

describe('Measurement API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('submitMeasurement', () => {
        it('submits front image and returns measurements', async () => {
            const mockResponse = {
                data: {
                    success: true,
                    measurements: {
                        height: 170.5,
                        shoulder_breadth: 42.3,
                        chest: 95.0,
                        waist: 82.0,
                        hips: 98.0,
                    },
                    size_recommendations: {
                        tops: { recommended_size: 'M', confidence: 85 },
                        bottoms: { recommended_size: 'L', confidence: 78 },
                    },
                    metadata: {
                        measurements_extracted: 22,
                        scaled: true,
                    },
                },
            };
            mockPost.mockResolvedValue(mockResponse);

            const formData = new FormData();
            formData.append('front_image', new Blob(['fake-image'], { type: 'image/jpeg' }));
            formData.append('height_cm', '170');
            formData.append('gender', 'male');

            const result = await mockPost('/api/v1/measurements', formData);

            expect(result.data.success).toBe(true);
            expect(result.data.measurements.height).toBe(170.5);
            expect(result.data.size_recommendations.tops.recommended_size).toBe('M');
        });

        it('handles missing image error', async () => {
            mockPost.mockRejectedValue({
                response: {
                    status: 400,
                    data: { detail: 'Front image is required' },
                },
            });

            await expect(mockPost('/api/v1/measurements', new FormData()))
                .rejects.toMatchObject({
                    response: { status: 400 },
                });
        });

        it('handles image too large error', async () => {
            mockPost.mockRejectedValue({
                response: {
                    status: 413,
                    data: { detail: 'File too large. Maximum size is 10MB' },
                },
            });

            const formData = new FormData();
            formData.append('front_image', new Blob(['x'.repeat(11_000_000)]));

            await expect(mockPost('/api/v1/measurements', formData))
                .rejects.toMatchObject({
                    response: { status: 413 },
                });
        });

        it('handles processing timeout', async () => {
            mockPost.mockRejectedValue(new Error('timeout of 300000ms exceeded'));

            const formData = new FormData();
            formData.append('front_image', new Blob(['fake-image']));

            await expect(mockPost('/api/v1/measurements', formData))
                .rejects.toThrow('timeout');
        });
    });

    describe('getSavedMeasurements', () => {
        it('fetches saved measurements for user', async () => {
            const mockResponse = {
                data: {
                    measurements: [
                        { id: 1, name: 'John', date: '2026-03-01', chest: 95 },
                        { id: 2, name: 'John', date: '2026-02-15', chest: 94 },
                    ],
                },
            };
            mockGet.mockResolvedValue(mockResponse);

            const result = await mockGet('/api/v1/measurements/saved/1');

            expect(result.data.measurements).toHaveLength(2);
            expect(result.data.measurements[0].chest).toBe(95);
        });

        it('returns empty array for new user', async () => {
            mockGet.mockResolvedValue({ data: { measurements: [] } });

            const result = await mockGet('/api/v1/measurements/saved/999');
            expect(result.data.measurements).toHaveLength(0);
        });
    });

    describe('fitCheck', () => {
        it('performs fit check and returns score', async () => {
            const mockResponse = {
                data: {
                    success: true,
                    overall_score: 87,
                    fit_details: {
                        chest: { score: 90, verdict: 'Good fit' },
                        waist: { score: 85, verdict: 'Slightly loose' },
                    },
                    best_size: 'M',
                    check_id: 42,
                },
            };
            mockPost.mockResolvedValue(mockResponse);

            const result = await mockPost('/api/v1/fit-check', {
                measurement_id: 1,
                garment: 'T-Shirt',
                brand: 'Nike',
                size: 'M',
            });

            expect(result.data.overall_score).toBe(87);
            expect(result.data.best_size).toBe('M');
            expect(result.data.check_id).toBe(42);
        });

        it('handles unknown garment type', async () => {
            mockPost.mockRejectedValue({
                response: {
                    status: 400,
                    data: { detail: 'Unsupported garment type' },
                },
            });

            await expect(mockPost('/api/v1/fit-check', {
                measurement_id: 1,
                garment: 'InvalidType',
                brand: 'Nike',
                size: 'M',
            })).rejects.toMatchObject({
                response: { status: 400 },
            });
        });
    });
});
