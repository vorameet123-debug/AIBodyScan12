# 🚨 IMMEDIATE ACTION STEPS

**Your .env file with API keys is on GitHub! Follow these steps NOW:**

---

## Step 1: Make Repository Private (60 seconds)

1. Go to: https://github.com/YOUR_USERNAME/YOUR_REPO/settings
2. Scroll to bottom: "Danger Zone"
3. Click "Change visibility"
4. Select "Make private"
5. Confirm

**This stops public access immediately!**

---

## Step 2: Revoke API Keys (5 minutes)

### Replicate API Token
1. Go to: https://replicate.com/account/api-tokens
2. Find: `r8_ZK4KiS24UxL2VvUeyHiPDYVTmRSPdvl3jNf67`
3. Click "Delete" or "Revoke"
4. Generate new token
5. Save it securely (NOT in Git)

### GROQ API Key
1. Go to: https://console.groq.com/keys
2. Find: `gsk_ayi5OhVlbmBeA8QysFHPWGdyb3FY...`
3. Click "Revoke" or "Delete"
4. Create new API key
5. Save it securely (NOT in Git)

---

## Step 3: Generate New JWT Secret (1 minute)

Run in PowerShell:
```powershell
$bytes = New-Object byte[] 32
[System.Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
$secret = [System.BitConverter]::ToString($bytes).Replace('-','').ToLower()
Write-Host "Your new JWT_SECRET_KEY:"
Write-Host $secret
```

Copy the output and save it securely.

---

## Step 4: Update Local .env File (2 minutes)

```powershell
cd D:\3Dmodel\api
notepad .env
```

Replace with your NEW credentials:
```
REPLICATE_API_TOKEN=YOUR_NEW_TOKEN_HERE
GROQ_API_KEY=YOUR_NEW_KEY_HERE
JWT_SECRET_KEY=YOUR_NEW_SECRET_HERE
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
REFRESH_TOKEN_EXPIRE_DAYS=30
```

Save and close.

---

## Step 5: Remove .env from Git Tracking (3 minutes)

```powershell
cd D:\3Dmodel

# Stop tracking .env file
git rm --cached api/.env

# Stop tracking __pycache__ files
git rm -r --cached "**/__pycache__"

# Add the .gitignore
git add .gitignore

# Commit the changes
git commit -m "Remove sensitive files and add .gitignore"

# Push to GitHub
git push origin main
```

---

## Step 6: Clean Git History (Optional but Recommended)

**WARNING: This rewrites history. Only do if you understand the implications.**

### Option A: Start Fresh (Easiest for New Projects)
```powershell
# 1. Delete the GitHub repository
# 2. Create a new empty repository
# 3. Remove .git folder locally
Remove-Item -Recurse -Force .git

# 4. Re-initialize
git init
git add .
git commit -m "Initial commit with proper .gitignore"
git branch -M main
git remote add origin YOUR_NEW_GITHUB_URL
git push -u origin main
```

### Option B: Use BFG Repo-Cleaner (For Existing Projects)
```powershell
# 1. Install BFG
# Download from: https://rtyley.github.io/bfg-repo-cleaner/

# 2. Clone bare repository
cd D:\
git clone --mirror YOUR_GITHUB_URL repo-backup.git

# 3. Remove .env from history
java -jar bfg-1.14.0.jar --delete-files .env repo-backup.git

# 4. Clean and push
cd repo-backup.git
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force

# 5. Re-clone your repository
cd D:\
Remove-Item -Recurse -Force 3Dmodel
git clone YOUR_GITHUB_URL 3Dmodel
```

---

## ✅ Verification Checklist

After completing steps 1-5:

- [ ] Repository is private on GitHub
- [ ] Old Replicate token deleted
- [ ] New Replicate token generated and saved
- [ ] Old GROQ key deleted
- [ ] New GROQ key generated and saved
- [ ] New JWT secret generated
- [ ] Local .env updated with new credentials
- [ ] .env removed from Git tracking
- [ ] .gitignore added and committed
- [ ] Changes pushed to GitHub
- [ ] Verified .env not in `git status`

---

## 🎯 Quick Command Summary

All commands in one place:

```powershell
# Navigate to project
cd D:\3Dmodel

# Remove tracked sensitive files
git rm --cached api/.env
git rm -r --cached "**/__pycache__"
git rm -r --cached "**/*.pyc"

# Add .gitignore
git add .gitignore

# Commit
git commit -m "Security: Remove sensitive files and add .gitignore"

# Push
git push origin main

# Verify .env is ignored
git status
# .env should NOT appear here
```

---

## 📱 After Cleanup

1. Test your application with new credentials
2. Monitor API usage for unusual activity
3. Set up GitHub secret scanning
4. Consider using GitHub Secrets for CI/CD
5. Add pre-commit hooks to prevent future issues

---

## ⚠️ Important Notes

- **Do NOT commit** .env file again
- **Do NOT share** your new API keys
- **Do backup** your .env file securely (not in Git)
- **Do monitor** your API usage for a few days
- **Consider** using environment variables in production

---

**TIME TO COMPLETE: ~15 minutes**

**Full details:** See [SECURITY_FIX_GUIDE.md](SECURITY_FIX_GUIDE.md)
