# Vercel Deployment Guide for 3D Model Fashion App

## 🚀 Quick Deployment Steps

### Part 1: Deploy Frontend to Vercel (5 minutes)

#### 1. Prepare the project
```bash
cd website
npm install
npm run build  # Test build locally
```

#### 2. Deploy to Vercel

**Option A: Using Vercel CLI (Fastest)**
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy from root directory
cd D:\3Dmodel
vercel
```

**Option B: Using Vercel Dashboard**
1. Go to: https://vercel.com/new
2. Import your GitHub repository
3. Configure:
   - **Framework Preset:** Create React App
   - **Root Directory:** `website`
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`

#### 3. Set Environment Variables in Vercel

Go to: Project Settings → Environment Variables

Add:
```
REACT_APP_API_URL=https://your-api-url.com
```

---

### Part 2: Deploy Backend API

Your Python backend needs a server. **Choose one:**

#### **Option A: Render.com (Recommended - Free Tier)**

1. Go to: https://render.com/
2. Click "New +" → "Web Service"
3. Connect your GitHub repo
4. Configure:
   - **Name:** `3dmodel-api`
   - **Region:** Choose closest
   - **Branch:** `main`
   - **Root Directory:** `api`
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app:app --host 0.0.0.0 --port $PORT`

5. Add Environment Variables:
   ```
   REPLICATE_API_TOKEN=your_new_token
   GROQ_API_KEY=your_new_key
   JWT_SECRET_KEY=your_new_secret
   JWT_ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=1440
   REFRESH_TOKEN_EXPIRE_DAYS=30
   ```

6. Deploy!

#### **Option B: Railway.app**

1. Go to: https://railway.app/
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repo
4. Railway auto-detects Python
5. Set Root Directory: `api`
6. Add environment variables (same as above)
7. Deploy!

#### **Option C: Fly.io**

1. Install Fly CLI: https://fly.io/docs/hands-on/install-flyctl/
2. Login: `fly auth login`
3. Create app:
```bash
cd D:\3Dmodel\api
fly launch
```
4. Set secrets:
```bash
fly secrets set REPLICATE_API_TOKEN=your_token
fly secrets set GROQ_API_KEY=your_key
fly secrets set JWT_SECRET_KEY=your_secret
```
5. Deploy: `fly deploy`

---

### Part 3: Connect Frontend to Backend

Once backend is deployed:

1. Copy your backend URL (e.g., `https://3dmodel-api.onrender.com`)
2. Update Vercel environment variable:
   - Go to Vercel Project → Settings → Environment Variables
   - Update `REACT_APP_API_URL` with your backend URL
3. Redeploy frontend: `vercel --prod`

---

## 🔧 Required Files

### For Backend Deployment: `api/requirements.txt`
Make sure this includes all dependencies:
```txt
fastapi
uvicorn[standard]
sqlmodel
python-multipart
python-jose[cryptography]
passlib[bcrypt]
python-dotenv
opencv-python-headless
numpy
loguru
replicate
groq
```

### For Frontend: Already configured in `package.json` ✅

---

## ⚙️ Environment Variables Setup

### Frontend (Vercel)
```
REACT_APP_API_URL=https://your-backend.onrender.com
```

### Backend (Render/Railway/Fly)
```
REPLICATE_API_TOKEN=your_new_replicate_token
GROQ_API_KEY=your_new_groq_key
JWT_SECRET_KEY=your_new_jwt_secret_here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
REFRESH_TOKEN_EXPIRE_DAYS=30
DATABASE_URL=sqlite:///./data.db
```

---

## 🎯 Deployment Checklist

- [ ] Generate new API keys (Replicate, GROQ)
- [ ] Generate new JWT secret
- [ ] Test frontend build locally: `cd website && npm run build`
- [ ] Deploy backend to Render/Railway/Fly
- [ ] Set backend environment variables
- [ ] Test backend API (visit `/docs` endpoint)
- [ ] Deploy frontend to Vercel
- [ ] Set frontend environment variables
- [ ] Update frontend with backend URL
- [ ] Test full application
- [ ] Set up custom domain (optional)

---

## 🔍 Testing Deployed App

### Test Backend:
```bash
# Health check
curl https://your-backend-url.com/

# API docs
# Visit: https://your-backend-url.com/docs
```

### Test Frontend:
```bash
# Visit your Vercel URL
# Try: Login, Upload Image, View Results
```

---

## 💡 Pro Tips

### 1. Custom Domain
- **Vercel:** Project Settings → Domains → Add domain
- **Backend:** Most platforms support custom domains in settings

### 2. Automatic Deployments
Both Vercel and Render/Railway auto-deploy on git push to main branch!

### 3. Logs
- **Vercel:** Dashboard → Deployments → Logs
- **Render:** Dashboard → Logs tab
- **Railway:** Dashboard → Deployments → View Logs

### 4. Database
For production, consider:
- **Supabase** (PostgreSQL)
- **PlanetScale** (MySQL)
- **MongoDB Atlas**

Instead of SQLite (current setup)

---

## 🚨 Common Issues

### Issue 1: CORS Errors
Make sure backend has correct CORS settings:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Issue 2: Build Fails
- Check Node version: Vercel uses Node 18 by default
- Verify all dependencies in package.json
- Check build logs for specific errors

### Issue 3: API Not Responding
- Verify environment variables are set
- Check backend logs for errors
- Ensure port binding: `--host 0.0.0.0 --port $PORT`

### Issue 4: Database Issues
- SQLite works for development
- For production, use PostgreSQL/MySQL
- Check file permissions for SQLite

---

## 📊 Cost Estimate

### Free Tier (Good for development):
- **Vercel:** Free (hobby plan)
- **Render:** Free (512MB RAM, sleeps after 15 min inactivity)
- **Railway:** $5/month credit free
- **Fly.io:** Free tier available

### Paid (For production):
- **Vercel Pro:** $20/month
- **Render Starter:** $7/month (always on)
- **Railway:** Pay as you go (~$10-20/month)

---

## 🎉 Next Steps After Deployment

1. Monitor performance and logs
2. Set up error tracking (Sentry)
3. Enable analytics (Vercel Analytics)
4. Set up CI/CD if not automatic
5. Configure backup strategy for database
6. Add monitoring/alerting

---

**Questions?** Check logs first, then review this guide!
