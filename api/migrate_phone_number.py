"""
Database Migration: Add phone_number to User table
Run this script to update existing database schema
"""
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from db import engine
from loguru import logger
from sqlalchemy import text


def migrate_add_phone_number():
    """Add phone_number column to user table"""
    try:
        with engine.connect() as conn:
            # Check if column already exists
            result = conn.execute(text("PRAGMA table_info(user)"))
            columns = [row[1] for row in result.fetchall()]

            if 'phone_number' in columns:
                logger.info("✅ phone_number column already exists")
                return

            # Add the column
            conn.execute(text("ALTER TABLE user ADD COLUMN phone_number VARCHAR"))
            conn.commit()
            logger.info("✅ Successfully added phone_number column to user table")

    except Exception as e:
        logger.error(f"❌ Migration failed: {e!s}")
        raise


if __name__ == "__main__":
    logger.info("Running database migration: add phone_number")
    migrate_add_phone_number()
    logger.info("Migration complete!")

