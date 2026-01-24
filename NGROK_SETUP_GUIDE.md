# ngrok + Vercel Deployment Guide

## Overview
This setup allows you to run the FastAPI backend on your laptop and expose it via ngrok, while the React frontend is deployed on Vercel. Anyone can access your app through the Vercel URL.

## Architecture
```
Your Laptop (Backend)
  └─ FastAPI (localhost:8000)
      └─ ngrok tunnel → https://your-unique-id.ngrok.app
          └─ Vercel (Frontend) → https://your-app.vercel.app
              └─ Users access this URL
```

---

## Part 1: Install and Setup ngrok

### Step 1: Install ngrok
1. Visit https://ngrok.com/download
2. Download ngrok for Windows
3. Extract the ZIP file to a permanent location (e.g., `C:\Program Files\ngrok\`)
4. Add ngrok to your PATH:
   - Open Environment Variables
   - Edit "Path" variable
   - Add `C:\Program Files\ngrok\`

### Step 2: Create ngrok Account (Free)
1. Sign up at https://dashboard.ngrok.com/signup
2. After login, go to "Your Authtoken" page
3. Copy your authtoken

### Step 3: Configure ngrok
```powershell
# Authenticate ngrok (one-time setup)
ngrok config add-authtoken YOUR_AUTH_TOKEN_HERE
```

---

## Part 2: Prepare Your Backend

### Step 1: Create `.env` file (if not exists)
```bash
# d:\3Dmodel\api\.env
DATABASE_URL=sqlite:///./data.db
SECRET_KEY=your-secret-key-here
REPLICATE_API_TOKEN=your-replicate-token
GROQ_API_KEY=your-groq-key

# This will be updated when ngrok starts
FRONTEND_URL=http://localhost:3000
```

### Step 2: Update CORS Configuration
The backend has been configured to accept ngrok and Vercel URLs.

### Step 3: Test Backend Locally
```powershell
cd d:\3Dmodel\api
python run.py
```
You should see: `Uvicorn running on http://0.0.0.0:8000`

---

## Part 3: Start ngrok Tunnel

### Basic Method (Terminal)
```powershell
# Keep backend running, open new terminal
ngrok http 8000
```

You'll see output like:
```
Session Status                online
Account                       your-email@example.com
Version                       3.x.x
Region                        United States (us)
Forwarding                    https://abcd-1234-xyz.ngrok.app -> http://localhost:8000
```

**Copy the `https://...ngrok.app` URL** - this is your backend URL!

### Advanced Method (Configuration File)
Create `d:\3Dmodel\ngrok.yml`:
```yaml
version: "2"
authtoken: YOUR_AUTH_TOKEN_HERE
tunnels:
  api:
    addr: 8000
    proto: http
    schemes:
      - https
    inspect: true
```

Start tunnel:
```powershell
ngrok start --config d:\3Dmodel\ngrok.yml api
```

---

## Part 4: Configure Frontend for Vercel

### Step 1: Update Frontend Environment
Edit `d:\3Dmodel\website\.env.production`:
```env
VITE_API_URL=https://your-unique-id.ngrok.app
```

**Replace `your-unique-id.ngrok.app` with your actual ngrok URL!**

### Step 2: Verify API Service
Check that `d:\3Dmodel\website\src\services\api.ts` uses the environment variable:
```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
```

### Step 3: Deploy to Vercel
```powershell
cd d:\3Dmodel\website

# Login to Vercel (one-time)
npx vercel login

# Deploy to production
npx vercel --prod
```

Follow the prompts:
- Project name: `aibodyscan` (or your choice)
- Framework: React
- Build command: `npm run build`
- Output directory: `dist`

You'll get a URL like: `https://aibodyscan.vercel.app`

---

## Part 5: Complete Workflow

### Daily Usage Steps:
1. **Start Backend**
   ```powershell
   cd d:\3Dmodel\api
   python run.py
   ```

2. **Start ngrok Tunnel** (new terminal)
   ```powershell
   ngrok http 8000
   ```

3. **Copy ngrok URL** (e.g., `https://abcd-1234-xyz.ngrok.app`)

4. **Update Frontend** (if ngrok URL changed)
   ```powershell
   cd d:\3Dmodel\website
   # Edit .env.production with new ngrok URL
   npx vercel --prod
   ```

5. **Share Vercel URL** with others!

---

## Part 6: Important Notes

### ngrok Free Plan Limitations:
- ✅ HTTPS support
- ✅ Unlimited connections
- ✅ Basic authentication
- ⚠️ URL changes every restart (unless you upgrade)
- ⚠️ Session expires after 2 hours (need to restart)

### Upgrade Benefits (ngrok Pro - $8/month):
- 🎯 **Static domain**: Your URL never changes
- 🎯 No session timeouts
- 🎯 Custom domains: `api.yourdomain.com`
- 🎯 Reserved TCP addresses

### Keeping It Running:
Your laptop must stay on and connected to internet for the app to work!

To keep backend running even if terminal closes:
```powershell
# Option 1: Use pythonw (Windows background)
start pythonw d:\3Dmodel\api\run.py

# Option 2: Create a Windows service (advanced)
```

---

## Part 7: Automation Scripts

### `start-demo.ps1` (PowerShell Script)
Create `d:\3Dmodel\start-demo.ps1`:
```powershell
# Start AIBodyScan Demo
Write-Host "🚀 Starting AIBodyScan Backend..." -ForegroundColor Cyan

# Start backend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd d:\3Dmodel\api; python run.py"

# Wait for backend to start
Start-Sleep -Seconds 5

# Start ngrok in new window
Write-Host "🌐 Starting ngrok tunnel..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "ngrok http 8000"

Write-Host ""
Write-Host "✅ Demo Started!" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Copy the ngrok URL from the tunnel window"
Write-Host "2. Update website\.env.production with the ngrok URL"
Write-Host "3. Run: cd website && npx vercel --prod"
Write-Host "4. Share your Vercel URL!"
Write-Host ""
```

Usage:
```powershell
powershell -ExecutionPolicy Bypass -File d:\3Dmodel\start-demo.ps1
```

### `deploy-frontend.ps1` (Quick Frontend Deploy)
Create `d:\3Dmodel\deploy-frontend.ps1`:
```powershell
param(
    [Parameter(Mandatory=$true)]
    [string]$NgrokUrl
)

Write-Host "📝 Updating frontend configuration..." -ForegroundColor Cyan

# Update .env.production
$envContent = "VITE_API_URL=$NgrokUrl"
$envContent | Out-File -FilePath "d:\3Dmodel\website\.env.production" -Encoding UTF8

Write-Host "🚀 Deploying to Vercel..." -ForegroundColor Green
cd d:\3Dmodel\website
npx vercel --prod

Write-Host ""
Write-Host "✅ Deployment Complete!" -ForegroundColor Green
```

Usage:
```powershell
powershell -ExecutionPolicy Bypass -File d:\3Dmodel\deploy-frontend.ps1 -NgrokUrl "https://your-id.ngrok.app"
```

---

## Part 8: Troubleshooting

### Issue: ngrok tunnel shows 502 Bad Gateway
**Solution**: Backend is not running. Start `python run.py` first.

### Issue: CORS errors in browser console
**Solution**: Check that ngrok URL is in backend CORS allowed origins.

### Issue: ngrok URL changed
**Solution**: Update `website\.env.production` and redeploy:
```powershell
cd website
npx vercel --prod
```

### Issue: ngrok session expired
**Solution**: Restart ngrok tunnel. Consider upgrading to Pro for no timeouts.

### Issue: Cannot connect to backend
**Solution**: 
1. Check Windows Firewall allows Python
2. Verify backend runs on `0.0.0.0:8000` not `127.0.0.1:8000`
3. Test ngrok URL directly: `https://your-id.ngrok.app/docs`

---

## Part 9: Monitoring and Debugging

### View ngrok Web Interface
While ngrok is running, visit: http://localhost:4040
- See all HTTP requests in real-time
- Replay requests
- Inspect headers and bodies

### Check Backend Health
Visit your ngrok URL + `/docs`:
```
https://your-unique-id.ngrok.app/docs
```
You should see the FastAPI Swagger documentation.

### Test API Endpoint
```powershell
curl https://your-unique-id.ngrok.app/api/health
```

---

## Part 10: Cost Breakdown

### Current Setup (FREE):
- ✅ ngrok Free: $0/month
- ✅ Vercel Hobby: $0/month (100GB bandwidth)
- ✅ Your laptop: Electricity only
- **Total: $0/month** 🎉

### Recommended Upgrades:
- ngrok Pro ($8/month): Static domain, no timeouts
- Vercel Pro ($20/month): More bandwidth, better analytics

---

## Quick Reference

### Start Everything:
```powershell
# Terminal 1: Backend
cd d:\3Dmodel\api && python run.py

# Terminal 2: Ngrok
ngrok http 8000

# Terminal 3: Deploy Frontend (when URL changes)
cd d:\3Dmodel\website && npx vercel --prod
```

### Vercel Environment Variables:
Set in Vercel Dashboard → Settings → Environment Variables:
- `VITE_API_URL`: Your ngrok URL

### ngrok Configuration Files:
- Auth config: `%USERPROFILE%\.ngrok2\ngrok.yml`
- Logs: Check ngrok terminal output

---

## Support

- ngrok Documentation: https://ngrok.com/docs
- Vercel Documentation: https://vercel.com/docs
- ngrok Dashboard: https://dashboard.ngrok.com
- Vercel Dashboard: https://vercel.com/dashboard

**Pro Tip**: Bookmark your ngrok web interface (http://localhost:4040) for easy debugging!
