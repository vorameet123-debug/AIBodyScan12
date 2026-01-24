# PowerShell script to fix database schema
# Stops backend, deletes database, ready for restart

Write-Host "=" -NoNewline
Write-Host ("=" * 60)
Write-Host "DATABASE SCHEMA FIX - AUTOMATED"
Write-Host "=" -NoNewline
Write-Host ("=" * 60)
Write-Host ""

# Step 1: Stop Python processes running app.py
Write-Host "Step 1: Stopping backend processes..."
$pythonProcesses = Get-Process python -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*app.py*" -or $_.CommandLine -like "*app.py*" }

if ($pythonProcesses) {
    $pythonProcesses | Stop-Process -Force
    Write-Host "✅ Stopped Python backend processes"
    Start-Sleep -Seconds 2
} else {
    Write-Host "ℹ️  No Python backend processes found"
}

# Step 2: Delete database
Write-Host ""
Write-Host "Step 2: Deleting old database..."
$dbPath = "d:\3Dmodel\api\data.db"

if (Test-Path $dbPath) {
    try {
        Remove-Item $dbPath -Force
        Write-Host "✅ SUCCESS: Deleted database"
    } catch {
        Write-Host "❌ ERROR: Could not delete database: $_"
        Write-Host "Please delete manually: $dbPath"
        exit 1
    }
} else {
    Write-Host "ℹ️  Database not found (will be created on restart)"
}

# Step 3: Instructions
Write-Host ""
Write-Host "=" -NoNewline
Write-Host ("=" * 60)
Write-Host "✅ DATABASE READY FOR RECREATION"
Write-Host "=" -NoNewline
Write-Host ("=" * 60)
Write-Host ""
Write-Host "Next Steps:"
Write-Host "1. Restart the backend:"
Write-Host "   cd d:\3Dmodel\api"
Write-Host "   python app.py"
Write-Host ""
Write-Host "2. Do a fit check"
Write-Host "3. You'll see 'Planning to buy this?' component!"
Write-Host ""
Write-Host "=" -NoNewline
Write-Host ("=" * 60)
