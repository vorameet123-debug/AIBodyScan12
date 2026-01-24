# Start AIBodyScan Demo - Local Backend with ngrok + Vercel Frontend
# Usage: powershell -ExecutionPolicy Bypass -File start-demo.ps1

Write-Host ""
Write-Host "🚀 AIBodyScan Demo Launcher" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if ngrok is installed
$ngrokInstalled = Get-Command ngrok -ErrorAction SilentlyContinue
if (-not $ngrokInstalled) {
    Write-Host "❌ ngrok is not installed or not in PATH!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install ngrok:" -ForegroundColor Yellow
    Write-Host "1. Visit https://ngrok.com/download" -ForegroundColor Yellow
    Write-Host "2. Download and extract ngrok.exe" -ForegroundColor Yellow
    Write-Host "3. Add it to your PATH or place in d:\3Dmodel\" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

# Check if Python is installed
$pythonInstalled = Get-Command python -ErrorAction SilentlyContinue
if (-not $pythonInstalled) {
    Write-Host "❌ Python is not installed or not in PATH!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Prerequisites check passed" -ForegroundColor Green
Write-Host ""

# Start backend in new window
Write-Host "📦 Starting FastAPI Backend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd d:\3Dmodel\api; Write-Host '🐍 FastAPI Backend Server' -ForegroundColor Green; Write-Host ''; python run.py"

# Wait for backend to start
Write-Host "⏳ Waiting for backend to initialize (5 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Start ngrok in new window
Write-Host "🌐 Starting ngrok tunnel..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '🌐 ngrok Tunnel' -ForegroundColor Green; Write-Host ''; Write-Host 'Copy the HTTPS Forwarding URL from below:' -ForegroundColor Yellow; Write-Host ''; ngrok http 8000"

# Wait a moment
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "✅ Demo Environment Started!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. 📝 Copy the ngrok HTTPS URL from the tunnel window" -ForegroundColor White
Write-Host "   Example: https://abcd-1234-xyz.ngrok.app" -ForegroundColor Gray
Write-Host ""
Write-Host "2. 🔗 Visit ngrok Web Interface for debugging:" -ForegroundColor White
Write-Host "   http://localhost:4040" -ForegroundColor Gray
Write-Host ""
Write-Host "3. 📝 Update frontend configuration:" -ForegroundColor White
Write-Host "   Edit: website\.env.production" -ForegroundColor Gray
Write-Host "   Set:  VITE_API_URL=https://your-ngrok-url.ngrok.app" -ForegroundColor Gray
Write-Host ""
Write-Host "4. 🚀 Deploy to Vercel:" -ForegroundColor White
Write-Host "   cd website" -ForegroundColor Gray
Write-Host "   npx vercel --prod" -ForegroundColor Gray
Write-Host ""
Write-Host "5. 🎉 Share your Vercel URL with others!" -ForegroundColor White
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  Keep these windows open while demoing!" -ForegroundColor Yellow
Write-Host "⚠️  ngrok Free: URL changes on restart, 2hr timeout" -ForegroundColor Yellow
Write-Host ""
Write-Host "📖 Full guide: NGROK_SETUP_GUIDE.md" -ForegroundColor Cyan
Write-Host ""
