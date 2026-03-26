# FastAPI Backend for 3D Body Measurement System

FastAPI backend that connects the React frontend with the Python measurement pipeline.

## Features

- ✅ RESTful API endpoints
- ✅ Image upload handling
- ✅ CORS support for React frontend
- ✅ Automatic API documentation
- ✅ Error handling and logging
- ✅ File size validation
- ✅ Lazy pipeline loading

## Setup

### 1. Install Dependencies

```bash
cd api
pip install -r requirements.txt
```

### 2. Run the API Server

```bash
# Option 1: Direct Python
python app.py

# Option 2: Uvicorn command
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at:
- **API**: http://localhost:8000
- **Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/api/v1/health

## API Endpoints

### `GET /`
Root endpoint with API information

### `GET /api/v1/health`
Health check endpoint to verify API and pipeline status

### `GET /api/v1/info`
Get detailed API information and features

### `POST /api/v1/measurements`
Main endpoint for processing images and getting measurements

**Request:**
- `front_image` (file, required): Front view photo
- `side_image` (file, optional): Side view photo
- `height_cm` (float, optional): User height in centimeters
- `gender` (string, optional): "male" or "female"
- `age` (int, optional): Age in years

**Response:**
```json
{
  "success": true,
  "measurements": {
    "height": 170.5,
    "shoulder_breadth": 42.3,
    ...
  },
  "size_recommendations": {
    "tops": {
      "recommended_size": "M",
      "confidence": 85,
      "alternatives": ["L", "S"]
    },
    ...
  },
  "metadata": {
    "user_height_cm": 170,
    "measurements_extracted": 22,
    "scaled": true
  }
}
```

## Testing

### Using the API Documentation

1. Start the API server
2. Open http://localhost:8000/docs
3. Use the interactive Swagger UI to test endpoints

### Using curl

```bash
curl -X POST "http://localhost:8000/api/v1/measurements" \
  -F "front_image=@path/to/image.jpg" \
  -F "height_cm=170" \
  -F "gender=male"
```

### Using Python

```python
import requests

files = {
    'front_image': open('path/to/image.jpg', 'rb')
}
data = {
    'height_cm': 170,
    'gender': 'male'
}

response = requests.post(
    'http://localhost:8000/api/v1/measurements',
    files=files,
    data=data
)

print(response.json())
```

## Database

The API uses **SQLite** for local development. Database files are auto-created on first run.

### Files (auto-generated, git-ignored)
| File | Purpose |
|------|---------|
| `data.db` | Main application DB (users, fit checks, wardrobe, payments) |
| `body_measurements.db` | Body measurement history & tracking |

### First-Time Setup
No manual setup required — databases are created automatically when the server starts.
Tables are defined via SQLModel and created in `app.py` startup.

### Reset Database
```bash
# Delete existing DBs to start fresh
rm api/data.db api/body_measurements.db

# Restart the server — tables will be recreated
python app.py
```

### Production Considerations
- Migrate to **PostgreSQL** for production deployments
- Set `DATABASE_URL` environment variable to override SQLite
- Database files (`.db`) are git-ignored and must not be committed

## CORS Configuration

The API is configured to allow requests from:
- `http://localhost:3000` (React dev server)
- `http://localhost:3001`
- `http://127.0.0.1:3000`

To add production domains, update the `allow_origins` list in `app.py`.

## Error Handling

The API handles various error cases:
- Invalid image files
- File size limits (10MB)
- Pipeline initialization failures
- Measurement processing errors

All errors return appropriate HTTP status codes and error messages.

## Logging

Logs are written to:
- Console (INFO level)
- `api.log` file (rotated at 10MB, retained for 7 days)

## Production Deployment

For production:
1. Set `reload=False` in uvicorn.run()
2. Use a production ASGI server (Gunicorn + Uvicorn workers)
3. Configure proper CORS origins
4. Set up reverse proxy (Nginx)
5. Use environment variables for configuration
6. Enable HTTPS

## Troubleshooting

### Pipeline Import Error
Make sure you're running from the project root directory and the `integrations` folder is accessible.

### Port Already in Use
Change the port in `app.py` or use:
```bash
uvicorn app:app --port 8001
```

### CORS Errors
Make sure your React app URL is in the `allow_origins` list.



