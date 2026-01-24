import requests
import json

response = requests.get("http://localhost:8000/api/v1/trends/for-you/1?person_name=Kirtan")
data = response.json()

print("=== FOR YOU TRENDS API ===")
print(f"Success: {data['success']}")

if 'body_insights' in data['data']:
    insights = data['data']['body_insights']
    print(f"\nBody Insights Found!")
    print(f"Latest Shape: {insights.get('latest_shape', 'N/A')}")
    print(f"Shape Changes: {len(insights.get('shape_changes', []))}")
    
    for change in insights.get('shape_changes', []):
        print(f"\n  {change['from_shape']} -> {change['to_shape']}")
        print(f"  Date: {change['change_date']}")
        print(f"  Confidence: {change['confidence']}")
else:
    print("\nNo body insights in response")
