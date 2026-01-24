"""
Quick test to verify API endpoints work
Run this while the server is running: python test_endpoints.py
"""
import requests
import sys

BASE_URL = "http://localhost:8000"

def test_endpoint(name, url):
    try:
        response = requests.get(url, timeout=5)
        print(f"✓ {name}: {response.status_code}")
        return True
    except Exception as e:
        print(f"✗ {name}: {e}")
        return False

if __name__ == "__main__":
    print("Testing API endpoints...")
    print("-" * 50)
    
    all_ok = True
    all_ok &= test_endpoint("Root", f"{BASE_URL}/")
    all_ok &= test_endpoint("Health", f"{BASE_URL}/api/v1/health")
    all_ok &= test_endpoint("Info", f"{BASE_URL}/api/v1/info")
    all_ok &= test_endpoint("Test Connection", f"{BASE_URL}/api/v1/test-connection")
    
    print("-" * 50)
    if all_ok:
        print("✓ All endpoints responding!")
        print("\nThe backend is working. If frontend shows 'Backend Offline':")
        print("1. Make sure frontend is running: cd website && npm start")
        print("2. Check website/.env has: REACT_APP_API_URL=http://localhost:8000")
        print("3. Restart the frontend after changing .env")
    else:
        print("✗ Some endpoints failed. Make sure server is running:")
        print("   cd api && python app.py")
    
    sys.exit(0 if all_ok else 1)
