# BodyScan AI — AI-Powered Body Intelligence Platform

> AI-driven body measurement extraction, clothing fit analysis, wardrobe management, and fashion intelligence — all from a single photo.

---

## ✨ Features

### 🔬 AI Body Scanning
- Upload a front-view photo → extract **18 body measurements** using SMPL 3D body reconstruction
- Interactive **3D mannequin** with measurement ring visualization (Three.js)
- Size recommendations across clothing categories

### 👔 Intelligent Fit Checker
- Upload a clothing image → get AI-powered fit analysis against your measurements
- **Fit meters** per body zone (chest, waist, hips, shoulders, etc.)
- Roast-style verdict, color matching, style tips, and occasion analysis
- Powered by **Groq Vision AI (Llama 4)**

### 👗 Smart Wardrobe
- Digital wardrobe with analytics dashboard
- Color palette analysis, style distribution, and outfit insights
- Fit history tracking with wishlist support

### 📊 Fashion Intelligence
- Real-time trend analysis and seasonal forecasts
- Personal style scoring and recommendations
- Body shape progress tracking over time

### 💳 Payments & Subscriptions
- **Razorpay** integration with signature verification (HMAC-SHA256)
- Free tier with usage limits + Pro plan unlock
- **Email receipts** via Gmail SMTP on successful payment

### 🔐 Auth & Security
- JWT authentication with **Argon2** password hashing
- Refresh tokens stored in DB with revocation support
- Google OAuth login
- Email verification & password reset flows
- OWASP security headers (CSP, HSTS, X-Frame-Options)
- Per-user rate limiting (slowapi)

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Tailwind CSS, Framer Motion |
| **Backend** | Python, FastAPI, SQLModel, Uvicorn |
| **AI/ML** | Groq Vision (Llama 4), OpenCV, PARE, SMPL |
| **3D** | Three.js, FBX Loader |
| **Database** | SQLite (dev) / PostgreSQL (prod) |
| **Payments** | Razorpay |
| **Auth** | JWT + Argon2 + Google OAuth |
| **Email** | Gmail SMTP (transactional) |
| **DevOps** | Docker, GitHub Actions CI/CD, Nginx |
| **Monitoring** | Prometheus, Grafana, Sentry |

---

## 📁 Project Structure

```
├── api/                 # FastAPI backend (auth, payments, AI endpoints)
├── website/             # React frontend (TypeScript + Tailwind)
├── mobile/              # Mobile app
├── integrations/        # AI services (Groq, trend analyzer, pipeline)
├── pare/                # PARE 3D body reconstruction model
├── smpl_anthropometry/  # SMPL measurement extraction
├── source/              # 3D model assets (FBX, textures)
├── data/                # SMPL model data
├── tests/               # API test suite
├── docs/                # Documentation
├── k8s/                 # Kubernetes manifests
├── monitoring/          # Prometheus + Grafana configs
├── .github/             # CI/CD workflows
├── Dockerfile           # Multi-stage Docker build
├── docker-compose.yml   # Development stack
└── docker-compose.prod.yml  # Production stack (PostgreSQL + Redis + Nginx)
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- Git

### 1. Clone & Setup Backend
```bash
git clone https://github.com/vorameet123-debug/AIBodyScan12.git
cd AIBodyScan12

python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS/Linux

pip install -r requirements.txt
```

### 2. Configure Environment
```bash
cp api/.env.example api/.env
# Edit api/.env with your API keys (Groq, Razorpay, SMTP)
```

### 3. Start Backend
```bash
cd api
python app.py
# → API running at http://localhost:8000
# → Docs at http://localhost:8000/docs
```

### 4. Start Frontend
```bash
cd website
npm install
npm start
# → App running at http://localhost:3000
```

---

## 🐳 Docker Deployment

```bash
# Development
docker-compose up

# Production (PostgreSQL + Redis + Nginx)
docker-compose -f docker-compose.prod.yml up -d
```

---

## 📚 Documentation

| Doc | Description |
|-----|-------------|
| [How to Run](docs/HOW_TO_RUN.md) | Complete setup guide with troubleshooting |
| [Technical Architecture](docs/TECHNICAL.md) | System design, SMPL pipeline, 3D rendering |
| [Requirements](docs/REQUIREMENTS.md) | System & software requirements |
| [API Reference](docs/HOW_TO_RUN_API.md) | API endpoints and usage |

---

## 🔑 Environment Variables

| Variable | Purpose |
|----------|---------|
| `GROQ_API_KEY` | Groq AI for fit analysis |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Payment processing |
| `JWT_SECRET_KEY` | JWT token signing |
| `SMTP_USER` / `SMTP_PASSWORD` | Email service (Gmail) |
| `APP_URL` | Frontend URL for email links |

See `api/.env.example` for the full list.

---

## 📝 License

Proprietary — All rights reserved.
