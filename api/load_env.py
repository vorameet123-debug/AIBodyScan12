"""
Load environment variables from .env file
This allows you to store secrets without hardcoding them
"""
from pathlib import Path

from dotenv import load_dotenv

# Load .env file from the api directory
env_path = Path(__file__).parent / ".env"
if env_path.exists():
    load_dotenv(env_path)
    print(f"✓ Loaded environment from {env_path}")
else:
    print(f"⚠ No .env file found at {env_path}")
    print("  Create one with: REPLICATE_API_TOKEN=your_token_here")

