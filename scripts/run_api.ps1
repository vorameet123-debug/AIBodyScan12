# Ensure conda base environment is properly activated
Write-Host "Activating conda base environment..." -ForegroundColor Cyan

# Initialize conda for PowerShell
& "C:\Users\voram\miniconda3\Scripts\conda.exe" "shell.powershell" "hook" | Out-String | Invoke-Expression

# Activate base environment
conda activate base

Write-Host ""
Write-Host "Verifying FastAPI installation..." -ForegroundColor Cyan
python -c "import fastapi; print('✓ FastAPI version:', fastapi.__version__)"

Write-Host ""
Write-Host "Starting FastAPI server..." -ForegroundColor Green
Write-Host ""
python api\app.py
