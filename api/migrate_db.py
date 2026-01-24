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
