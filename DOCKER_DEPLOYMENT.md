# Docker Deployment Guide

## Quick Start

### Prerequisites
- Docker Desktop installed
- Docker Compose installed
- `.env` file configured in `api/` directory

### Local Development with Docker

1. **Start all services:**
```bash
docker-compose up
```

2. **Access the application:**
- API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Frontend: http://localhost:3000

3. **Stop services:**
```bash
docker-compose down
```

### Production Deployment

1. **Build the production image:**
```bash
docker build -t bodyscan-api:latest .
```

2. **Run the container:**
```bash
docker run -d \
  -p 8000:8000 \
  -e GROQ_API_KEY=your_key \
  -e JWT_SECRET_KEY=your_secret \
  -v $(pwd)/api/data.db:/app/api/data.db \
  --name bodyscan-api \
  bodyscan-api:latest
```

3. **Check logs:**
```bash
docker logs -f bodyscan-api
```

## Environment Variables

Required environment variables (set in `.env` or pass via `-e`):
- `GROQ_API_KEY` - Groq API key for AI features
- `REPLICATE_API_TOKEN` - Replicate API token
- `JWT_SECRET_KEY` - Secret key for JWT authentication
- `JWT_ALGORITHM` - JWT algorithm (default: HS256)
- `ACCESS_TOKEN_EXPIRE_MINUTES` - Token expiry time (default: 1440)

## Docker Commands Reference

### Development
```bash
# Build and start in detached mode
docker-compose up -d

# View logs
docker-compose logs -f api

# Rebuild after code changes
docker-compose up --build

# Stop and remove containers
docker-compose down
```

### Production
```bash
# Build optimized image
docker build -t bodyscan-api:prod .

# Tag for registry
docker tag bodyscan-api:prod your-registry/bodyscan-api:v1.0.0

# Push to registry
docker push your-registry/bodyscan-api:v1.0.0
```

## Deployment to Cloud Platforms

### AWS ECS
1. Push image to ECR
2. Create ECS task definition
3. Configure environment variables
4. Deploy service

### Google Cloud Run
```bash
gcloud run deploy bodyscan-api \
  --image gcr.io/your-project/bodyscan-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Azure Container Instances
```bash
az container create \
  --resource-group bodyscan-rg \
  --name bodyscan-api \
  --image your-registry/bodyscan-api:latest \
  --ports 8000
```

## Health Checks

The Docker image includes a health check that pings `/health` endpoint every 30 seconds.

Check container health:
```bash
docker ps
# Look for "healthy" status
```

## Troubleshooting

### Container won't start
```bash
# Check logs
docker logs bodyscan-api

# Inspect container
docker inspect bodyscan-api
```

### Database issues
```bash
# Ensure volume is mounted correctly
docker run -v $(pwd)/api/data.db:/app/api/data.db ...
```

### Environment variables not loading
```bash
# Verify .env file exists
ls api/.env

# Check if variables are set in container
docker exec bodyscan-api env | grep JWT
```
