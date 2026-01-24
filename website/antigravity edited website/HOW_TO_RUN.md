# How to Run

## Quick Start (2 Terminal Windows)

### Terminal 1: Start Backend
```bash
cd d:\3Dmodel
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python api/app.py
```

Expected output:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
```

### Terminal 2: Start Frontend
```bash
cd d:\3Dmodel\website
npm install
npm start
```

Expected output:
```
Compiled successfully!
localhost:3000 - Local: http://localhost:3000
```

Application opens automatically at: **http://localhost:3000**

---

## Step-by-Step Setup Instructions

### 1. Initial Setup (One Time)

#### Backend
```bash
# Navigate to project
cd d:\3Dmodel

# Create Python virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install all backend dependencies
pip install -r requirements.txt

# Verify installation
python -c "import fastapi, torch, cv2; print('✓ All imports successful')"
```

#### Frontend
```bash
cd d:\3Dmodel\website

# Install Node dependencies
npm install

# Verify installation (optional)
npm list react three axios
```

### 2. Running the Application

#### Option A: Development Mode (Recommended)

**Terminal 1 - Backend:**
```bash
cd d:\3Dmodel
venv\Scripts\activate
python api/app.py
```

**Terminal 2 - Frontend:**
```bash
cd d:\3Dmodel\website
npm start
```

#### Option B: Production Build

```bash
# Build frontend
cd d:\3Dmodel\website
npm run build

# Serve built files (optional)
npm install -g serve
serve -s build
```

Then run backend separately:
```bash
cd d:\3Dmodel
venv\Scripts\activate
python api/app.py
```

### 3. Accessing the Application

1. **Frontend Dashboard**: Open http://localhost:3000 in browser
2. **Backend API**: Access http://localhost:8000 for API endpoints
3. **API Documentation**: Visit http://localhost:8000/docs for interactive Swagger UI
4. **Alternative Docs**: Visit http://localhost:8000/redoc for ReDoc documentation

---

## Application Workflow

### User Interaction Flow

1. **Upload Image**
   - Go to upload form on http://localhost:3000
   - Drag/drop or select body photo from front
   - Image is sent to backend via FormData

2. **Enter Body Info**
   - Height (cm)
   - Gender (Male/Female)
   - Age (years)

3. **Click "Analyze"**
   - Frontend sends POST request to `http://localhost:8000/api/v1/measurements`
   - Shows loading indicator (~5-10 seconds)

4. **View Measurements**
   - Backend processes with PARE model
   - Extracts SMPL vertices
   - Calculates 18 measurements
   - Returns results to frontend

5. **Interactive 3D Model**
   - Shows 3D mannequin model
   - Click any measurement name to visualize as torus ring
   - Ring color changes based on measurement
   - Ring radius computed from circumference value

6. **Size Recommendations**
   - Shows clothing size suggestions
   - Based on extracted measurements
   - Categorized by type (top, bottom, shoe size)

---

## Common Issues & Solutions

### Backend Won't Start

**Problem**: `Address already in use` error
```
ERROR: Application startup failed
Address already in use :::8000
```

**Solution**: 
```bash
# Kill process on port 8000 (Windows)
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Or change port in api/app.py
# Replace: uvicorn.run(app, host="0.0.0.0", port=8000)
# With: uvicorn.run(app, host="0.0.0.0", port=8001)
```

### Frontend Won't Connect to Backend

**Problem**: `CORS error` in browser console
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution**: Backend CORS is already configured in `api/app.py`
- If still failing, check both servers are running
- Verify `http://localhost:8000` is accessible directly in browser

### Image Upload Fails

**Problem**: `413 Payload Too Large` error

**Solution**: Increase max upload size in `api/app.py`
```python
# Increase from default 25MB
app = FastAPI()
app.add_middleware(...)
# File size limit is handled by uvicorn, increase as needed
```

### 3D Model Not Displaying

**Problem**: Black screen or model not visible in 3D viewer

**Solutions**:
1. Check browser console for errors (F12)
2. Verify `website/public/male-body.fbx` exists (252KB file)
3. Check Three.js version: should be 0.160.0+
4. Clear browser cache and hard refresh (Ctrl+Shift+R)

### Measurement Rings Not Showing

**Problem**: Click measurement but no ring appears

**Solutions**:
1. Verify image was processed successfully (measurements table populated)
2. Check browser console for errors
3. Ensure you're using front-view body photo
4. Try different measurements - some map to specific Y-heights

### Slow Performance

**Problem**: Image processing takes >20 seconds

**Solutions**:
1. Check if GPU is being used: `nvidia-smi` in terminal
2. If CPU only, processing is normal (5-15 seconds)
3. Reduce image resolution before upload (crop to 512x512)
4. Install CUDA for GPU acceleration (see REQUIREMENTS.md)

---

## Testing the System

### Quick API Test
```bash
# Using browser console
fetch('http://localhost:8000/docs')
  .then(r => r.text())
  .then(html => console.log('API accessible'))

# Or using curl (PowerShell)
Invoke-WebRequest -Uri "http://localhost:8000/docs"
```

### Test Full Pipeline
1. Upload sample image
2. Enter test body info (e.g., 180cm, Male, 30 years)
3. Click "Analyze"
4. Verify measurements appear
5. Click on 3 different measurements
6. Verify torus rings appear in different colors and heights

---

## Environment Variables (Optional)

Create `.env` file in project root for custom configuration:

```env
# Backend
API_HOST=0.0.0.0
API_PORT=8000
API_DEBUG=false

# Frontend
REACT_APP_API_URL=http://localhost:8000
REACT_APP_ENV=development
```

## File Structure for Reference

```
d:\3Dmodel\
├── api/
│   ├── app.py              (FastAPI server)
│   └── requirements.txt
├── website/                (React frontend)
│   ├── src/
│   │   ├── components/
│   │   │   └── Model3DViewerSMPL.tsx
│   │   └── services/
│   │       └── api.ts
│   ├── public/
│   │   └── male-body.fbx   (3D model)
│   └── package.json
├── integrations/
│   ├── pipeline.py         (Measurement extraction)
│   └── size_recommendation.py
├── smpl_anthropometry/     (Measurement definitions)
│   ├── measure.py
│   └── measurement_definitions.py
└── REQUIREMENTS.md         (This file)
```

---

## Stopping the Application

**Terminal 1 (Backend)**: Press `Ctrl+C`
**Terminal 2 (Frontend)**: Press `Ctrl+C`

Both will gracefully shutdown.

---

## Additional Commands

### Clean npm cache
```bash
cd d:\3Dmodel\website
npm cache clean --force
npm install
```

### Rebuild backend from scratch
```bash
cd d:\3Dmodel
rmdir /s venv
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### View API logs
```bash
# Backend logs appear in Terminal 1 automatically
# For persistent logging, add to api/app.py:
import logging
logging.basicConfig(filename='api.log', level=logging.INFO)
```
