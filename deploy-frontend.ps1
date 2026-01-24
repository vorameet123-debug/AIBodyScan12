# Deploy Frontend to Vercel with ngrok Backend URL
# Usage: powershell -ExecutionPolicy Bypass -File deploy-frontend.ps1 -NgrokUrl "https://your-id.ngrok.app"

param(
    [Parameter(Mandatory=$true)]
    [string]$NgrokUrl
)

Write-Host ""
Write-Host "🚀 Vercel Frontend Deployment" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Validate URL format
if ($NgrokUrl -notmatch "^https://.*\.ngrok\.app$") {
    Write-Host "❌ Invalid ngrok URL format!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Expected format: https://your-unique-id.ngrok.app" -ForegroundColor Yellow
    Write-Host "You provided: $NgrokUrl" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Host "✅ Valid ngrok URL: $NgrokUrl" -ForegroundColor Green
Write-Host ""

# Check if website folder exists
if (-not (Test-Path "d:\3Dmodel\website")) {
    Write-Host "❌ Website folder not found at d:\3Dmodel\website" -ForegroundColor Red
    exit 1
}

# Update .env.production
Write-Host "📝 Updating website\.env.production..." -ForegroundColor Cyan
$envContent = "VITE_API_URL=$NgrokUrl"
$envContent | Out-File -FilePath "d:\3Dmodel\website\.env.production" -Encoding UTF8
Write-Host "✅ Configuration updated" -ForegroundColor Green
Write-Host ""

# Check if Vercel CLI is available
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercelInstalled) {
    Write-Host "⚠️  Vercel CLI not found globally, using npx..." -ForegroundColor Yellow
    Write-Host ""
}

# Deploy to Vercel
Write-Host "🚀 Deploying to Vercel (this may take 2-3 minutes)..." -ForegroundColor Green
Write-Host ""

cd d:\3Dmodel\website

if ($vercelInstalled) {
    vercel --prod
} else {
    npx vercel --prod
}

Write-Host ""
Write-Host "✅ Deployment Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 What's Next:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. 🌐 Copy the Production URL from above" -ForegroundColor White
Write-Host "   Example: https://aibodyscan-xxx.vercel.app" -ForegroundColor Gray
Write-Host ""
Write-Host "2. 🧪 Test the deployment:" -ForegroundColor White
Write-Host "   Open the URL in your browser" -ForegroundColor Gray
Write-Host "   Check browser console for errors" -ForegroundColor Gray
Write-Host ""
Write-Host "3. 📤 Share with others!" -ForegroundColor White
Write-Host "   Anyone can access your app via the Vercel URL" -ForegroundColor Gray
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  Remember:" -ForegroundColor Yellow
Write-Host "   - Keep backend running: python run.py" -ForegroundColor Yellow
Write-Host "   - Keep ngrok tunnel open" -ForegroundColor Yellow
Write-Host "   - If ngrok URL changes, run this script again" -ForegroundColor Yellow
Write-Host ""
Write-Host "🔍 Debug Tools:" -ForegroundColor Cyan
Write-Host "   - ngrok Web UI: http://localhost:4040" -ForegroundColor Gray
Write-Host "   - Backend API Docs: $NgrokUrl/docs" -ForegroundColor Gray
Write-Host "   - Vercel Dashboard: https://vercel.com/dashboard" -ForegroundColor Gray
Write-Host ""
