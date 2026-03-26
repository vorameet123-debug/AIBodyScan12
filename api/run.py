"""
Wrapper script to run the API with proper environment setup
This ensures the correct Python and working directory are used
"""
import os
import sys
from pathlib import Path

# Ensure we're in the api directory
API_DIR = Path(__file__).parent
PROJECT_ROOT = API_DIR.parent

# Change to api directory
os.chdir(API_DIR)

# Add api directory to path for imports
if str(API_DIR) not in sys.path:
    sys.path.insert(0, str(API_DIR))

# Now import and run app
if __name__ == "__main__":
    # Import app after path is set
    import uvicorn

    print("=" * 60)
    print("Fashion Intelligence API")
    print("=" * 60)
    print(f"Python: {sys.executable}")
    print(f"Working Directory: {os.getcwd()}")
    print("API will be available at: http://localhost:8000")
    print("API docs at: http://localhost:8000/docs")
    print("=" * 60)
    print()

    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )

