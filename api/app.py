"""
FastAPI Backend for 3D Body Measurement System
Connects React frontend with Python measurement pipeline
"""
import os
import sys
from pathlib import Path
from datetime import datetime

# Fix encoding for Windows console
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Body, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import Optional, List, Dict, Any
from sqlmodel import Session, select
import cv2
import numpy as np
import base64
from loguru import logger
from pydantic import BaseModel, ConfigDict, Field
from auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user,
    get_current_user_optional,
)
from db import create_db_and_tables, get_session, User, MeasurementRecord
from fit_check_history_helper import save_fit_check_history
from config import FIT_CHECK_DEFAULTS, FILE_UPLOAD_LIMITS, VALID_FIT_TYPES, DEFAULT_FIT_TYPE, API_CONFIG
from error_handlers import handle_api_error, ErrorCodes, APIError





class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class SaveMeasurementRequest(BaseModel):
    name: str
    measurement_data: dict


class MeasurementRecordResponse(BaseModel):
    id: int
    name: Optional[str]
    measurements: dict
    size_recommendations: Optional[dict] = None
    metadata: Optional[dict] = None
    created_at: datetime


# Clothing Fit Check Models
class ClothingFitRequest(BaseModel):
    measurement_id: int
    clothing_type: str
    size: str
    size_system: str = "US"
    brand: Optional[str] = None
    material: str
    occasion: str


class ProblemArea(BaseModel):
    area: str
    issue: str
    severity: str


class AlternativeSize(BaseModel):
    size: str
    fit_confidence: float
    difference: float


class FitAnalysisResponse(BaseModel):
    fit_confidence: float
    fit_status: str
    problem_areas: List[ProblemArea]
    alternative_sizes: List[AlternativeSize]
    expected_measurements: dict
    user_measurements_used: dict


class StyleAnalysisResponse(BaseModel):
    body_type: str
    body_type_description: str
    style_compatibility: float
    body_type_score: float
    occasion_score: float
    fit_preference: str
    description: str
    recommended_styles: List[str]
    styles_to_avoid: List[str]
    occasion_notes: List[str]
    overall_recommendation: str


class ColorInfo(BaseModel):
    rgb: dict
    name: str
    percentage: Optional[float] = None


class AlternativeColor(BaseModel):
    name: str
    rgb: dict
    match_score: float


class ColorAnalysisResponse(BaseModel):
    match_score: float
    compatibility: str
    primary_color: ColorInfo
    all_colors: List[ColorInfo]
    recommendation: str
    alternative_colors: List[AlternativeColor]
    skin_tone: dict


class MaterialAnalysisResponse(BaseModel):
    comfort_score: float
    breathability: int
    softness: int
    durability: int
    moisture_wicking: int
    warmth: int
    coolness: int
    skin_sensitivity: str
    suitability: str
    occasion_suitability: str
    climate_suitability: str
    best_for: List[str]
    care_instructions: str
    shrinkage_risk: str
    warnings: List[str]
    recommendations: List[str]


class OverallRecommendation(BaseModel):
    overall_score: float
    recommendation: str  # "Buy", "Consider", "Skip"
    breakdown: dict


class ClothingFitCheckResponse(BaseModel):
    success: bool
    fit_analysis: FitAnalysisResponse
    style_analysis: StyleAnalysisResponse
    color_analysis: ColorAnalysisResponse
    material_analysis: MaterialAnalysisResponse
    overall_recommendation: OverallRecommendation
    alerts: List[str]


# New Clothing Fit Check V2 Models (with Groq Integration)
class FitMeter(BaseModel):
    status: str
    ease: float
    user_measurement: float
    garment_measurement: float
    zone: str
    score: float

class FitMetersResponse(BaseModel):
    fit_meters: Dict[str, Optional[FitMeter]]
    overall_fit_score: float
    worst_metric: str

class GarmentAnalysisResponse(BaseModel):
    garment_type: str
    material: str
    colors: List[Dict]
    style: str
    pattern: str
    fit_type: str
    formality_level: int

class RoastResponse(BaseModel):
    fit_roast: str
    verdict_stamp: str
    stamp_color: str

class SkinToneResponse(BaseModel):
    tone_category: str
    description: str
    rgb_values: Dict[str, int]
    confidence: float

class ColorMatchResponse(BaseModel):
    match_score: int
    roast: str
    suggested_colors: List[str]
    skin_tone: Dict
    primary_color: Dict[str, Any]

class StyleRecommendationResponse(BaseModel):
    outfit_suggestions: List[str]
    style_score: int

class OccasionAnalysisResponse(BaseModel):
    occasion_match_score: int
    is_appropriate: bool
    recommendation: str
    alternative_occasions: List[str]

class NewClothingFitCheckResponse(BaseModel):
    model_config = ConfigDict(
        extra="allow",
        use_enum_values=True,
        populate_by_name=True
    )
    
    success: bool
    garment_analysis: GarmentAnalysisResponse
    fit_meters: FitMetersResponse
    roast: RoastResponse
    color_analysis: ColorMatchResponse
    style_recommendations: StyleRecommendationResponse
    occasion_analysis: OccasionAnalysisResponse
    material_comfort: Dict
    overall_score: float
    # Size recommendation fields - MAKE THEM REQUIRED (not Optional) to force inclusion
    size_recommendation: Dict[str, Any]  # REMOVED Optional
    all_sizes: Dict[str, Any]  # REMOVED Optional
    user_selected_size: str | None = None  # Keep as optional but use union syntax
    check_id: int  # REMOVED Optional - MUST have a value



# Add project root to path
PROJECT_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(PROJECT_ROOT))
sys.path.insert(0, str(PROJECT_ROOT / "integrations"))

# Import clothing fit analysis modules (after path setup)
try:
    from integrations.groq_service import GroqService, GroqServiceError
    from integrations.fit_meter_calculator import FitMeterCalculator
    from integrations.skin_tone_detector import SkinToneDetector
    CLOTHING_ANALYSIS_AVAILABLE = True
except ImportError as e:
    logger.warning(f"Clothing analysis modules not available: {e}")
    CLOTHING_ANALYSIS_AVAILABLE = False

# Defer heavy imports until needed to avoid slow startup

# Initialize FastAPI app
app = FastAPI(
    title="3D Body Measurement API",
    description="API for 3D body measurement extraction using PARE and SMPL-Anthropometry",
    version="1.0.0"
)


@app.on_event("startup")
def on_startup():
    """Ensure database tables exist before serving requests."""
    create_db_and_tables()

# Register routers
from routers import auth_router, measurement_router
app.include_router(auth_router)
app.include_router(measurement_router)

# CORS middleware - allows React to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # React dev server
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        # Add your production domain here when deploying
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Fashion IQ routes
try:
    from fashion_iq_routes import register_fashion_iq_routes
    register_fashion_iq_routes(app, get_session, User)
    logger.info("Fashion IQ routes registered successfully")
except Exception as e:
    logger.warning(f"Could not register Fashion IQ routes: {e}")


# Register Purchase Tracking routes
try:
    from purchase_routes import register_purchase_routes
    register_purchase_routes(app, get_session)
    logger.info("Purchase tracking routes registered successfully")
except Exception as e:
    logger.warning(f"Could not register purchase tracking routes: {e}")


# Register Wardrobe Analytics routes
try:
    from wardrobe_routes import register_wardrobe_routes
    register_wardrobe_routes(app, get_session)
    logger.info("Wardrobe analytics routes registered successfully")
except Exception as e:
    logger.warning(f"Could not register wardrobe routes: {e}")


# Register Body Intelligence routes
try:
    from body_intelligence_routes import register_body_intelligence_routes
    register_body_intelligence_routes(app, get_session)
    logger.info("Body intelligence routes registered successfully")
except Exception as e:
    logger.warning(f"Could not register body intelligence routes: {e}")


# Register Trend Intelligence routes
try:
    from trend_routes import register_trend_routes
    register_trend_routes(app, get_session)
    logger.info("Trend intelligence routes registered successfully")
except Exception as e:
    logger.warning(f"Could not register trend routes: {e}")


# Initialize pipeline (lazy loading - will load on first request)
pipeline = None

def get_pipeline():
    """Lazy load pipeline to avoid loading models on startup"""
    global pipeline
    if pipeline is None:
        logger.info("Initializing measurement pipeline...")
        try:
            # Import here to avoid heavy dependencies during server startup
            from integrations.pipeline import MeasurementPipeline
            pipeline = MeasurementPipeline()
            logger.info("Pipeline initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize pipeline: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to initialize measurement pipeline: {str(e)}"
            )
    return pipeline

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "3D Body Measurement API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "health": "/api/v1/health",
            "measurements": "/api/v1/measurements",
            "virtual_try_on": "/api/v1/virtual-try-on",
            "auth_register": "/api/v1/auth/register",
            "auth_login": "/api/v1/auth/login",
            "auth_me": "/api/v1/auth/me",
            "save_measurement": "/api/v1/measurements/save",
            "get_measurements": "/api/v1/measurements/my-measurements",
            "get_measurement": "/api/v1/measurements/{id}",
            "delete_measurement": "/api/v1/measurements/{id}",
            "fit_check": "/api/v1/clothing/fit-check",
            "fit_check_v2_screenshot": "/api/v1/clothing/fit-check-v2",
            "info": "/api/v1/info",
            "docs": "/docs"
        }
    }

@app.get("/api/v1/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Try to get pipeline (will initialize if needed)
        get_pipeline()
        return {
            "status": "healthy",
            "pipeline": "ready",
            "message": "API is ready to process measurements"
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "unhealthy",
            "pipeline": "not_ready",
            "error": str(e)
        }

@app.get("/api/v1/test-connection")
async def test_connection():
    """Test endpoint to verify frontend-backend connection"""
    return {
        "status": "connected",
        "message": "Frontend and backend are connected!",
        "timestamp": str(datetime.now())
    }

@app.get("/api/v1/info")
async def api_info():
    """Get API information"""
    return {
        "name": "3D Body Measurement API",
        "version": "1.0.0",
        "endpoints": {
            "health": "/api/v1/health",
            "measurements": "/api/v1/measurements",
            "virtual_try_on": "/api/v1/virtual-try-on",
            "auth_register": "/api/v1/auth/register",
            "auth_login": "/api/v1/auth/login",
            "auth_me": "/api/v1/auth/me",
            "docs": "/docs"
        },
        "features": [
            "22 body measurements",
            "Size recommendations",
            "Outseam calculation",
            "Gender-aware sizing",
            "Age-based sizing"
        ],
        "supported_formats": ["JPEG", "PNG"],
        "max_file_size": "10MB"
    }


# ---------------------------
# Clothing Fit Check V2 (Groq)
# ---------------------------

@app.post("/api/v1/clothing/fit-check", response_model_exclude_none=False)
async def check_clothing_fit(
    request: Request, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """
    Analyze clothing fit using User's measurements and Groq Vision AI.
    Requires authentication - users can only access their own measurements.
    """
    logger.info(f"Fit check request from user {current_user.id} ({current_user.email})")
    
    try:
        form = await request.form()
        logger.info(f"Form Keys Received: {list(form.keys())}")
        
        productImage = form.get("productImage")
        measurement_id = form.get("measurement_id")
        size = form.get("size", "").strip()
        occasion = form.get("occasion", "").strip()
        fit_type = form.get("fit_type", "slim").strip().lower()  # Default to slim if not provided
        
        # Validate required fields
        if not productImage:
            logger.error("No product image in form data")
            raise HTTPException(status_code=422, detail="Missing product image")
        
        if not measurement_id:
            raise HTTPException(status_code=422, detail="Missing measurement_id")
        
        # Validate optional fields
        if fit_type not in VALID_FIT_TYPES:
            fit_type = DEFAULT_FIT_TYPE  # Default to slim if invalid
            logger.warning(f"Invalid fit_type, defaulting to '{DEFAULT_FIT_TYPE}'")
        
        if size and len(size) > FILE_UPLOAD_LIMITS["max_size_string_length"]:
            raise HTTPException(
                status_code=422, 
                detail=f"Size value too long (max {FILE_UPLOAD_LIMITS['max_size_string_length']} characters)"
            )
        
        if occasion and len(occasion) > FILE_UPLOAD_LIMITS["max_occasion_string_length"]:
            raise HTTPException(
                status_code=422, 
                detail=f"Occasion value too long (max {FILE_UPLOAD_LIMITS['max_occasion_string_length']} characters)"
            )
            
        try:
            m_id = int(measurement_id)
            if m_id <= 0:
                raise ValueError("Measurement ID must be positive")
        except (ValueError, TypeError):
            raise HTTPException(status_code=422, detail="Invalid measurement_id format (must be a positive integer)")
        
        logger.info(f"Validated inputs - mid={m_id}, size={size}, occ={occasion}, fit={fit_type}")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing form: {e}")
        raise HTTPException(status_code=422, detail=f"Form processing error: {str(e)}")

    if not CLOTHING_ANALYSIS_AVAILABLE:
        raise HTTPException(
            status_code=503, 
            detail="Clothing analysis modules are not available on the server"
        )

    # 1. Get User Measurements with ownership verification
    measurement_record = db.exec(
        select(MeasurementRecord).where(
            MeasurementRecord.id == m_id,
            MeasurementRecord.user_id == current_user.id  # CRITICAL: Verify ownership
        )
    ).first()
    
    if not measurement_record:
        logger.warning(f"User {current_user.id} attempted to access measurement {m_id} (not found or unauthorized)")
        raise HTTPException(
            status_code=404, 
            detail="Measurement record not found or you don't have permission to access it"
        )
        
    # Extract measurements from payload
    user_measurements = measurement_record.payload.get("measurements", {})
    if not user_measurements:
        raise HTTPException(status_code=400, detail="No measurements found in record")
    logger.info(f"Loaded measurements for user {current_user.id}")
    
    # 2. Process Image with validation
    try:
        # Validate file type
        filename = getattr(productImage, 'filename', '')
        if filename:
            file_ext = filename.lower().split('.')[-1] if '.' in filename else ''
            if file_ext not in FILE_UPLOAD_LIMITS["allowed_extensions"]:
                allowed = ", ".join([ext.upper() for ext in FILE_UPLOAD_LIMITS["allowed_extensions"]])
                raise HTTPException(
                    status_code=422, 
                    detail=f"Unsupported file type: {file_ext}. Supported formats: {allowed}"
                )
        
        # Read and validate file size
        image_bytes = await productImage.read()
        file_size_mb = len(image_bytes) / (1024 * 1024)
        
        if file_size_mb > FILE_UPLOAD_LIMITS["max_size_mb"]:
            raise HTTPException(
                status_code=422,
                detail=f"File size ({file_size_mb:.2f}MB) exceeds {FILE_UPLOAD_LIMITS['max_size_mb']}MB limit"
            )
        
        # Validate image can be decoded
        nparr = np.frombuffer(image_bytes, np.uint8)
        decoded_img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if decoded_img is None:
            raise HTTPException(
                status_code=422,
                detail="Invalid image file - could not decode image. Please upload a valid JPEG or PNG image."
            )
            
        logger.info(f"Image validated: {filename}, size: {file_size_mb:.2f}MB")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to process image: {e}")
        raise HTTPException(status_code=400, detail=f"Invalid image file: {str(e)}")

    # 3. Initialize Services
    groq_api_key = os.getenv("GROQ_API_KEY")
    if not groq_api_key:
        raise HTTPException(
            status_code=500,
            detail={
                "error": ErrorCodes.CONFIGURATION_ERROR,
                "message": "Server configuration error: GROQ_API_KEY not set",
                "details": {}
            }
        )
    
    timeout = API_CONFIG.get("default_timeout_seconds", 30.0)
    max_retries = API_CONFIG.get("max_retries", 3)
    groq_service = GroqService(api_key=groq_api_key, timeout=timeout, max_retries=max_retries)
    fit_calculator = FitMeterCalculator()
    
    # Optional: Skin Tone (using already decoded image)
    skin_tone_result = "unknown"
    try:
        skin_detector = SkinToneDetector()
        skin_tone_data = skin_detector.detect_from_image(decoded_img)
        skin_tone_result = skin_tone_data.get("tone_category", "neutral")
        logger.info(f"Detected skin tone: {skin_tone_result}")
    except Exception as e:
        logger.warning(f"Skin tone detection skipped: {e}")

    # 4. Analyze Garment (Vision) with error handling
    logger.info("Analyzing garment with Groq Vision...")
    try:
        garment_analysis = groq_service.analyze_garment_image(image_bytes, timeout=timeout)
    except GroqServiceError as e:
        logger.error(f"Groq Vision analysis failed: {e}")
        # Use fallback defaults
        garment_analysis = {
            "garment_type": "clothing",
            "material": "fabric",
            "colors": [{"rgb": [128, 128, 128], "name": "gray", "percentage": 100}],
            "style": "casual",
            "pattern": "solid",
            "fit_type": "regular",
            "formality_level": 5
        }
        logger.warning("Using fallback garment analysis due to API error")
    
    # 5. Analyze ALL Sizes and Get Recommendation
    garment_type = garment_analysis.get("garment_type", "unknown")
    logger.info(f"Analyzing all sizes for {garment_type} with {fit_type} fit...")
    
    # Analyze all available sizes
    size_analysis = fit_calculator.analyze_all_sizes(
        user_measurements, garment_type, fit_type
    )
    
    # Get the user's selected size result (if provided)
    user_selected_size = size if size else None
    
    # Get the full fit result for the selected size (or use recommended if no size selected)
    if size and size in size_analysis['all_sizes']:
        user_selected_result = size_analysis['all_sizes'][size]
    elif size_analysis['recommended_size'] in size_analysis['all_sizes']:
        user_selected_result = size_analysis['all_sizes'][size_analysis['recommended_size']]
    else:
        # Fallback
        user_selected_result = None

    # Use the selected size's fit meters for comprehensive advice
    if user_selected_result:
        fit_meters_result = user_selected_result
    else:
        fit_meters_result = FIT_CHECK_DEFAULTS["fit_meters_fallback"].copy()

    # 6. Generate Comprehensive Advice (LLM) with error handling
    logger.info("Generating comprehensive AI advice (Groq)...")
    try:
        advice = groq_service.generate_comprehensive_advice(
            fit_meters_result=fit_meters_result,
            garment_analysis=garment_analysis,
            occasion=occasion,
            skin_tone=skin_tone_result,
            user_size=size,
            timeout=timeout
        )
    except GroqServiceError as e:
        logger.error(f"Groq advice generation failed: {e}")
        # Use empty dict - defaults will be applied later
        advice = {}
        logger.warning("Using default advice due to API error")
    
    # 7. Merge & Finalize Response (using defaults from config)
    roast_default = FIT_CHECK_DEFAULTS["roast"].copy()
    roast_data = advice.get("roast", roast_default)
    
    color_default = FIT_CHECK_DEFAULTS["color"].copy()
    color_default["skin_tone"] = {"category": skin_tone_result}
    color_data = advice.get("color_analysis", color_default)
    
    # Ensure skin_tone is always present
    if "skin_tone" not in color_data:
        color_data["skin_tone"] = {"category": skin_tone_result}
    
    if "primary_color" not in color_data:
         colors = garment_analysis.get("colors", [])
         if colors:
             c = colors[0]
             rgb_val = c.get("rgb", [128,128,128])
             if isinstance(rgb_val, list) and len(rgb_val) == 3:
                 rgb_dict = {"r": rgb_val[0], "g": rgb_val[1], "b": rgb_val[2]}
             else:
                 rgb_dict = rgb_val
             
             color_data["primary_color"] = {
                 "name": c.get("name", "Unknown"),
                 "rgb": rgb_dict
             }
    
    style_default = FIT_CHECK_DEFAULTS["style"].copy()
    style_data = advice.get("style_recommendations", style_default)
    
    occasion_default = FIT_CHECK_DEFAULTS["occasion"].copy()
    occasion_data = advice.get("occasion_analysis", occasion_default)

    # Save fit check history and get check_id
    check_id = save_fit_check_history(
        db, 
        current_user.id,  # Use authenticated user's ID, not measurement_id
        garment_analysis, 
        size, 
        size_analysis, 
        fit_meters_result, 
        color_data
    )
    
    # DEBUG: Log what we got back
    logger.info(f"🔍 After save_fit_check_history: check_id={check_id}, type={type(check_id)}")
    logger.info(f"🔍 size_analysis keys: {list(size_analysis.keys())}")
    logger.info(f"🔍 size_analysis['size_scores']: {size_analysis.get('size_scores')}")
    
    # Build response with all fields properly included in the model
    response = NewClothingFitCheckResponse(
        success=True,
        garment_analysis=GarmentAnalysisResponse(**garment_analysis),
        fit_meters=FitMetersResponse(
            fit_meters={ k: FitMeter(**v) for k,v in fit_meters_result.get('fit_meters', {}).items() },
            overall_fit_score=fit_meters_result.get('overall_fit_score', 0),
            worst_metric=fit_meters_result.get('worst_metric', 'none')
        ),
        roast=RoastResponse(**roast_data),
        color_analysis=ColorMatchResponse(**color_data),
        style_recommendations=StyleRecommendationResponse(**style_data),
        occasion_analysis=OccasionAnalysisResponse(**occasion_data),
        material_comfort=FIT_CHECK_DEFAULTS["material_comfort"].copy(),
        overall_score=fit_meters_result.get('overall_fit_score', 0),
        # Size recommendation data
        size_recommendation={
            'recommended_size': size_analysis['recommended_size'],
            'recommended_score': size_analysis['recommended_score'],
            'alternatives': size_analysis['alternatives'],
            'all_size_details': size_analysis['all_sizes']  # Full details for each size
        },
        all_sizes=size_analysis['size_scores'],  # Just scores for quick reference
        user_selected_size=user_selected_size,
        check_id=check_id  # Purchase tracking ID
    )
    
    # DEBUG: Log the actual response object values BEFORE serialization
    logger.info(f"🔍 Response object check_id attribute: {check_id}")
    logger.info(f"🔍 Response object size_recommendation: {size_analysis.get('size_scores')}")
    
    # DEBUG: Log what we're sending (using dict access to avoid AttributeError)
    response_dict = response.model_dump(exclude_none=False)  # CRITICAL: Don't exclude None values!
    logger.info(f"📤 Response includes: check_id={response_dict.get('check_id')}, has_size_rec={bool(response_dict.get('size_recommendation'))}, has_all_sizes={bool(response_dict.get('all_sizes'))}")
    logger.debug(f"📦 Full response_dict keys: {list(response_dict.keys())}")
    logger.info(f"📦 check_id in response_dict: {response_dict.get('check_id')}")
    logger.info(f"📦 all_sizes in response_dict: {response_dict.get('all_sizes')}")
    
    # NUCLEAR OPTION: Manually add the missing fields to the response dict
    response_dict['size_recommendation'] = {
        'recommended_size': size_analysis['recommended_size'],
        'recommended_score': size_analysis['recommended_score'],
        'alternatives': size_analysis['alternatives'],
        'all_size_details': size_analysis['all_sizes']
    }
    response_dict['all_sizes'] = size_analysis['size_scores']
    response_dict['user_selected_size'] = user_selected_size
    response_dict['check_id'] = check_id
    
    logger.info(f"✅ MANUALLY ADDED FIELDS - check_id={response_dict.get('check_id')}, has_size_rec={bool(response_dict.get('size_recommendation'))}")
    
    # Return the manually constructed dict as JSON
    from fastapi.responses import JSONResponse
    return JSONResponse(content=response_dict)


# ---------------------------
# ---------------------------
# Auth Endpoints - Now in routers/auth_routes.py
# ---------------------------


# ---------------------------
# ---------------------------
# Measurement Storage Endpoints - Now in routers/measurement_routes.py
# ---------------------------



# ---------------------------
# Clothing Fit Check Endpoint
# ---------------------------

# Initialize analyzers (lazy loading)
gemini_service = None
groq_service = None
fit_meter_calculator = None
skin_tone_detector = None
color_analyzer = None
material_analyzer = None
body_type_classifier = None
style_analyzer = None

def get_gemini_service():
    """Lazy load Gemini service"""
    global gemini_service
    if gemini_service is None and CLOTHING_ANALYSIS_AVAILABLE:
        gemini_service = GeminiService()
    return gemini_service

def get_groq_service():
    """Lazy load Groq service"""
    global groq_service
    if groq_service is None and CLOTHING_ANALYSIS_AVAILABLE:
        # Using the key provided by user
        key = "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" 
        groq_service = GroqService(api_key=key)
    return groq_service

def get_fit_meter_calculator():
    """Lazy load fit meter calculator"""
    global fit_meter_calculator
    if fit_meter_calculator is None and CLOTHING_ANALYSIS_AVAILABLE:
        fit_meter_calculator = FitMeterCalculator()
    return fit_meter_calculator

def get_skin_tone_detector():
    """Lazy load skin tone detector"""
    global skin_tone_detector
    if skin_tone_detector is None and CLOTHING_ANALYSIS_AVAILABLE:
        skin_tone_detector = SkinToneDetector()
    return skin_tone_detector

def get_color_analyzer():
    """Lazy load color analyzer"""
    global color_analyzer
    if color_analyzer is None and CLOTHING_ANALYSIS_AVAILABLE:
        color_analyzer = ColorAnalyzer()
    return color_analyzer

def get_material_analyzer():
    """Lazy load material analyzer"""
    global material_analyzer
    if material_analyzer is None and CLOTHING_ANALYSIS_AVAILABLE:
        material_analyzer = MaterialAnalyzer()
    return material_analyzer

def get_body_type_classifier():
    """Lazy load body type classifier"""
    global body_type_classifier
    if body_type_classifier is None and CLOTHING_ANALYSIS_AVAILABLE:
        body_type_classifier = BodyTypeClassifier()
    return body_type_classifier

def get_style_analyzer():
    """Lazy load style analyzer"""
    global style_analyzer
    if style_analyzer is None and CLOTHING_ANALYSIS_AVAILABLE:
        style_analyzer = StyleAnalyzer()
    return style_analyzer


# New response models for updated fit checker
class FitMeter(BaseModel):
    user_measurement: float
    garment_measurement: float
    ease: float
    zone: str  # 'green', 'red', or 'blue'
    status: str
    score: float

class FitMetersResponse(BaseModel):
    fit_meters: Dict[str, Optional[FitMeter]]
    overall_fit_score: float
    worst_metric: str

class RoastResponse(BaseModel):
    fit_roast: str
    verdict_stamp: str
    stamp_color: str

class GarmentAnalysisResponse(BaseModel):
    garment_type: str
    material: str
    colors: List[Dict]
    style: str
    pattern: str
    fit_type: str
    formality_level: int

class ColorMatchResponse(BaseModel):
    match_score: float
    roast: str
    suggested_colors: List[str]
    skin_tone: Dict
    primary_color: Dict[str, Any]

class StyleRecommendationResponse(BaseModel):
    outfit_suggestions: List[str]
    style_score: float

class OccasionAnalysisResponse(BaseModel):
    occasion_match_score: float
    is_appropriate: bool
    recommendation: str
    alternative_occasions: List[str]

class NewClothingFitCheckResponse(BaseModel):
    success: bool
    garment_analysis: GarmentAnalysisResponse
    fit_meters: FitMetersResponse
    roast: RoastResponse
    color_analysis: ColorMatchResponse
    style_recommendations: StyleRecommendationResponse
    occasion_analysis: OccasionAnalysisResponse
    material_comfort: Dict
    overall_score: float


@app.post("/api/v1/clothing/fit-check", response_model=NewClothingFitCheckResponse)
async def check_clothing_fit(
    clothing_image: UploadFile = File(...),
    measurement_id: int = Form(...),
    size: str = Form(...),
    occasion: str = Form(...),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    AI-Powered Clothing Fit Checker with Roasting
    
    Analyzes:
    - Garment details (type, material, color, style) using Gemini Vision
    - Fit meters with ease-based zones (green/red/blue)
    - AI-generated humorous roasts for poor fits
    - Color matching with skin tone
    - Style and outfit recommendations
    - Occasion appropriateness
    - Material comfort
    """
    if not CLOTHING_ANALYSIS_AVAILABLE:
        raise HTTPException(
            status_code=503,
            detail="Clothing analysis modules not available. Please check backend installation."
        )
    
    try:
        logger.info(f"NEW Clothing fit check request from user {current_user.email}")
        
        # Get user's saved measurement
        record = session.exec(
            select(MeasurementRecord).where(
                MeasurementRecord.id == measurement_id,
                MeasurementRecord.user_id == current_user.id
            )
        ).first()
        
        if not record:
            raise HTTPException(status_code=404, detail="Measurement not found")
        
        payload = record.payload or {}
        user_measurements = payload.get("measurements", {})
        metadata = payload.get("metadata", {})
        
        if not user_measurements:
            raise HTTPException(status_code=400, detail="No measurements found in saved record")
        
        # Load clothing image
        clothing_bytes = await clothing_image.read()
        clothing_np = np.frombuffer(clothing_bytes, np.uint8)
        clothing_img = cv2.imdecode(clothing_np, cv2.IMREAD_COLOR)
        
        if clothing_img is None:
            raise HTTPException(status_code=400, detail="Could not decode clothing image")
        
        # Get user's original photo for skin tone detection
        user_photo = None
        front_image_base64 = payload.get("metadata", {}).get("front_image_base64")
        
        if front_image_base64:
            try:
                image_bytes = base64.b64decode(front_image_base64)
                image_np = np.frombuffer(image_bytes, np.uint8)
                user_photo = cv2.imdecode(image_np, cv2.IMREAD_COLOR)
                logger.info("Successfully loaded user photo for skin tone detection")
            except Exception as e:
                logger.warning(f"Failed to decode stored front image: {e}")
                user_photo = None
        
        # Initialize services
        gemini_service = get_gemini_service()
        fit_meter_calculator = get_fit_meter_calculator()
        color_analyzer = get_color_analyzer()
        material_analyzer = get_material_analyzer()
        body_type_classifier = get_body_type_classifier()
        style_analyzer = get_style_analyzer()
        skin_tone_detector = get_skin_tone_detector()
        
        # 1. GARMENT ANALYSIS
        # Use Groq Vision (Llama 4 Scout)
        logger.info("Analyzing garment with Groq Vision...")
        groq_svc = get_groq_service()
        garment_analysis = groq_svc.analyze_garment_image(clothing_bytes)
        
        # 2. FIT METERS - Calculate ease-based fit
        logger.info("Calculating fit meters...")
        garment_type = garment_analysis.get('garment_type', 'shirt')
        
        # Estimate garment measurements if not provided by AI
        garment_measurements = garment_analysis.get('estimated_measurements', {})
        if not garment_measurements:
            garment_measurements = fit_meter_calculator.estimate_garment_measurements(
                garment_type, size, user_measurements
            )
        
        fit_meters_result = fit_meter_calculator.calculate_fit_meters(
            user_measurements, garment_measurements, garment_type
        )
        
        # 3. COLOR ANALYSIS (Moved up for batching context)
        logger.info("Analyzing colors...")
        
        # Use Gemini-detected colors if available and not default "gray"
        gemini_colors = garment_analysis.get('colors', [])
        # Check if it's the default error response (gray, 100%)
        is_default_gray = (
            len(gemini_colors) == 1 and 
            gemini_colors[0].get('name', '').lower() == 'gray' and 
            gemini_colors[0].get('percentage') == 100
        )
        
        if gemini_colors and not is_default_gray:
            logger.info(f"Using Gemini-detected colors: {gemini_colors}")
            # Convert Gemini format (RGB list) to ColorAnalyzer format (RGB dict)
            clothing_colors = []
            for c in gemini_colors:
                rgb_val = c.get('rgb', [0, 0, 0])
                # Handle if it is already a dict (just in case) or list
                if isinstance(rgb_val, list) and len(rgb_val) >= 3:
                     clothing_colors.append({
                        'rgb': {'r': rgb_val[0], 'g': rgb_val[1], 'b': rgb_val[2]},
                        'name': c.get('name', 'Unknown'),
                        'percentage': c.get('percentage', 0)
                     })
                elif isinstance(rgb_val, dict):
                    clothing_colors.append({
                        'rgb': rgb_val,
                        'name': c.get('name', 'Unknown'),
                        'percentage': c.get('percentage', 0)
                    })
        else:
            logger.info("Using OpenCV for color extraction (Gemini returned default/empty)")
            clothing_colors = color_analyzer.extract_dominant_colors(clothing_img)
        
        # Detect skin tone
        if user_photo is not None:
            skin_tone_result = skin_tone_detector.detect_from_image(user_photo)
            skin_tone = skin_tone_result['tone_category']
        else:
            skin_tone = 'medium'
            skin_tone_result = {
                'tone_category': 'medium',
                'description': 'Medium (default)',
                'rgb_values': {'r': 170, 'g': 140, 'b': 120},
                'confidence': 0.5
            }
        
        # Analyze basic color compatibility (Local Logic)
        color_result = color_analyzer.analyze_color_compatibility(clothing_colors, skin_tone)
        primary_color_name = color_result['primary_color']['name']

        # 4. COMPREHENSIVE AI ADVICE (Groq Hybrid)
        # Generates Fit Roast, Color Roast, Style Recs, and Occasion Analysis in ONE call
        logger.info("Generating comprehensive AI advice (Groq)...")
        groq_svc = get_groq_service()
        advice = groq_svc.generate_comprehensive_advice(
            fit_meters_result, 
            garment_analysis, 
            occasion, 
            skin_tone,
            size
        )

        # Unpack advice with defaults merging
        # Roast
        default_roast = {
            "fit_roast": f"The fit seems {fit_meters_result['worst_metric']}...",
            "verdict_stamp": "FIT CHECK",
            "stamp_color": "gray"
        }
        ai_roast = advice.get('roast', {})
        roast_result = {**default_roast, **ai_roast}
        
        # Color Analysis
        color_ai_data = advice.get('color_analysis', {})
        if color_ai_data.get('match_score'):
             color_result['match_score'] = color_ai_data['match_score']
        
        current_roast = color_result.get('roast', "Color analysis complete.")
        color_result['roast'] = color_ai_data.get('roast', current_roast)
        
        current_suggestions = color_result.get('suggested_colors', [])
        color_result['suggested_colors'] = color_ai_data.get('suggested_colors', current_suggestions)
        
        # Style Recommendations
        style_ai_data = advice.get('style_recommendations', {})
        outfit_suggestions = style_ai_data.get('outfit_suggestions', ["Jeans", "Sneakers"])
        
        # 5. STYLE & OCCASION LOCAL LOGIC mixed with AI
        logger.info("Finalizing style and occasion...")
        
        gender = metadata.get("gender", "neutral")
        body_type_result = body_type_classifier.classify(user_measurements, gender)
        style_result = style_analyzer.analyze_style(
            body_type=body_type_result['body_type'],
            clothing_type=garment_type,
            occasion=occasion
        )
        if style_ai_data.get('style_score'):
            style_result['style_compatibility'] = style_ai_data['style_score']

        # Occasion Analysis
        occasion_ai_data = advice.get('occasion_analysis', {})
        default_occasion = {
            "occasion_match_score": 85,
            "is_appropriate": True,
            "recommendation": f"Suitable for {occasion}",
            "alternative_occasions": []
        }
        occasion_result = {**default_occasion, **occasion_ai_data}
        
        # 7. MATERIAL COMFORT
        logger.info("Analyzing material comfort...")
        material = garment_analysis.get('material', 'cotton')
        climate = 'Moderate'
        if occasion.lower() in ['winter', 'cold']:
            climate = 'Cold'
        elif occasion.lower() in ['summer', 'beach']:
            climate = 'Warm'
        
        material_result = material_analyzer.analyze_material(
            material=material,
            occasion=occasion,
            climate=climate
        )
        
        # 8. CALCULATE OVERALL SCORE
        overall_score = (
            fit_meters_result['overall_fit_score'] * 0.40 +  # Fit is most important
            style_result['style_compatibility'] * 0.20 +
            color_result['match_score'] * 0.20 +
            occasion_result['occasion_match_score'] * 0.10 +
            material_result['comfort_score'] * 0.10
        )
        
        # Format response
        # Prepare fit meters dict
        meters_dict = {}
        for part in ['chest', 'waist', 'hip', 'shoulder']:
            if part in fit_meters_result['fit_meters']:
                meters_dict[part] = FitMeter(**fit_meters_result['fit_meters'][part])
        
        fit_meters_response = FitMetersResponse(
            fit_meters=meters_dict,
            overall_fit_score=fit_meters_result['overall_fit_score'],
            worst_metric=fit_meters_result['worst_metric']
        )
        
        # Prepare primary color with correct RGB format
        prim_col = color_result.get('primary_color', {'name': 'unknown', 'rgb': {'r': 128, 'g': 128, 'b': 128}})
        # Ensure RGB is dict
        if isinstance(prim_col.get('rgb'), list):
            r, g, b = prim_col['rgb']
            prim_col['rgb'] = {'r': r, 'g': g, 'b': b}

        color_analysis_response = ColorMatchResponse(
            match_score=color_result['match_score'],
            roast=color_result['roast'],
            suggested_colors=color_result.get('suggested_colors', []),
            skin_tone=skin_tone_result,
            primary_color=prim_col
        )

        return NewClothingFitCheckResponse(
            success=True,
            garment_analysis=GarmentAnalysisResponse(**garment_analysis),
            fit_meters=fit_meters_response,
            roast=RoastResponse(**roast_result),
            color_analysis=color_analysis_response,
            style_recommendations=StyleRecommendationResponse(
                outfit_suggestions=outfit_suggestions,
                style_score=style_result['style_compatibility']
            ),
            occasion_analysis=OccasionAnalysisResponse(**occasion_result),
            material_comfort={
                'comfort_score': material_result['comfort_score'],
                'suitability': material_result['suitability'],
                'best_for': material_result['best_for']
            },
            overall_score=round(overall_score, 1)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Error in clothing fit check: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to analyze clothing fit: {str(e)}"
        )



# ---------------------------
# Virtual Try-On (Swayam repo) - Backend only
# Virtual Try-On Endpoint (scaffold)
# ---------------------------

@app.post("/api/v1/virtual-try-on")
async def virtual_try_on(
    user_image: UploadFile = File(...),
    garment_image: UploadFile = File(...)
):
    """
    Accepts a user image and a garment image, prepares inputs for the
    local clothes-virtual-try-on pipeline, and performs preflight checks.

    Note: Full inference requires additional dependencies (OpenPose,
    human parsing, model checkpoints). This endpoint currently prepares
    inputs and returns missing prerequisites.
    """
    try:
        base_dir = Path(__file__).parent.parent
        vton_dir = base_dir / "clothes-virtual-try-on-main"
        if not vton_dir.exists():
            raise HTTPException(status_code=500, detail="clothes-virtual-try-on-main not found in workspace")

        # Prepare dataset structure under vton_dir/datasets/test
        ds_dir = vton_dir / "datasets"
        test_dir = ds_dir / "test"
        image_dir = test_dir / "image"
        cloth_dir = test_dir / "cloth"
        image_dir.mkdir(parents=True, exist_ok=True)
        cloth_dir.mkdir(parents=True, exist_ok=True)

        # Save uploaded files
        user_bytes = await user_image.read()
        garment_bytes = await garment_image.read()

        user_name = f"user_{datetime.now().strftime('%Y%m%d_%H%M%S')}.jpg"
        garment_name = f"garment_{datetime.now().strftime('%Y%m%d_%H%M%S')}.jpg"

        user_path = image_dir / user_name
        garment_path = cloth_dir / garment_name

        with open(user_path, "wb") as f:
            f.write(user_bytes)
        with open(garment_path, "wb") as f:
            f.write(garment_bytes)

        # Create test_pairs.txt
        pairs_path = ds_dir / "test_pairs.txt"
        with open(pairs_path, "w") as f:
            f.write(f"{user_name} {garment_name}")

        # Preflight checks
        missing = []
        checkpoints_dir = vton_dir / "checkpoints"
        if not checkpoints_dir.exists():
            missing.append("checkpoints (seg_final.pth, gmm_final.pth, alias_final.pth)")
        # Required precomputed assets
        required_asset_dirs = [
            test_dir / "image-parse",
            test_dir / "openpose-json",
            test_dir / "openpose-img",
            test_dir / "cloth-mask",
        ]
        for d in required_asset_dirs:
            if not d.exists():
                missing.append(str(d.relative_to(vton_dir)))

        return {
            "success": True,
            "message": "Inputs prepared. Additional prerequisites required for full inference.",
            "vton_base": str(vton_dir),
            "inputs": {
                "user_image": str(user_path.relative_to(vton_dir)),
                "garment_image": str(garment_path.relative_to(vton_dir)),
                "pairs_file": str(pairs_path.relative_to(vton_dir)),
            },
            "missing": missing,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Virtual Try-On preparation failed")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/measurements")
async def get_measurements(
    front_image: UploadFile = File(..., description="Front view image (required)"),
    side_image: Optional[UploadFile] = File(None, description="Side view image (optional)"),
    height_cm: Optional[float] = Form(None, description="User height in cm"),
    gender: Optional[str] = Form(None, description="Gender: 'male' or 'female'"),
    age: Optional[int] = Form(None, description="Age in years"),
    current_user: User = Depends(get_current_user),  # CRITICAL: Require authentication
    session: Session = Depends(get_session),
):
    """
    Process images and return body measurements.
    Requires authentication to ensure measurements are associated with the correct user.
    
    - **front_image**: Front view photo (required)
    - **side_image**: Side view photo (optional, for better accuracy)
    - **height_cm**: User's height in centimeters (optional but recommended)
    - **gender**: Gender for size recommendations (optional)
    - **age**: Age for age-based sizing (optional)
    
    Returns:
    - measurements: Dictionary of 22 body measurements
    - size_recommendations: Size recommendations for different clothing categories
    - metadata: Processing information (includes user_id for tracking)
    """
    try:
        logger.info(f"Measurement request from user {current_user.id} ({current_user.email})")
        logger.info(f"Height: {height_cm}, Gender: {gender}, Age: {age}")
        logger.info(f"Front image filename: {front_image.filename if front_image else 'None'}")
        logger.info(f"Side image filename: {side_image.filename if side_image else 'None'}")
        
        # Validate front image
        if not front_image.filename:
            raise HTTPException(
                status_code=400,
                detail="Front image is required"
            )
        
        # Check file size (max 10MB)
        front_image.file.seek(0, 2)  # Seek to end
        file_size = front_image.file.tell()
        front_image.file.seek(0)  # Reset to beginning
        
        if file_size > 10 * 1024 * 1024:  # 10MB
            raise HTTPException(
                status_code=400,
                detail="File size exceeds 10MB limit"
            )
        
        # Read front image
        front_bytes = await front_image.read()
        front_np = np.frombuffer(front_bytes, np.uint8)
        front_img = cv2.imdecode(front_np, cv2.IMREAD_COLOR)
        
        if front_img is None:
            raise HTTPException(
                status_code=400,
                detail="Invalid front image. Please upload a valid image file (JPEG, PNG)."
            )
        
        logger.info(f"Front image loaded: shape={front_img.shape}, size={file_size/1024:.2f}KB")
        
        # Read side image if provided
        side_img = None
        if side_image and side_image.filename:
            side_bytes = await side_image.read()
            side_np = np.frombuffer(side_bytes, np.uint8)
            side_img = cv2.imdecode(side_np, cv2.IMREAD_COLOR)
            if side_img is not None:
                logger.info(f"Side image loaded: shape={side_img.shape}")
            else:
                logger.warning("Side image provided but could not be decoded")
        
        # Get pipeline
        measurement_pipeline = get_pipeline()
        
        # Process images
        logger.info("Starting measurement processing...")
        result = measurement_pipeline.process_image(
            front_image=front_img,
            side_image=side_img,
            user_height_cm=height_cm,
            gender=gender,
            age=age
        )
        
        # Check if result indicates failure
        if not result.get('success', False):
            error_msg = result.get('error', 'Unknown error')
            stage = result.get('stage', 'unknown')
            logger.error(f"Measurement failed at stage {stage}: {error_msg}")
            raise HTTPException(
                status_code=500,
                detail=f"Measurement failed: {error_msg}"
            )
        
        # Additional check: Even if success=True, verify measurements exist
        measurements_dict = result.get('measurements', {})
        if not measurements_dict or len(measurements_dict) == 0:
            logger.error("Pipeline returned success=True but with empty measurements!")
            logger.error("This indicates a problem in the measurement extraction process")
            raise HTTPException(
                status_code=500,
                detail="Measurement extraction failed: No measurements could be extracted from the image. Please try with a different, clearer image."
            )
        
        logger.info("Measurement completed successfully")
        measurements_count = len(result.get('measurements', {}))
        logger.info(f"Extracted {measurements_count} measurements")
        
        # Ensure measurements is always a dict, even if empty
        if 'measurements' not in result or result['measurements'] is None:
            result['measurements'] = {}
            logger.warning("Measurements dict was None or missing, setting to empty dict")
        
        if measurements_count == 0:
            logger.warning("=" * 80)
            logger.warning("WARNING: No measurements were extracted!")
            logger.warning("This might indicate:")
            logger.warning("  1. No person was detected in the image")
            logger.warning("  2. PARE inference failed")
            logger.warning("  3. Measurement extraction failed")
            logger.warning("=" * 80)
        else:
            logger.info(f"Successfully extracted {measurements_count} measurements:")
            for key, value in list(result.get('measurements', {}).items())[:5]:
                logger.info(f"  - {key}: {value} cm")
            if measurements_count > 5:
                logger.info(f"  ... and {measurements_count - 5} more")
        
        logger.info(f"Returning response: success={result.get('success')}, measurements_count={measurements_count}")
        logger.info("=" * 80)

        # Encode front image to base64 for storage with measurements
        # This allows skin tone detection during fit-check
        try:
            # Encode the front image as JPEG base64
            _, buffer = cv2.imencode('.jpg', front_img, [cv2.IMWRITE_JPEG_QUALITY, 85])
            front_image_base64 = base64.b64encode(buffer).decode('utf-8')
            
            # Add to metadata so it can be saved with measurements
            if 'metadata' not in result:
                result['metadata'] = {}
            result['metadata']['front_image_base64'] = front_image_base64
            result['metadata']['user_id'] = current_user.id  # Track user ownership
            logger.info("Front image encoded to base64 and added to metadata")
        except Exception as e:
            logger.warning(f"Failed to encode front image to base64: {e}")
            # Continue without the image - skin tone detection will use default

        # Note: We don't auto-save anymore. User must explicitly save with a name.
        # This allows users to choose which measurements to save and name them.

        return JSONResponse(content=result)
    
    except HTTPException as he:
        # Re-raise HTTP exceptions
        logger.error(f"HTTP Exception: {he.detail}")
        raise
    except Exception as e:
        logger.exception(f"Unexpected error: {e}")
        logger.error(f"Error type: {type(e).__name__}")
        logger.error(f"Error message: {str(e)}")
        import traceback
        logger.error(f"Traceback:\n{traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    
    # Ensure we're in the api directory for relative imports
    import os
    api_dir = os.path.dirname(os.path.abspath(__file__))
    if os.getcwd() != api_dir:
        os.chdir(api_dir)
        logger.info(f"Changed working directory to: {api_dir}")
    
    # Configure logging
    logger.add(
        "api.log",
        rotation="10 MB",
        retention="7 days",
        level="INFO"
    )
    
    logger.info("Starting FastAPI server...")
    logger.info(f"Python: {sys.executable}")
    logger.info(f"Working Directory: {os.getcwd()}")
    logger.info("API will be available at: http://localhost:8000")
    logger.info("API documentation at: http://localhost:8000/docs")
    
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
