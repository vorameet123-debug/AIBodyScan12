# Simple Demo Launcher - One URL for Everything
# Usage: powershell -ExecutionPolicy Bypass -File start-simple.ps1

Write-Host ""
Write-Host "🚀 AIBodyScan Simple Demo" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host "One ngrok URL for Everything!" -ForegroundColor Green
Write-Host ""

# Check prerequisites
$ngrokInstalled = Get-Command ngrok -ErrorAction SilentlyContinue
$pythonInstalled = Get-Command python -ErrorAction SilentlyContinue
$npmInstalled = Get-Command npm -ErrorAction SilentlyContinue

if (-not $ngrokInstalled) {
    Write-Host "❌ ngrok not found! Download from: https://ngrok.com/download" -ForegroundColor Red
    exit 1
}

if (-not $pythonInstalled) {
    Write-Host "❌ Python not found!" -ForegroundColor Red
    exit 1
}

if (-not $npmInstalled) {
    Write-Host "❌ npm not found! Install Node.js" -ForegroundColor Red
    exit 1
}

Write-Host "✅ All prerequisites installed" -ForegroundColor Green
Write-Host ""

# Check if frontend is built
$frontendBuilt = Test-Path "d:\3Dmodel\website\dist\index.html"

if (-not $frontendBuilt) {
    Write-Host "📦 Frontend not built yet. Building now..." -ForegroundColor Yellow
    Write-Host ""
    
    cd d:\3Dmodel\website
    
    Write-Host "Installing dependencies..." -ForegroundColor Cyan
    npm install
    
    Write-Host ""
    Write-Host "Building production bundle..." -ForegroundColor Cyan
    npm run build
    
    Write-Host ""
    if (Test-Path "d:\3Dmodel\website\dist\index.html") {
        Write-Host "✅ Frontend built successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Frontend build failed!" -ForegroundColor Red
        exit 1
    }
    Write-Host ""
}

# Start backend (serves both API and React frontend)
Write-Host "🐍 Starting FastAPI Backend (serves frontend + API)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd d:\3Dmodel\api; Write-Host '🚀 Backend Server Running' -ForegroundColor Green; Write-Host '━━━━━━━━━━━━━━━━━━━━━━━━' -ForegroundColor Green; Write-Host 'Frontend: http://localhost:8000' -ForegroundColor White; Write-Host 'API Docs: http://localhost:8000/docs' -ForegroundColor White; Write-Host ''; python run.py"

# Wait for backend to start
Write-Host "⏳ Waiting for backend (5 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Start ngrok tunnel
Write-Host "🌐 Starting ngrok tunnel..." -ForegroundColor Green
Write-Host ""
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '🌐 ngrok Public URL' -ForegroundColor Green; Write-Host '━━━━━━━━━━━━━━━━━━━━━━━━' -ForegroundColor Green; Write-Host ''; Write-Host '📋 COPY THE HTTPS URL BELOW:' -ForegroundColor Yellow; Write-Host ''; ngrok http 8000"

Start-Sleep -Seconds 2

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ Demo Started Successfully!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor White
Write-Host ""
Write-Host "1. 🔗 Copy ngrok HTTPS URL from tunnel window" -ForegroundColor White
Write-Host "   Example: https://abcd-1234.ngrok.app" -ForegroundColor Gray
Write-Host ""
Write-Host "2. 🎉 Share that URL with anyone!" -ForegroundColor White
Write-Host "   They can access your full app (frontend + API)" -ForegroundColor Gray
Write-Host ""
Write-Host "3. 🔍 Debug tools:" -ForegroundColor White
Write-Host "   • ngrok Web UI: http://localhost:4040" -ForegroundColor Gray
Write-Host "   • Local test: http://localhost:8000" -ForegroundColor Gray
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  Important:" -ForegroundColor Yellow
Write-Host "  • Keep both windows open while sharing" -ForegroundColor Yellow
Write-Host "  • ngrok Free: URL changes on restart" -ForegroundColor Yellow
Write-Host "  • 2-hour session timeout (just restart)" -ForegroundColor Yellow
Write-Host ""
Write-Host "🎯 ONE URL = Frontend + Backend + Everything!" -ForegroundColor Green
Write-Host ""
