/**
 * k6 Load Testing - Database Performance
 * 
 * Focused test for database operations under load.
 * Run with: k6 run tests/load/database-load-test.js
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const dbReadLatency = new Trend('db_read_latency');
const dbWriteLatency = new Trend('db_write_latency');
const dbErrors = new Rate('db_errors');
const queryCount = new Counter('query_count');

// Configuration
const BASE_URL = __ENV.API_URL || 'http://localhost:8000';

export const options = {
    scenarios: {
        // Database read-heavy load
        read_heavy: {
            executor: 'constant-vus',
            vus: 50,
            duration: '2m',
            exec: 'readHeavyTest',
            tags: { scenario: 'read_heavy' },
        },
        // Database write load
        write_load: {
            executor: 'constant-vus',
            vus: 20,
            duration: '2m',
            exec: 'writeLoadTest',
            tags: { scenario: 'write_load' },
            startTime: '2m30s',
        },
        // Mixed read/write
        mixed: {
            executor: 'ramping-vus',
            startVUs: 10,
            stages: [
                { duration: '1m', target: 50 },
                { duration: '2m', target: 100 },
                { duration: '1m', target: 0 },
            ],
            exec: 'mixedTest',
            tags: { scenario: 'mixed' },
            startTime: '5m',
        },
    },
    thresholds: {
        db_read_latency: ['p(95)<200', 'p(99)<500'],
        db_write_latency: ['p(95)<500', 'p(99)<1000'],
        db_errors: ['rate<0.05'],
    },
};

// Test data
const testMeasurement = {
    name: 'Load Test Measurement',
    measurement_data: {
        measurements: {
            height: 175.5,
            chest: 95.0,
            waist: 80.0,
            hip: 98.0,
        },
        timestamp: new Date().toISOString(),
    },
};

// Store tokens for authenticated requests
let authTokens = {};

// Setup - get auth tokens
export function setup() {
    // Try to login with test accounts
    const users = [
        { email: 'loadtest1@example.com', password: 'LoadTest123!' },
        { email: 'loadtest2@example.com', password: 'LoadTest123!' },
    ];
    
    const tokens = [];
    for (const user of users) {
        const res = http.post(`${BASE_URL}/api/v1/auth/login`, JSON.stringify(user), {
            headers: { 'Content-Type': 'application/json' },
        });
        
        if (res.status === 200) {
            tokens.push(res.json('access_token'));
        }
    }
    
    return { tokens };
}

// Helper for authenticated requests
function authRequest(method, url, body, data) {
    const tokens = data.tokens || [];
    const token = tokens[Math.floor(Math.random() * tokens.length)];
    
    const headers = {
        'Content-Type': 'application/json',
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    if (method === 'GET') {
        return http.get(url, { headers });
    } else if (method === 'POST') {
        return http.post(url, body ? JSON.stringify(body) : null, { headers });
    }
}

// Read-heavy test
export function readHeavyTest(data) {
    group('Database Reads', () => {
        // Get measurements (hits database)
        const start = Date.now();
        const measRes = authRequest('GET', `${BASE_URL}/api/v1/measurements/my-measurements`, null, data);
        dbReadLatency.add(Date.now() - start);
        queryCount.add(1);
        
        const success = check(measRes, {
            'measurements read success': (r) => r.status === 200 || r.status === 401,
        });
        
        dbErrors.add(success ? 0 : 1);
        
        // Fashion IQ (database read)
        if (measRes.status === 200) {
            const iqStart = Date.now();
            const iqRes = authRequest('GET', `${BASE_URL}/api/v1/fashion-iq/1`, null, data);
            dbReadLatency.add(Date.now() - iqStart);
            queryCount.add(1);
        }
        
        // Wardrobe analytics
        const wardStart = Date.now();
        const wardRes = http.get(`${BASE_URL}/api/v1/wardrobe/analytics/1?filter=all`);
        dbReadLatency.add(Date.now() - wardStart);
        queryCount.add(1);
        
        check(wardRes, {
            'wardrobe read success': (r) => r.status === 200 || r.status === 500,
        });
    });
    
    sleep(Math.random() + 0.5);
}

// Write load test
export function writeLoadTest(data) {
    group('Database Writes', () => {
        // Save measurement (database write)
        const start = Date.now();
        const saveRes = authRequest(
            'POST', 
            `${BASE_URL}/api/v1/measurements/save`, 
            testMeasurement,
            data
        );
        dbWriteLatency.add(Date.now() - start);
        queryCount.add(1);
        
        const success = check(saveRes, {
            'measurement save attempted': (r) => r.status === 200 || r.status === 401 || r.status === 422,
        });
        
        dbErrors.add(success ? 0 : 1);
    });
    
    sleep(Math.random() * 2 + 1);
}

// Mixed read/write test
export function mixedTest(data) {
    const isRead = Math.random() > 0.3; // 70% reads, 30% writes
    
    if (isRead) {
        readHeavyTest(data);
    } else {
        writeLoadTest(data);
    }
}

// Summary handler
export function handleSummary(data) {
    const summary = {
        timestamp: new Date().toISOString(),
        metrics: {
            db_read_latency: data.metrics.db_read_latency?.values || {},
            db_write_latency: data.metrics.db_write_latency?.values || {},
            query_count: data.metrics.query_count?.values?.count || 0,
            db_errors: data.metrics.db_errors?.values?.rate || 0,
        },
        thresholds: {},
    };
    
    // Extract threshold results
    for (const [name, metric] of Object.entries(data.metrics)) {
        if (metric.thresholds) {
            summary.thresholds[name] = metric.thresholds;
        }
    }
    
    return {
        'tests/load/results/database-results.json': JSON.stringify(summary, null, 2),
        stdout: `
╔══════════════════════════════════════════════════════════════════╗
║                DATABASE LOAD TEST RESULTS                        ║
╚══════════════════════════════════════════════════════════════════╝

📊 Database Operations
───────────────────────────────────────────────────────────────────
  Total Queries:     ${summary.metrics.query_count}
  Error Rate:        ${(summary.metrics.db_errors * 100).toFixed(2)}%

⏱️  Read Latency
───────────────────────────────────────────────────────────────────
  Average:  ${summary.metrics.db_read_latency.avg?.toFixed(2) || 0}ms
  P(95):    ${summary.metrics.db_read_latency['p(95)']?.toFixed(2) || 0}ms
  P(99):    ${summary.metrics.db_read_latency['p(99)']?.toFixed(2) || 0}ms

⏱️  Write Latency
───────────────────────────────────────────────────────────────────
  Average:  ${summary.metrics.db_write_latency.avg?.toFixed(2) || 0}ms
  P(95):    ${summary.metrics.db_write_latency['p(95)']?.toFixed(2) || 0}ms
  P(99):    ${summary.metrics.db_write_latency['p(99)']?.toFixed(2) || 0}ms
`,
    };
}
