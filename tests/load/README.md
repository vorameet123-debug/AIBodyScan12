# Load Testing

Performance and load testing for the 3D Body Measurement API.

## Prerequisites

### Install k6

**Windows (Chocolatey):**
```powershell
choco install k6
```

**Windows (MSI):**
Download from https://dl.k6.io/msi/k6-latest-amd64.msi

**macOS:**
```bash
brew install k6
```

**Linux:**
```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

## Test Files

| File | Description |
|------|-------------|
| `api-load-test.js` | Full API load test with 4 scenarios |
| `database-load-test.js` | Database operations load test |

## Running Tests

### Quick Smoke Test
```bash
k6 run --env API_URL=http://localhost:8000 tests/load/api-load-test.js --scenario smoke
```

### Standard Load Test (100 VUs)
```bash
k6 run --env API_URL=http://localhost:8000 tests/load/api-load-test.js --scenario load
```

### Stress Test (500 VUs)
```bash
k6 run --env API_URL=http://localhost:8000 tests/load/api-load-test.js --scenario stress
```

### Spike Test (1000 VUs)
```bash
k6 run --env API_URL=http://localhost:8000 tests/load/api-load-test.js --scenario spike
```

### Full Test Suite (All Scenarios)
```bash
k6 run --env API_URL=http://localhost:8000 tests/load/api-load-test.js
```

### Database Load Test
```bash
k6 run --env API_URL=http://localhost:8000 tests/load/database-load-test.js
```

## Test Scenarios

### API Load Test

| Scenario | Virtual Users | Duration | Purpose |
|----------|---------------|----------|---------|
| smoke | 5 VUs | 30s | Quick validation |
| load | 100 VUs | 5m | Standard load |
| stress | 500 VUs | 7m | High load stress |
| spike | 1000 VUs | 2m | Extreme spike |

### Thresholds

- **Response time P95**: < 500ms
- **Response time P99**: < 1000ms
- **Error rate**: < 10%
- **Health endpoint P95**: < 100ms
- **Auth endpoint P95**: < 300ms

## Test Results

Results are saved to `tests/load/results/`:
- `summary.json` - Full test summary
- `database-results.json` - Database test results

## Creating Test Users

Before running load tests with authentication, create test users:

```bash
# Via API
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"loadtest1@example.com","password":"LoadTest123!","full_name":"Load Test User 1"}'
```

## Performance Benchmarks

### Baseline (Local Development)

| Endpoint | Avg | P95 | P99 |
|----------|-----|-----|-----|
| GET /health | 5ms | 10ms | 20ms |
| POST /auth/login | 50ms | 100ms | 150ms |
| GET /measurements | 30ms | 80ms | 120ms |
| GET /wardrobe/analytics | 100ms | 200ms | 300ms |

### Under Load (100 VUs)

| Endpoint | Avg | P95 | P99 |
|----------|-----|-----|-----|
| GET /health | 15ms | 50ms | 100ms |
| POST /auth/login | 100ms | 200ms | 350ms |
| GET /measurements | 80ms | 150ms | 250ms |

### Under Stress (500 VUs)

| Endpoint | Avg | P95 | P99 |
|----------|-----|-----|-----|
| GET /health | 50ms | 150ms | 300ms |
| POST /auth/login | 200ms | 400ms | 600ms |

*Note: Actual results will vary based on hardware and configuration.*

## Interpreting Results

### Good Performance
- ✅ All thresholds passed
- ✅ Error rate < 1%
- ✅ P95 response time < 500ms

### Warning Signs
- ⚠️ P95 > 500ms but < 1000ms
- ⚠️ Error rate 1-5%
- ⚠️ Increasing latency over time

### Critical Issues
- ❌ Error rate > 10%
- ❌ P99 > 2000ms
- ❌ Timeouts or connection failures

## Optimization Tips

1. **Database**: Add indexes for frequently queried columns
2. **Caching**: Enable Redis caching for expensive operations
3. **Connection Pooling**: Increase pool size for high concurrency
4. **Rate Limiting**: Adjust limits based on load test results
5. **Response Compression**: Ensure GZip is enabled for large responses
