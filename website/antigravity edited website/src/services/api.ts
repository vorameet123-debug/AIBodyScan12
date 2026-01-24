import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000, // 5 minutes for image processing
});

export interface Measurement {
  [key: string]: number;
}

export interface SizeRecommendation {
  [key: string]: string;
}

export interface Model3D {
  vertices?: number[][];
  type: string;
}

export interface MeasurementResponse {
  success: boolean;
  measurements: Measurement;
  size_recommendations?: SizeRecommendation;
  model_3d?: Model3D;
  metadata?: {
    processing_time?: number;
    stage?: string;
    user_height_cm?: number;
    measurements_extracted?: number;
    gender?: string;
    scaling_info?: any;
  };
  error?: string;
}

export interface SavedMeasurement {
  id: number;
  name: string;
  measurements: Measurement;
  size_recommendations?: SizeRecommendation;
  metadata?: any;
  created_at: string;
}

export interface SavedMeasurementsResponse {
  measurements: SavedMeasurement[];
  count: number;
}

// Clothing Fit Check Interfaces
export interface ProblemArea {
  area: string;
  issue: string;
  severity: string;
}

export interface AlternativeSize {
  size: string;
  fit_confidence: number;
  difference: number;
}

export interface FitAnalysis {
  fit_confidence: number;
  fit_status: string;
  problem_areas: ProblemArea[];
  alternative_sizes: AlternativeSize[];
  expected_measurements: Record<string, number>;
  user_measurements_used: Record<string, number>;
}

export interface StyleAnalysis {
  body_type: string;
  body_type_description: string;
  style_compatibility: number;
  body_type_score: number;
  occasion_score: number;
  fit_preference: string;
  description: string;
  recommended_styles: string[];
  styles_to_avoid: string[];
  occasion_notes: string[];
  overall_recommendation: string;
}

export interface ColorInfo {
  rgb: { r: number; g: number; b: number };
  name: string;
  percentage?: number;
}

export interface AlternativeColor {
  name: string;
  rgb: { r: number; g: number; b: number };
  match_score: number;
}

export interface ColorAnalysis {
  match_score: number;
  compatibility: string;
  primary_color: ColorInfo;
  all_colors: ColorInfo[];
  recommendation: string;
  alternative_colors: AlternativeColor[];
  skin_tone: {
    tone_category: string;
    description: string;
    rgb_values: { r: number; g: number; b: number };
    confidence: number;
  };
}

export interface MaterialAnalysis {
  comfort_score: number;
  breathability: number;
  softness: number;
  durability: number;
  moisture_wicking: number;
  warmth: number;
  coolness: number;
  skin_sensitivity: string;
  suitability: string;
  occasion_suitability: string;
  climate_suitability: string;
  best_for: string[];
  care_instructions: string;
  shrinkage_risk: string;
  warnings: string[];
  recommendations: string[];
}

export interface OverallRecommendation {
  overall_score: number;
  recommendation: string;
  breakdown: {
    fit: number;
    style: number;
    color: number;
    material: number;
  };
}

// New Fit Checker Response Interfaces
export interface FitMeter {
  user_measurement: number;
  garment_measurement: number;
  ease: number;
  zone: string; // 'green', 'red', or 'blue'
  status: string;
  score: number;
}

export interface FitMetersResponse {
  fit_meters: Record<string, FitMeter>;
  overall_fit_score: number;
  worst_metric: string;
  total_measurements?: number;
}

export interface RoastResponse {
  fit_roast: string;
  verdict_stamp: string;
  stamp_color: string;
}

export interface GarmentAnalysis {
  garment_type: string;
  material: string;
  colors: Array<{
    rgb: { r: number; g: number; b: number };
    name: string;
    percentage?: number;
  }>;
  style: string;
  pattern: string;
  fit_type: string;
  formality_level: number;
}

export interface ColorMatchResponse {
  match_score: number;
  roast: string;
  suggested_colors: string[];
  skin_tone: {
    tone_category: string;
    description: string;
    rgb_values: { r: number; g: number; b: number };
    confidence: number;
  };
  primary_color: {
    name: string;
    rgb: { r: number; g: number; b: number };
    percentage: number;
  };
}

export interface StyleRecommendationResponse {
  outfit_suggestions: string[];
  style_score: number;
}

export interface OccasionAnalysisResponse {
  occasion_match_score: number;
  is_appropriate: boolean;
  recommendation: string;
  alternative_occasions: string[];
}

export interface MaterialComfort {
  comfort_score: number;
  suitability: string;
  best_for: string[];
}

export interface NewClothingFitCheckResponse {
  success: boolean;
  garment_analysis: GarmentAnalysis;
  fit_meters: FitMetersResponse;
  roast: RoastResponse;
  color_analysis: ColorMatchResponse;
  style_recommendations: StyleRecommendationResponse;
  occasion_analysis: OccasionAnalysisResponse;
  material_comfort: MaterialComfort;
  overall_score: number;
}

// Old response format (kept for backwards compatibility)
export interface ClothingFitCheckResponse {
  success: boolean;
  fit_analysis: FitAnalysis;
  style_analysis: StyleAnalysis;
  color_analysis: ColorAnalysis;
  material_analysis: MaterialAnalysis;
  overall_recommendation: OverallRecommendation;
  alerts: string[];
}


export const ApiService = {
  // Test connection
  testConnection: async () => {
    return api.get('/api/v1/test-connection');
  },

  // Get API info
  getInfo: async () => {
    return api.get('/api/v1/info');
  },

  // Health check
  healthCheck: async () => {
    return api.get('/api/v1/health');
  },

  // Process measurements
  processMeasurements: async (
    frontImage: File,
    sideImage?: File,
    heightCm?: number,
    gender?: string,
    age?: number
  ): Promise<MeasurementResponse> => {
    const formData = new FormData();
    formData.append('front_image', frontImage);

    if (sideImage) {
      formData.append('side_image', sideImage);
    }

    if (heightCm) {
      formData.append('height_cm', heightCm.toString());
    }

    if (gender) {
      formData.append('gender', gender);
    }

    if (age) {
      formData.append('age', age.toString());
    }

    const response = await api.post<MeasurementResponse>(
      '/api/v1/measurements',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  },

  // Save measurement with a name
  saveMeasurement: async (name: string, measurementData: MeasurementResponse) => {
    const response = await api.post('/api/v1/measurements/save', {
      name,
      measurement_data: measurementData,
    });
    return response.data;
  },

  // Get all saved measurements for current user
  getMyMeasurements: async (): Promise<SavedMeasurementsResponse> => {
    const response = await api.get<SavedMeasurementsResponse>('/api/v1/measurements/my-measurements');
    return response.data;
  },

  // Get a specific measurement by ID
  getMeasurement: async (id: number): Promise<MeasurementResponse & { id: number; name: string; created_at: string }> => {
    const response = await api.get(`/api/v1/measurements/${id}`);
    return response.data;
  },

  // Delete a measurement
  deleteMeasurement: async (id: number) => {
    const response = await api.delete(`/api/v1/measurements/${id}`);
    return response.data;
  },

  // Clothing Fit Check
  checkClothingFit: async (
    clothingImage: File,
    measurementId: number,
    clothingType: string,
    size: string,
    sizeSystem: string,
    material: string,
    occasion: string,
    brand?: string
  ): Promise<ClothingFitCheckResponse> => {
    const formData = new FormData();
    formData.append('clothing_image', clothingImage);
    formData.append('measurement_id', measurementId.toString());
    formData.append('clothing_type', clothingType);
    formData.append('size', size);
    formData.append('size_system', sizeSystem);
    formData.append('material', material);
    formData.append('occasion', occasion);
    if (brand) {
      formData.append('brand', brand);
    }

    const response = await api.post('/api/v1/clothing/fit-check', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Clothing Fit Check V2 (Product image with AI analysis)
  // Clothing Fit Check V2 (Product image with AI analysis)
  checkClothingFitV2: async (
    productImage: File,
    measurementId: number,
    size: string,
    occasion: string,
  ): Promise<NewClothingFitCheckResponse> => {
    const formData = new FormData();
    formData.append('clothing_image', productImage);
    formData.append('measurement_id', measurementId.toString());
    formData.append('size', size);
    formData.append('occasion', occasion);

    const response = await api.post('/api/v1/clothing/fit-check', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default api;
