"""Test script to verify _get_measurement helper works correctly"""
import sys
sys.path.insert(0, 'd:/3Dmodel')
sys.path.insert(0, 'd:/3Dmodel/api')

from integrations.body_intelligence import BodyIntelligence

# Test the helper method
test_measurements = {
    'chest circumference': 95.5,
    'waist circumference': 85.2,
    'hip circumference': 100.3,
    'height': 173
}

# Create a mock session (we won't use it for this test)
class MockSession:
    pass

bi = BodyIntelligence(MockSession())

# Test the _get_measurement helper
print("Testing _get_measurement helper:")
print(f"chest: {bi._get_measurement(test_measurements, 'chest')}")
print(f"waist: {bi._get_measurement(test_measurements, 'waist')}")
print(f"hip: {bi._get_measurement(test_measurements, 'hip')}")
print(f"height: {bi._get_measurement(test_measurements, 'height')}")
