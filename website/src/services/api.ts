import axios from 'axios';
import { API_BASE_URL } from '../config/apiConfig';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000, // 5 minutes for image processing
  headers: {
    'ngrok-skip-browser-warning': 'true',  // Skip ngrok interstitial page
  },
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
    scaling_info?: Record<string, number>;
  };
  error?: string;
}

export interface SavedMeasurement {
  id: number;
  name: string;
  measurements: Measurement;
  size_recommendations?: SizeRecommendation;
  metadata?: Record<string, unknown>;
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

export interface ClothingFitCheckResponse {
  success: boolean;
  fit_analysis: FitAnalysis;
  style_analysis: StyleAnalysis;
  color_analysis: ColorAnalysis;
  material_analysis: MaterialAnalysis;
  overall_recommendation: OverallRecommendation;
  alerts: string[];
}

// New Fit Check V2 Interfaces
export interface FitMeter {
  status: string;
  ease: number;
  user_measurement: number;
  garment_measurement: number;
  zone: string;
  score: number;
}

export interface FitMetersResponse {
  fit_meters: { [key: string]: FitMeter };
  overall_fit_score: number;
  worst_metric: string;
}

export interface GarmentAnalysis {
  garment_type: string;
  material: string;
  colors: { rgb: { r: number, g: number, b: number } | number[]; name: string; percentage?: number }[];
  style: string;
  pattern: string;
  fit_type: string;
  formality_level: number;
}

export interface RoastResponse {
  fit_roast: string;
  verdict_stamp: string;
  stamp_color: string;
}

export interface ColorMatchResponse {
  match_score: number;
  roast: string;
  suggested_colors: string[];
  skin_tone: { category: string } | any;
  primary_color: { name: string; rgb: { r: number, g: number, b: number } | any } | any;
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

export interface FitDetails {
  fit_meters: Record<string, FitMeter | null>;
  overall_fit_score: number;
  worst_metric: string;
}

export interface NewClothingFitCheckResponse {
  success: boolean;
  garment_analysis: GarmentAnalysis;
  fit_meters: FitMetersResponse;
  roast: RoastResponse;
  color_analysis: ColorMatchResponse;
  style_recommendations: StyleRecommendationResponse;
  occasion_analysis: OccasionAnalysisResponse;
  material_comfort: { score: number; description: string };
  overall_score: number;
  // Size recommendation fields
  size_recommendation?: {
    recommended_size: string;
    recommended_score: number;
    alternatives: Array<{
      size: string;
      score: number;
      difference: number;
    }>;
    all_size_details?: Record<string, FitDetails>; // Full fit data for each size
  };
  all_sizes?: { [size: string]: number };
  user_selected_size?: string;
  check_id?: number; // ID of the saved fit check for purchase tracking
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

  // Update an existing measurement
  updateMeasurement: async (id: number, name: string, measurementData: MeasurementResponse) => {
    const response = await api.put(`/api/v1/measurements/${id}`, {
      name,
      measurement_data: measurementData,
    });
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

  checkClothingFitV2: async (
    clothingImage: File,
    measurementId: number,
    size: string,
    occasion: string,
    fitType: string = 'slim'
  ): Promise<NewClothingFitCheckResponse> => {
    const formData = new FormData();
    formData.append('productImage', clothingImage);
    formData.append('measurement_id', measurementId.toString());
    formData.append('size', size);
    formData.append('occasion', occasion);
    formData.append('fit_type', fitType);

    const response = await api.post<NewClothingFitCheckResponse>('/api/v1/clothing/fit-check', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default api;

