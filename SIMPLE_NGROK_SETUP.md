# Simple ngrok Setup (RECOMMENDED)
## One URL for Everything - Frontend + Backend

This is the **simplest and best** approach for your demo. FastAPI serves the React build files, and ngrok exposes everything through one public URL.

---

## Architecture
```
Your Laptop
  └─ FastAPI serves:
      ├─ React Frontend (built files)
      └─ API endpoints (/api/*)
          └─ ngrok tunnel → https://your-id.ngrok.app
              └─ Share this ONE URL with everyone!
```

---

## Setup Steps

### Step 1: Install ngrok (one-time)
```powershell
# Download from https://ngrok.com/download
# Extract and add to PATH or place in d:\3Dmodel\

# Authenticate (free account required)
ngrok config add-authtoken YOUR_AUTH_TOKEN
```

### Step 2: Build React Frontend (one-time)
```powershell
cd d:\3Dmodel\website
npm install
npm run build
```

This creates `website/dist/` folder with optimized production files.

### Step 3: Configure FastAPI to Serve Frontend
Already configured! The backend will automatically serve files from `website/dist/`.

### Step 4: Start Everything
```powershell
# Start backend (serves API + Frontend)
cd d:\3Dmodel\api
python run.py

# In new terminal, start ngrok
ngrok http 8000
```

### Step 5: Share the URL
Copy the `https://*.ngrok.app` URL from ngrok terminal and share it!

**That's it!** One URL for everything - no Vercel, no CORS, no complexity.

---

## Daily Workflow

```powershell
# 1. Start backend
cd d:\3Dmodel\api
python run.py

# 2. Start ngrok (new terminal)
ngrok http 8000

# 3. Share ngrok URL with others
# Example: https://abcd-1234.ngrok.app
```

---

## When to Rebuild Frontend

Only rebuild when you change React code:
```powershell
cd d:\3Dmodel\website
npm run build
```

Then restart the backend to serve new files.

---

## Automation Script

Run this to start everything:
```powershell
powershell -ExecutionPolicy Bypass -File start-simple.ps1
```

---

## Troubleshooting

### Frontend shows old version
Solution: Rebuild and restart backend
```powershell
cd d:\3Dmodel\website && npm run build
cd d:\3Dmodel\api && python run.py
```

### 404 errors
Solution: Make sure `website/dist/` folder exists (run `npm run build`)

### ngrok URL changed
Solution: Just share the new URL - no redeployment needed!

---

## Advantages Over Vercel Setup

| Feature | ngrok Only | ngrok + Vercel |
|---------|-----------|----------------|
| URLs to manage | 1 | 2 |
| CORS setup | Not needed | Required |
| Deployment steps | 1 command | 2 services |
| When ngrok URL changes | Share new URL | Redeploy frontend |
| Complexity | ⭐ Simple | ⭐⭐⭐ Complex |

---

## Cost
**FREE** - Everything runs on your laptop!

---

## Limitations

- ⚠️ Laptop must stay on
- ⚠️ ngrok free URL changes on restart (upgrade to Pro for static domain)
- ⚠️ 2-hour session timeout on free plan

---

## Optional: Static ngrok Domain

Upgrade to ngrok Pro ($8/month) to get:
- Permanent URL that never changes
- No session timeouts
- Custom domain: `api.yourdomain.com`

Then your URL stays the same forever!
