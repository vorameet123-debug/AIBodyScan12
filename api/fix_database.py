"""
Script to fix database schema issue
1. Stops any Python processes
2. Deletes old database
3. Instructions to restart
"""
import os

db_path = 'd:/3Dmodel/api/data.db'

print("=" * 60)
print("DATABASE SCHEMA FIX SCRIPT")
print("=" * 60)

# Check if database exists
if os.path.exists(db_path):
    try:
        os.remove(db_path)
        print(f"✅ SUCCESS: Deleted {db_path}")
        print("\nNow restart the backend:")
        print("  cd d:\\3Dmodel\\api")
        print("  python app.py")
        print("\nThe database will be recreated with correct schema!")
    except Exception as e:
        print(f"❌ ERROR: Could not delete database: {e}")
        print("\nMANUAL STEPS:")
        print("1. Stop the backend (Ctrl+C in python terminal)")
        print("2. Delete d:\\3Dmodel\\api\\data.db manually")
        print("3. Restart: python app.py")
else:
    print(f"ℹ️  Database not found at {db_path}")
    print("It will be created when you start the backend.")

print("=" * 60)

