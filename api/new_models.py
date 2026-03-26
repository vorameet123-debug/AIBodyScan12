# New Clothing Fit Check V2 Models (with Groq Integration)

class FitMeter(BaseModel):
    status: str
    ease: float
    user_measurement: float
    garment_measurement: float

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
    success: bool
    garment_analysis: GarmentAnalysisResponse
    fit_meters: FitMetersResponse
    roast: RoastResponse
    color_analysis: ColorMatchResponse
    style_recommendations: StyleRecommendationResponse
    occasion_analysis: OccasionAnalysisResponse
    material_comfort: Dict
    overall_score: float
    # Size recommendation fields
    size_recommendation: Optional[Dict[str, Any]] = None
    all_sizes: Optional[Dict[str, Any]] = None
    user_selected_size: Optional[str] = None

