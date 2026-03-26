"""
Database Index Verification Script
Checks that all critical indexes exist in the database
"""
from db import engine
from sqlalchemy import inspect


def verify_indexes():
    """Verify that all expected indexes exist"""
    inspector = inspect(engine)

    # Expected indexes per table
    expected_indexes = {
        'user': ['email'],
        'refreshtoken': ['user_id', 'token'],
        'measurementrecord': ['user_id'],
        'fitcheckhistory': ['user_id', 'checked_at'],
        'fashioniqscore': ['user_id'],
        'userbadge': ['user_id'],
        'bodyinsight': ['user_id', 'created_at'],
        'fitnessgoal': ['user_id'],
        'externaltrend': ['created_at']
    }

    print("=" * 60)
    print("DATABASE INDEX VERIFICATION")
    print("=" * 60)

    all_good = True

    for table_name, expected_cols in expected_indexes.items():
        if table_name not in inspector.get_table_names():
            print(f"\n⚠️  Table '{table_name}' not found (may not be created yet)")
            continue

        print(f"\n📊 Table: {table_name}")
        indexes = inspector.get_indexes(table_name)

        indexed_columns = set()
        for idx in indexes:
            for col in idx['column_names']:
                indexed_columns.add(col.lower())

        for col in expected_cols:
            if col.lower() in indexed_columns:
                print(f"   ✅ {col} - INDEXED")
            else:
                print(f"   ❌ {col} - MISSING INDEX")
                all_good = False

    print("\n" + "=" * 60)
    if all_good:
        print("✅ ALL INDEXES VERIFIED - Database is optimized!")
    else:
        print("⚠️  Some indexes are missing - Review needed")
    print("=" * 60)

    return all_good

if __name__ == "__main__":
    verify_indexes()

