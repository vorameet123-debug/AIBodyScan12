"""
Script to update existing fit check records with default colors based on garment type
This is a one-time fix for records that were saved with 'unknown' color
"""
import sqlite3

# Common color defaults by garment type
COLOR_DEFAULTS = {
    'shirt': 'white',
    'pants': 'black',
    'jacket': 'black',
    'dress': 'black',
    't-shirt': 'white',
    'jeans': 'blue',
    'shorts': 'khaki',
    'skirt': 'black',
    'sweater': 'gray',
    'coat': 'black'
}

def update_unknown_colors():
    conn = sqlite3.connect('d:/3Dmodel/api/data.db')
    cursor = conn.cursor()
    
    # Get all records with unknown color
    cursor.execute("SELECT id, garment_type FROM fitcheckhistory WHERE color = 'unknown'")
    records = cursor.fetchall()
    
    print(f"Found {len(records)} records with unknown color")
    
    updated = 0
    for record_id, garment_type in records:
        # Get default color for this garment type
        default_color = COLOR_DEFAULTS.get(garment_type.lower(), 'neutral')
        
        # Update the record
        cursor.execute(
            "UPDATE fitcheckhistory SET color = ? WHERE id = ?",
            (default_color, record_id)
        )
        updated += 1
        print(f"Updated record {record_id} ({garment_type}) -> {default_color}")
    
    conn.commit()
    conn.close()
    
    print(f"\nSUCCESS: Updated {updated} records")

if __name__ == "__main__":
    update_unknown_colors()
