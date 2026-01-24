# Netlify Deployment Guide

## 🚀 Deploy to Netlify (Alternative to Vercel)

### Step 1: Deploy Frontend

#### Option A: Netlify CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy from root
cd D:\3Dmodel
netlify init

# Follow prompts:
# - Base directory: website
# - Build command: npm run build
# - Publish directory: website/build
```

#### Option B: Netlify Dashboard
1. Go to: https://app.netlify.com/
2. Click "Add new site" → "Import an existing project"
3. Connect to GitHub
4. Configure:
   - **Base directory:** `website`
   - **Build command:** `npm run build`
   - **Publish directory:** `website/build`
   - **Build settings:** Already in `netlify.toml` ✅

### Step 2: Set Environment Variables
Go to: Site settings → Environment variables

Add:
```
REACT_APP_API_URL=https://your-backend-url.com
```

### Step 3: Deploy Backend
Same as Vercel guide - use Render, Railway, or Fly.io

---

## 🎯 Quick Command Reference

### Netlify CLI Commands
```bash
# Deploy preview
netlify deploy

# Deploy to production
netlify deploy --prod

# Open site in browser
netlify open

# View logs
netlify logs
```

---

## ✅ Checklist
- [ ] Connect GitHub repo
- [ ] Configure build settings
- [ ] Set environment variables
- [ ] Deploy backend separately
- [ ] Update API URL in Netlify
- [ ] Test deployment

Done! Your app is live! 🎉
