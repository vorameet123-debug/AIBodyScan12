import sqlite3

conn = sqlite3.connect('d:/3Dmodel/api/data.db')
cursor = conn.cursor()
cursor.execute('SELECT id, garment_type, fit_score, purchased, purchase_intent FROM fitcheckhistory ORDER BY id DESC LIMIT 10')

print('ID | Garment | Score | Purchased | Intent')
print('-' * 60)
for row in cursor.fetchall():
    print(f'{row[0]:3} | {row[1]:10} | {row[2]:5} | {row[3]:9} | {row[4]}')

conn.close()
