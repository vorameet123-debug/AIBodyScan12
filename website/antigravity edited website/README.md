# 3D Body Measurement Analysis System

An AI-powered web application that extracts body measurements from photos and visualizes them on an interactive 3D mannequin model with measurement rings.

## 🚀 Quick Start

```bash
# Terminal 1 - Backend
cd d:\3Dmodel
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python api/app.py

# Terminal 2 - Frontend
cd d:\3Dmodel\website
npm install
npm start
```

Open http://localhost:3000 in your browser.

## 📚 Documentation

- **[HOW_TO_RUN.md](HOW_TO_RUN.md)** - Detailed setup and execution guide
- **[REQUIREMENTS.md](REQUIREMENTS.md)** - System requirements and dependencies
- **[TECHNICAL.md](TECHNICAL.md)** - Architecture, complexities, and technical decisions

## ✨ Features

- **AI Body Pose Estimation**: Uses PARE model to extract 3D body mesh from 2D photos
- **18 Body Measurements**: Head circumference, chest, waist, hips, and more
- **3D Interactive Model**: Realistic FBX mannequin that rotates and responds to gestures
- **Measurement Visualization**: Click any measurement to see a torus ring on the 3D model
- **Clothing Size Recommendations**: Automatic size suggestions based on measurements
- **Professional UI**: Modern React interface with Tailwind CSS styling

## 🏗️ System Architecture

```
Image Upload
    ↓
[PARE Model] - 3D body reconstruction (6890 vertices)
    ↓
[SMPL-Anthropometry] - Extract 18 measurements
    ↓
[React UI] - Interactive 3D visualization + rings
    ↓
Size Recommendations
```

## 🎯 Key Technologies

- **Backend**: FastAPI (Python) on port 8000
- **Frontend**: React + TypeScript on port 3000
- **3D Rendering**: Three.js with FBX model
- **AI Models**: PARE for pose estimation, SMPL for body shape
- **Measurements**: SMPL-Anthropometry with 18 standardized measurements

## 📊 Measurements Extracted

Circumferences: head, neck, chest, waist, hip, thigh, calf, ankle, bicep, forearm, wrist
Heights/Lengths: shoulder-to-crotch, arm, inseam, height, outseam
Other: shoulder breadth

## ⚙️ System Requirements

- Python 3.8-3.11
- Node.js 16+
- 8GB RAM (16GB recommended)
- Optional: NVIDIA GPU for faster processing

## 🔧 Troubleshooting

See **[HOW_TO_RUN.md](HOW_TO_RUN.md)** for common issues and solutions.

## 📖 More Information

For detailed technical architecture, known complexities, and fixes applied, see **[TECHNICAL.md](TECHNICAL.md)**.
