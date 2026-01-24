# Restore Database & Fix Schema Script
Write-Host "STARTING RESTORE PROCESS..."

# 1. Stop Backend
Write-Host "Stopping python processes..."
Get-Process python -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*app.py*" } | Stop-Process -Force
Start-Sleep -Seconds 2

# 2. Restore Backup
Write-Host "Restoring backup from files/data.db..."
Copy-Item "d:\3Dmodel\api\files\data.db" "d:\3Dmodel\api\data.db" -Force

# 3. Fix Schema (Add new columns)
Write-Host "Migrating schema..."
$script = @"
import sqlite3
try:
    conn = sqlite3.connect('d:/3Dmodel/api/data.db')
    cursor = conn.cursor()
    
    # Check if purchase_intent column exists
    cursor.execute('PRAGMA table_info(fitcheckhistory)')
    columns = [row[1] for row in cursor.fetchall()]
    
    if 'purchase_intent' not in columns:
        print('Adding purchase_intent column...')
        cursor.execute('ALTER TABLE fitcheckhistory ADD COLUMN purchase_intent VARCHAR')
        
    if 'purchased_at' not in columns:
        print('Adding purchased_at column...')
        cursor.execute('ALTER TABLE fitcheckhistory ADD COLUMN purchased_at DATETIME')
        
    conn.commit()
    conn.close()
    print('Schema migration successful!')
except Exception as e:
    print(f'Error: {e}')
"@

$script | Out-File "d:\3Dmodel\api\migrate_db.py" -Encoding UTF8
python "d:\3Dmodel\api\migrate_db.py"

# 4. Success Message
Write-Host "✅ RESTORE COMPLETE! Restarting backend..."
python "d:\3Dmodel\api\app.py"
