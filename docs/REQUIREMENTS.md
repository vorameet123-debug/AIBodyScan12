# Requirements & Setup

## System Requirements

- **Operating System**: Windows 10+, macOS 10.14+, or Linux
- **RAM**: 8GB minimum (16GB recommended for PARE inference)
- **GPU**: NVIDIA GPU with CUDA support (optional but recommended for 3D body pose estimation)
- **Storage**: 5GB free space

## Software Requirements

### Python Backend
- **Python**: 3.8 - 3.11
- **pip**: Latest version

### Frontend
- **Node.js**: 16.x or 18.x LTS
- **npm**: 8.x or later

## Core Dependencies

### Backend (Python)
```
FastAPI==0.104.1          # REST API framework
uvicorn==0.24.0           # ASGI server
numpy==1.24.3             # Numerical computing
opencv-python==4.8.1.78   # Image processing
torch==2.0.1              # Deep learning (CPU or GPU)
torchvision==0.15.2       # Computer vision utilities
scikit-image==0.21.0      # Image processing
trimesh==3.24.1           # 3D mesh processing
smplx==0.1.28             # SMPL-X model
opencv-contrib-python==4.8.1.78
python-multipart==0.0.6   # Form data support
```

### PARE (3D Reconstruction)
- Located in `pare/` directory
- Requires: PyTorch, torchvision, OpenCV
- Extracts SMPL mesh vertices (6890 points per person)

### SMPL-Anthropometry (Measurement Extraction)
- Located in `smpl_anthropometry/` directory
- Extracts 18 standardized body measurements from SMPL mesh
- Uses joint definitions and measurement landmarks

### Frontend (React/TypeScript)
```json
{
  "react": "^18.2.0",
  "typescript": "^4.9.5",
  "tailwindcss": "^3.3.6",
  "three": "^0.160.0",
  "three-stdlib": "^1.8.8",
  "axios": "^1.6.2",
  "react-hot-toast": "^2.4.1",
  "framer-motion": "^10.16.4",
  "lucide-react": "^0.303.0"
}
```

## Key Packages Explained

### Three.js (3D Rendering)
- WebGL rendering engine for interactive 3D graphics
- Used for displaying FBX mannequin model and measurement rings
- Version 0.160.0 with FBXLoader addon

### PyTorch
- Deep learning framework for PARE model inference
- Can run on CPU or GPU (GPU recommended for speed)
- Used for 3D human pose and body shape estimation

### FastAPI
- Modern Python web framework for building REST APIs
- Asynchronous request handling
- Automatic API documentation (Swagger/OpenAPI)

## Installation Instructions

### 1. Backend Setup
```bash
cd d:\3Dmodel
python -m venv venv
venv\Scripts\activate

# Install backend dependencies
pip install -r requirements.txt
```

### 2. Frontend Setup
```bash
cd d:\3Dmodel\website
npm install
```

### 3. SMPL Anthropometry (Optional - Already Installed)
```bash
cd d:\3Dmodel\smpl_anthropometry
pip install -r requirements.txt
```

## Port Configuration

- **Backend API**: http://localhost:8000
  - Main endpoint: POST `/api/v1/measurements`
  - Expects: FormData with image and body parameters
  - Returns: JSON with 18 body measurements

- **Frontend**: http://localhost:3000
  - React development server
  - Hot reload enabled

## Data Files Required

### Pre-Downloaded Assets
- `data/smpl/SMPL_FEMALE.pkl` - Female SMPL model
- `data/smpl/SMPL_MALE.pkl` - Male SMPL model
- `data/smpl/SMPL_NEUTRAL.pkl` - Neutral SMPL model
- `pare/data/yolov3.weights` - Object detection weights
- `pare/data/J_regressor_h36m.npy` - Joint regression matrix

### 3D Model
- `website/public/male-body.fbx` - 3D mannequin model (252KB)
- Format: Autodesk FBX binary
- Used for realistic body visualization in browser

## Optional GPU Setup

### NVIDIA CUDA (For GPU Acceleration)
```bash
# Install CUDA Toolkit 11.8+ from NVIDIA
# Then install PyTorch with CUDA support:
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
```

## Troubleshooting

### PyTorch CPU vs GPU
- If GPU not available, PyTorch automatically uses CPU
- CPU inference is slower but functional (5-10 seconds per image)
- GPU inference is 10-20x faster (0.5-1 second per image)

### Memory Issues
- If running out of memory, reduce batch size in `api/app.py`
- Consider using CPU instead of GPU for lower memory usage

### Import Errors
- Ensure Python version is 3.8-3.11
- Virtual environment activated before installing
- All pip packages installed without errors
