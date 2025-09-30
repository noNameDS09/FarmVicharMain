export type DataOfLogType = {
  id: string;
  farmId?: string;
  activityType?: string;
  description?: string;
  geoLocation?: any | null;
  timestamp?: string;
};

export type AlertType = {
  id: string;
  userId?: string;
  alertType?: string;
  message?: string;
  dueDate?: string | null;
  status?: string;
  priority?: number;
  createdAt?: string;
};

export interface DashboardData {
  user_profile?: {
    id?: string;
    fullName?: string;
    phone?: string;
  };
  weather?: {
    temperature?: number;
    condition?: string;
    humidity?: number;
    wind_speed?: number;
    error?: string;
  };
  predictions?: {
    recommended_crop?: string;
    yield_prediction_kg_acre?: number;
    pest_risk_percent?: number;
    quality_grading_score?: number;
    price_range_per_quintal?: {
      crop_name?: string;
      min_price?: number;
      max_price?: number;
    };
    applicable_schemes?: string[];
    applied_schemes?: string[];
  };
}
