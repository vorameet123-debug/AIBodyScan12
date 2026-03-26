"""
Response Models — Pydantic models for API responses.
Extracted from app.py to keep the main file focused on routes.
"""
from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict


# ─── Auth ──────────────────────────────────────────────────
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class SaveMeasurementRequest(BaseModel):
    name: str
    measurement_data: dict


class MeasurementRecordResponse(BaseModel):
    id: int
    name: str | None
    measurements: dict
    size_recommendations: dict | None = None
    metadata: dict | None = None
    created_at: datetime


# ─── Clothing Fit Check V1 ─────────────────────────────────
class ClothingFitRequest(BaseModel):
    measurement_id: int
    clothing_type: str
    size: str
    size_system: str = "US"
    brand: str | None = None
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
    problem_areas: list[ProblemArea]
    alternative_sizes: list[AlternativeSize]
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
    recommended_styles: list[str]
    styles_to_avoid: list[str]
    occasion_notes: list[str]
    overall_recommendation: str


class ColorInfo(BaseModel):
    rgb: dict
    name: str
    percentage: float | None = None


class AlternativeColor(BaseModel):
    name: str
    rgb: dict
    match_score: float


class ColorAnalysisResponse(BaseModel):
    match_score: float
    compatibility: str
    primary_color: ColorInfo
    all_colors: list[ColorInfo]
    recommendation: str
    alternative_colors: list[AlternativeColor]
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
    best_for: list[str]
    care_instructions: str
    shrinkage_risk: str
    warnings: list[str]
    recommendations: list[str]


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
    alerts: list[str]


# ─── Clothing Fit Check V2 (Groq) ──────────────────────────
class FitMeter(BaseModel):
    status: str
    ease: float
    user_measurement: float
    garment_measurement: float
    zone: str
    score: float


class FitMetersResponse(BaseModel):
    fit_meters: dict[str, FitMeter | None]
    overall_fit_score: float
    worst_metric: str


class GarmentAnalysisResponse(BaseModel):
    garment_type: str
    material: str
    colors: list[dict]
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
    rgb_values: dict[str, int]
    confidence: float


class ColorMatchResponse(BaseModel):
    match_score: int
    roast: str
    suggested_colors: list[str]
    skin_tone: dict
    primary_color: dict[str, Any]


class StyleRecommendationResponse(BaseModel):
    outfit_suggestions: list[str]
    style_score: int


class OccasionAnalysisResponse(BaseModel):
    occasion_match_score: int
    is_appropriate: bool
    recommendation: str
    alternative_occasions: list[str]


class NewClothingFitCheckResponse(BaseModel):
    model_config = ConfigDict(
        extra="allow",
        use_enum_values=True,
        populate_by_name=True,
    )

    success: bool
    garment_analysis: GarmentAnalysisResponse
    fit_meters: FitMetersResponse
    roast: RoastResponse
    color_analysis: ColorMatchResponse
    style_recommendations: StyleRecommendationResponse
    occasion_analysis: OccasionAnalysisResponse
    material_comfort: dict
    overall_score: float
    size_recommendation: dict[str, Any]
    all_sizes: dict[str, Any]
    user_selected_size: str | None = None
    check_id: int
