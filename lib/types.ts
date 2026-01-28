// 食事の種類
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

// 食事記録
export interface Meal {
  id: number;
  meal_type: MealType;
  description: string;
  calories?: number;
  recorded_at: string; // ISO 8601
  created_at: string;
}

// 運動記録
export interface Exercise {
  id: number;
  description: string;
  duration_minutes?: number;
  calories_burned?: number;
  heart_rate_avg?: number;
  recorded_at: string; // ISO 8601
  created_at: string;
}

// 体重記録
export interface WeightLog {
  id: number;
  weight_kg: number;
  recorded_at: string; // ISO 8601
  created_at: string;
}

// 目標
export interface Goal {
  id: number;
  target_weight_kg: number;
  target_date: string; // YYYY-MM-DD
  initial_weight_kg: number;
  notes?: string;
  created_at: string;
}

// チャットメッセージ
export interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

// API レスポンス型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
