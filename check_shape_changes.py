import requests
import json

response = requests.get("http://localhost:8000/api/v1/body/progress/1?person_name=Kirtan")
data = response.json()

print("=== BODY PROGRESS SUMMARY ===")
print(f"Total Measurements: {data['summary']['total_measurements']}")
print(f"\nShape Changes: {len(data['summary']['shape_changes'])}")

if data['summary']['shape_changes']:
    for change in data['summary']['shape_changes']:
        print(f"\n  From: {change['from_shape']}")
        print(f"  To: {change['to_shape']}")
        print(f"  Date: {change['change_date']}")
        print(f"  Confidence: {change['confidence']}")
else:
    print("  No shape changes detected")

print(f"\nCurrent Body Shape: {data['summary'].get('body_shape', {}).get('shape', 'N/A')}")
