# Integration Pipeline

Complete integration of Live Measurement API → PARE → SMPL-Anthropometry for body measurement extraction.

## Files

- `pipeline.py` - Basic pipeline (original)
- `pipeline_enhanced.py` - Enhanced pipeline with logging, error handling, memory management
- `api_integration.py` - Flask API wrapper
- `test_pipeline.py` - Basic test script
- `test_end_to_end.py` - Comprehensive end-to-end test suite

## Usage

### Basic Usage

```python
from pipeline import MeasurementPipeline
import cv2

pipeline = MeasurementPipeline()
image = cv2.imread('front.jpg')
result = pipeline.process_image(front_image=image, user_height_cm=170.0)
```

### Enhanced Usage (Recommended)

```python
from pipeline_enhanced import MeasurementPipeline
import cv2

pipeline = MeasurementPipeline()
image = cv2.imread('front.jpg')
result = pipeline.process_image(front_image=image, user_height_cm=170.0)

# Get statistics
stats = pipeline.get_stats()
print(f"Success rate: {stats['success_rate']}%")
```

### API Usage

```bash
# Start API
python api_integration.py

# Test
curl -X POST http://localhost:8002/measurements \
  -F "front_image=@front.jpg" \
  -F "user_height_cm=170"
```

## Testing

```bash
# Run comprehensive tests
python test_end_to_end.py

# Run basic test
python test_pipeline.py --front_image ../live_measurement_api/front.jpeg
```

## Features

- ✅ End-to-end pipeline
- ✅ Comprehensive logging
- ✅ Error handling
- ✅ Memory management
- ✅ GPU/CPU compatibility
- ✅ Path validation
- ✅ Stability testing








