/**
 * k6 Load Testing - API Endpoints
 * 
 * Tests API performance under various load conditions.
 * Run with: k6 run tests/load/api-load-test.js
 * 
 * Scenarios:
 * - smoke: Quick validation (5 VUs, 30s)
 * - load: Standard load test (100 VUs, 5m)
 * - stress: High load (500 VUs, 5m)
 * - spike: Extreme load (1000 VUs, 2m)
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const healthLatency = new Trend('health_latency');
const authLatency = new Trend('auth_latency');
const measurementsLatency = new Trend('measurements_latency');
const wardrobeLatency = new Trend('wardrobe_latency');
const successfulRequests = new Counter('successful_requests');
const failedRequests = new Counter('failed_requests');

// Configuration
const BASE_URL = __ENV.API_URL || 'http://localhost:8000';

// Test scenarios
export const options = {
    scenarios: {
        // Quick smoke test
        smoke: {
            executor: 'constant-vus',
            vus: 5,
            duration: '30s',
            exec: 'smokeTest',
            tags: { scenario: 'smoke' },
        },
        // Standard load test - 100 concurrent users
        load: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '1m', target: 50 },   // Ramp up
                { duration: '3m', target: 100 },  // Stay at 100
                { duration: '1m', target: 0 },    // Ramp down
            ],
            exec: 'loadTest',
            tags: { scenario: 'load' },
            startTime: '35s', // Start after smoke test
        },
        // Stress test - 500 concurrent users
        stress: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '2m', target: 200 },  // Ramp up
                { duration: '3m', target: 500 },  // Push to 500
                { duration: '2m', target: 0 },    // Ramp down
            ],
            exec: 'stressTest',
            tags: { scenario: 'stress' },
            startTime: '6m', // Start after load test
        },
        // Spike test - 1000 concurrent users
        spike: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '30s', target: 1000 }, // Spike to 1000
                { duration: '1m', target: 1000 },  // Stay at 1000
                { duration: '30s', target: 0 },    // Ramp down
            ],
            exec: 'spikeTest',
            tags: { scenario: 'spike' },
            startTime: '13m', // Start after stress test
        },
    },
    thresholds: {
        // Overall thresholds
        http_req_duration: ['p(95)<500', 'p(99)<1000'],
        http_req_failed: ['rate<0.1'],
        errors: ['rate<0.1'],
        
        // Endpoint-specific thresholds
        health_latency: ['p(95)<100'],
        auth_latency: ['p(95)<300'],
        measurements_latency: ['p(95)<500'],
        wardrobe_latency: ['p(95)<500'],
    },
};

// Test user credentials (pre-created for load testing)
const TEST_USERS = [
    { email: 'loadtest1@example.com', password: 'LoadTest123!' },
    { email: 'loadtest2@example.com', password: 'LoadTest123!' },
    { email: 'loadtest3@example.com', password: 'LoadTest123!' },
];

// Helper function to get random test user
function getRandomUser() {
    return TEST_USERS[Math.floor(Math.random() * TEST_USERS.length)];
}

// Helper function to make authenticated request
function authenticatedRequest(method, url, body = null, token = null) {
    const headers = {
        'Content-Type': 'application/json',
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    const params = { headers };
    
    if (method === 'GET') {
        return http.get(url, params);
    } else if (method === 'POST') {
        return http.post(url, body ? JSON.stringify(body) : null, params);
    }
}

// Smoke test - basic functionality
export function smokeTest() {
    group('Health Check', () => {
        const start = Date.now();
        const res = http.get(`${BASE_URL}/api/v1/health`);
        healthLatency.add(Date.now() - start);
        
        const success = check(res, {
            'health status is 200': (r) => r.status === 200,
            'health response is healthy': (r) => r.json('status') === 'healthy',
        });
        
        if (success) {
            successfulRequests.add(1);
        } else {
            failedRequests.add(1);
            errorRate.add(1);
        }
    });
    
    group('API Info', () => {
        const res = http.get(`${BASE_URL}/api/v1/info`);
        check(res, {
            'info status is 200': (r) => r.status === 200,
        });
    });
    
    sleep(1);
}

// Load test - standard usage patterns
export function loadTest() {
    // Health check (always available)
    group('Health Endpoints', () => {
        const start = Date.now();
        const healthRes = http.get(`${BASE_URL}/api/v1/health`);
        healthLatency.add(Date.now() - start);
        
        check(healthRes, {
            'health check passed': (r) => r.status === 200,
        });
        
        // Performance stats
        http.get(`${BASE_URL}/api/v1/health/performance`);
    });
    
    // Simulate user behavior
    group('User Flow', () => {
        // Test connection
        const connRes = http.get(`${BASE_URL}/api/v1/test-connection`);
        check(connRes, {
            'connection test passed': (r) => r.status === 200,
        });
        
        // Try to login (might fail if user doesn't exist)
        const user = getRandomUser();
        const start = Date.now();
        const loginRes = http.post(`${BASE_URL}/api/v1/auth/login`, JSON.stringify({
            email: user.email,
            password: user.password,
        }), {
            headers: { 'Content-Type': 'application/json' },
        });
        authLatency.add(Date.now() - start);
        
        // If login successful, make authenticated requests
        if (loginRes.status === 200) {
            const token = loginRes.json('access_token');
            
            // Get user profile
            const meRes = authenticatedRequest('GET', `${BASE_URL}/api/v1/auth/me`, null, token);
            check(meRes, {
                'profile retrieved': (r) => r.status === 200,
            });
            
            // Get measurements
            const measStart = Date.now();
            const measRes = authenticatedRequest('GET', `${BASE_URL}/api/v1/measurements/my-measurements`, null, token);
            measurementsLatency.add(Date.now() - measStart);
        }
        
        errorRate.add(loginRes.status !== 200 && loginRes.status !== 401 ? 1 : 0);
    });
    
    sleep(Math.random() * 2 + 1); // Random sleep 1-3s
}

// Stress test - high load simulation
export function stressTest() {
    group('High Load Endpoints', () => {
        // Rapid health checks
        for (let i = 0; i < 3; i++) {
            const start = Date.now();
            const res = http.get(`${BASE_URL}/api/v1/health`);
            healthLatency.add(Date.now() - start);
            
            const success = check(res, {
                'stress health check passed': (r) => r.status === 200,
            });
            
            errorRate.add(success ? 0 : 1);
        }
        
        // Performance endpoint under load
        const perfRes = http.get(`${BASE_URL}/api/v1/health/performance`);
        check(perfRes, {
            'performance endpoint accessible': (r) => r.status === 200,
        });
    });
    
    group('Database Load', () => {
        // Try unauthenticated endpoints that hit the database
        const user = getRandomUser();
        const start = Date.now();
        const loginRes = http.post(`${BASE_URL}/api/v1/auth/login`, JSON.stringify({
            email: user.email,
            password: user.password,
        }), {
            headers: { 'Content-Type': 'application/json' },
        });
        authLatency.add(Date.now() - start);
        
        if (loginRes.status === 200) {
            successfulRequests.add(1);
        } else {
            failedRequests.add(1);
        }
    });
    
    sleep(Math.random() + 0.5); // Faster pacing for stress test
}

// Spike test - extreme load
export function spikeTest() {
    group('Spike Load', () => {
        // Only hit the most critical endpoints
        const start = Date.now();
        const healthRes = http.get(`${BASE_URL}/api/v1/health`);
        healthLatency.add(Date.now() - start);
        
        const success = check(healthRes, {
            'spike health check passed': (r) => r.status === 200 || r.status === 429.
        });
        
        // Accept rate limiting during spike
        if (healthRes.status === 429) {
            // Expected during spike - not an error
            sleep(1);
        } else if (!success) {
            errorRate.add(1);
            failedRequests.add(1);
        } else {
            successfulRequests.add(1);
        }
    });
    
    sleep(Math.random() * 0.5); // Minimal sleep during spike
}

// Handle test results
export function handleSummary(data) {
    // Generate HTML report
    return {
        'tests/load/results/summary.json': JSON.stringify(data, null, 2),
        stdout: textSummary(data, { indent: ' ', enableColors: true }),
    };
}

// Text summary helper
function textSummary(data, opts) {
    const checks = data.metrics.checks;
    const httpReqs = data.metrics.http_reqs;
    const httpReqDuration = data.metrics.http_req_duration;
    
    let summary = `
╔══════════════════════════════════════════════════════════════════╗
║                    LOAD TEST RESULTS                             ║
╚══════════════════════════════════════════════════════════════════╝

📊 Overview
───────────────────────────────────────────────────────────────────
  Total Requests:    ${httpReqs?.values?.count || 0}
  Failed Requests:   ${data.metrics.http_req_failed?.values?.passes || 0}
  Check Pass Rate:   ${checks ? ((checks.values.passes / checks.values.count) * 100).toFixed(2) : 0}%

⏱️  Response Times
───────────────────────────────────────────────────────────────────
  Average:  ${httpReqDuration?.values?.avg?.toFixed(2) || 0}ms
  Median:   ${httpReqDuration?.values?.med?.toFixed(2) || 0}ms
  P(95):    ${httpReqDuration?.values?.['p(95)']?.toFixed(2) || 0}ms
  P(99):    ${httpReqDuration?.values?.['p(99)']?.toFixed(2) || 0}ms
  Max:      ${httpReqDuration?.values?.max?.toFixed(2) || 0}ms

🎯 Thresholds
───────────────────────────────────────────────────────────────────
`;
    
    for (const [name, threshold] of Object.entries(data.metrics)) {
        if (threshold.thresholds) {
            for (const [th, passed] of Object.entries(threshold.thresholds)) {
                summary += `  ${passed ? '✅' : '❌'} ${name}: ${th}\n`;
            }
        }
    }
    
    return summary;
}
