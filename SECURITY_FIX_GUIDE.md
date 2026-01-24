# 🚨 URGENT: GitHub Security Issue - Action Plan

**Date:** January 24, 2026  
**Severity:** CRITICAL  
**Issue:** Sensitive files (.env with API keys) pushed to GitHub

---

## 🔴 IMMEDIATE ACTIONS REQUIRED

### Step 1: Revoke ALL Exposed Credentials (DO THIS FIRST!)

**Exposed Secrets Found:**
- ✅ REPLICATE_API_TOKEN: `r8_ZK4KiS24UxL2VvUeyHiPDYVTmRSPdvl3jNf67`
- ✅ GROQ_API_KEY: `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`
- ✅ JWT_SECRET_KEY: `09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7`

**ACTION:** Immediately revoke and regenerate these credentials:

1. **Replicate API Token**
   - Go to: https://replicate.com/account/api-tokens
   - Delete the exposed token
   - Generate a new one

2. **GROQ API Key**
   - Go to: https://console.groq.com/keys
   - Revoke the exposed key
   - Create a new API key

3. **JWT Secret Key**
   - Generate a new secret (see commands below)

---

## 📋 CLEANUP PROCESS

### Option A: Complete Repository Cleanup (RECOMMENDED)

If the repository is NEW and doesn't have much history:

```powershell
# 1. Make the repository private immediately
# Go to GitHub: Settings > General > Danger Zone > Change visibility > Make Private

# 2. Create a new repository and start fresh
# This is the SAFEST option for new projects
```

### Option B: Remove Sensitive Files from Git History

If you need to keep the repository:

```powershell
# WARNING: This rewrites Git history. All collaborators need to re-clone!

# 1. First, backup everything
cd D:\3Dmodel
git branch backup-$(Get-Date -Format "yyyyMMdd-HHmmss")

# 2. Install git-filter-repo (if not already installed)
# Download from: https://github.com/newren/git-filter-repo
# Or use pip: pip install git-filter-repo

# 3. Remove .env file from all history
git filter-repo --invert-paths --path api/.env --force

# 4. Remove __pycache__ directories
git filter-repo --invert-paths --path-glob '*/__pycache__/*' --force
git filter-repo --invert-paths --path-glob '**/*.pyc' --force

# 5. Force push to overwrite remote history
git remote add origin YOUR_GITHUB_URL
git push origin --force --all
git push origin --force --tags
```

### Option C: Alternative - Using BFG Repo-Cleaner (Easier)

```powershell
# 1. Download BFG Repo-Cleaner
# https://rtyley.github.io/bfg-repo-cleaner/

# 2. Clone a fresh bare repository
cd D:\
git clone --mirror https://github.com/YOUR_USERNAME/YOUR_REPO.git

# 3. Run BFG to remove .env file
java -jar bfg.jar --delete-files .env YOUR_REPO.git

# 4. Clean up and push
cd YOUR_REPO.git
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force
```

---

## 🛡️ PREVENTION - Setup Proper .gitignore

I'll create a comprehensive .gitignore file for you now.

### Files That Should NEVER Be Committed:
- `.env` files (ALL environments)
- `__pycache__/` directories
- `*.pyc`, `*.pyo` files
- `node_modules/`
- API keys, credentials, certificates
- Database files
- IDE settings (optional)

---

## ✅ POST-CLEANUP VERIFICATION

After cleanup, verify:

```powershell
# 1. Check that .env is not in history
git log --all --full-history -- api/.env
# Should return: nothing

# 2. Check current tracked files
git ls-files | Select-String -Pattern "\.env|__pycache__|\.pyc"
# Should return: nothing

# 3. Verify .gitignore is working
git status
# .env and __pycache__ should NOT appear in untracked files
```

---

## 🔐 SECURITY BEST PRACTICES

### 1. Use Environment Variables
```powershell
# Instead of .env in code, use:
# - GitHub Secrets for CI/CD
# - Environment variables on server
# - Azure Key Vault for production
```

### 2. Create .env.example
```bash
# api/.env.example (safe to commit)
REPLICATE_API_TOKEN=your_token_here
GROQ_API_KEY=your_key_here
JWT_SECRET_KEY=generate_with_openssl
```

### 3. Add Pre-commit Hook
Create `.git/hooks/pre-commit`:
```bash
#!/bin/sh
if git diff --cached --name-only | grep -q "\.env$"; then
    echo "ERROR: Attempting to commit .env file!"
    exit 1
fi
```

### 4. Enable GitHub Secret Scanning
- Go to: Repository Settings > Security > Secret scanning
- Enable: "Secret scanning"
- Enable: "Push protection"

---

## 📱 MONITORING

### Check if Credentials Were Used
1. **Replicate Dashboard**
   - Check usage logs for unusual activity
   - Review API call history

2. **GROQ Console**
   - Check request logs
   - Review billing/usage spikes

3. **Your Application Logs**
   - Monitor for unauthorized access
   - Check JWT token usage

---

## 🎯 RECOMMENDED ACTIONS (Priority Order)

### Immediate (Next 5 minutes):
1. ✅ Make GitHub repository PRIVATE
2. ✅ Revoke REPLICATE_API_TOKEN
3. ✅ Revoke GROQ_API_KEY
4. ✅ Generate new JWT_SECRET_KEY

### Short Term (Next 30 minutes):
5. ✅ Remove .env from Git history (Option A, B, or C)
6. ✅ Create proper .gitignore files
7. ✅ Remove __pycache__ from Git history
8. ✅ Create .env.example files
9. ✅ Update local .env with new credentials

### Long Term (This week):
10. ✅ Set up GitHub Secret Scanning
11. ✅ Add pre-commit hooks
12. ✅ Review all other potential sensitive data
13. ✅ Enable 2FA on all service accounts
14. ✅ Document security practices for team

---

## 🔑 Generate New Secure Credentials

### New JWT Secret:
```powershell
# Generate secure JWT secret
$bytes = New-Object byte[] 32
[System.Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
$secret = [System.BitConverter]::ToString($bytes).Replace('-','').ToLower()
Write-Host "New JWT_SECRET_KEY: $secret"
```

Or using OpenSSL:
```bash
openssl rand -hex 32
```

---

## ⚠️ WHAT NOT TO DO

❌ Don't just delete .env and commit - it's still in history!  
❌ Don't ignore this - exposed keys can be used immediately  
❌ Don't commit new credentials trying to "fix" it  
❌ Don't think "making repo private" is enough (history is still there)  
❌ Don't share the cleanup commands publicly with your repo URL  

---

## 📞 IF YOU SUSPECT BREACH

If you notice unusual activity:
1. Immediately revoke ALL API keys
2. Change all passwords
3. Review application logs
4. Check for unauthorized database access
5. Contact service providers (Replicate, GROQ)
6. Consider incident response plan

---

## 📝 ADDITIONAL FILES TO CHECK

Other potentially sensitive files in your repo:
- Configuration files with passwords
- Database connection strings
- SSL certificates (.key, .pem files)
- Service account credentials
- OAuth tokens
- Any file with "secret", "password", "key" in name

Run this to check:
```powershell
git ls-files | Select-String -Pattern "password|secret|credential|token|key\.json|\.pem|\.key"
```

---

## ✅ VERIFICATION CHECKLIST

After completing cleanup:

- [ ] Repository is private or credentials removed from history
- [ ] All exposed API keys revoked
- [ ] New API keys generated and stored securely
- [ ] `.gitignore` file created at root level
- [ ] `.env` file is in `.gitignore`
- [ ] `__pycache__/` is in `.gitignore`
- [ ] Git history verified clean
- [ ] New .env file created locally (not committed)
- [ ] .env.example created and committed
- [ ] GitHub secret scanning enabled
- [ ] Team notified of new credentials (if applicable)
- [ ] Monitoring enabled for unusual API usage

---

## 🎓 LEARNING RESOURCES

- GitHub: Removing sensitive data from a repository
  https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository

- OWASP: Secure Coding Practices
  https://owasp.org/www-project-secure-coding-practices-quick-reference-guide/

- Git Security Best Practices
  https://github.blog/2022-04-07-git-security-vulnerability-announced/

---

**TIME SENSITIVE:** The longer exposed credentials remain active, the higher the risk!

**PRIORITY:** Make repository private NOW, then follow cleanup steps.
