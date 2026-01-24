# Backend Error Diagnosis Guide

## What to Look For in Terminal Logs

The backend will now show detailed step-by-step progress. Look for these patterns:

### SUCCESS PATTERN (What you want to see)
```
[STEP 1/6] Initializing SMPL measurer...
  SMPL_ANTHROPOMETRY_DIR: ...
✓ SMPL-Anthropometry measurer initialized successfully
  Measurer type: <class 'measure.MeasureSMPL'>
  Has measurements attr: True
  Has all_possible_measurements: True
  Returned to: D:\3Dmodel\api

[STEP 2/6] Converting vertices to tensor: torch.Size([6890, 3])

[STEP 3/6] Loading vertices into measurer...
✓ Vertices loaded successfully

✓ Joints calculated: shape=(24, 3)

[STEP 4/6] Separating measurements by type...
  Length measurements: 6 - ['height', 'shoulder to crotch height', ...]
  Circumference measurements: 16 - ['head circumference', 'neck circumference', ...]

[STEP 5/6] Measuring 6 length measurements...
First 5 measurements to try: [...]
Measurer has 0 measurements before batch
Measurer has 6 measurements after batch
Measurements in measurer: ['height', 'shoulder to crotch height', ...]

Successfully measured: 6/22
```

### ERROR PATTERN 1: Measurer Init Fails
```
Initializing SMPL-Anthropometry measurer...
✗ Failed to initialize measurer: [ERROR MESSAGE]
Traceback: ...
```
**Solution**: Check SMPL model files exist in `smpl_anthropometry/data/smpl/`

### ERROR PATTERN 2: Vertices Not Loading
```
[STEP 3/6] Loading vertices into measurer...
✗ Failed to load vertices: [ERROR]
Traceback: ...
```
**Solution**: Check vertices shape is (6890, 3)

### ERROR PATTERN 3: Joints Not Calculated
```
✗ CRITICAL: Joints were not calculated by from_verts()
  Has 'joints' attribute: True/False
  Joints value: None/[value]
```
**Solution**: Joint regressor loading failed - check SMPL model files

### ERROR PATTERN 4: No Measurements After measure()
```
Measurer has 0 measurements before batch
Measurer has 0 measurements after batch  ← Problem!
Measurements in measurer: []
```
**Solution**: measure() function not working - check SMPLMeasurementDefinitions

### ERROR PATTERN 5: Exception in measure()
```
[STEP 5/6] Measuring 6 length measurements...
Measurement extraction error: [ERROR]
Full traceback: ...
```
**Solution**: Check specific exception in traceback

## Steps to Run Complete Diagnostic

1. **Check measurer in isolation:**
   ```bash
   cd d:\3Dmodel
   python test_quick.py
   ```

2. **Check measurement extraction:**
   ```bash
   cd d:\3Dmodel
   python test_extraction_direct.py
   ```

3. **Run API with debug output:**
   ```bash
   cd d:\3Dmodel\api
   python app.py
   # Then upload an image
   ```

4. **Look at terminal output** for the patterns above

## File Locations for Reference

```
d:\3Dmodel\
├── smpl_anthropometry/
│   ├── data/
│   │   ├── smpl/
│   │   │   ├── SMPL_NEUTRAL.pkl          ← Required
│   │   │   ├── smpl_body_parts_2_faces.json  ← Required
│   │   │   └── ...
│   ├── measure.py                         ← Measurement extraction
│   ├── measurement_definitions.py         ← Measurement definitions
│   └── joint_definitions.py               ← Joint loading
├── integrations/
│   └── pipeline.py                        ← Main pipeline (has logging)
└── api/
    └── app.py                             ← FastAPI app
```

## Quick Checklist

- [ ] All SMPL model files exist and readable
- [ ] Can run `test_quick.py` successfully
- [ ] Can run `test_extraction_direct.py` successfully
- [ ] API starts without errors
- [ ] API logs show [STEP 1/6] through [STEP 5/6]
- [ ] Final measurements count > 0
