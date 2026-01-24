# Installation Instructions

## Quick Install

Since you already have `numpy` and `opencv-python` installed in your main environment, you only need to install the FastAPI-specific packages:

```bash
cd api
pip install fastapi uvicorn[standard] python-multipart python-dotenv pydantic loguru
```

Or install from requirements.txt (which now excludes numpy/opencv):

```bash
pip install -r requirements.txt
```

## Note

- `numpy` and `opencv-python` are already installed in your main environment
- These packages are used by your existing pipeline
- No need to reinstall them

## Verify Installation

```bash
python -c "import fastapi; print('FastAPI installed successfully')"
```

## Run the API

```bash
python app.py
```



