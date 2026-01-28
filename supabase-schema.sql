-- MyHealth テーブル作成SQL
-- Supabase SQL Editorで実行してください

-- 目標テーブル
CREATE TABLE IF NOT EXISTS goals (
  id BIGSERIAL PRIMARY KEY,
  target_weight_kg DECIMAL(5,2) NOT NULL,
  target_date DATE NOT NULL,
  initial_weight_kg DECIMAL(5,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 体重記録テーブル
CREATE TABLE IF NOT EXISTS weight_logs (
  id BIGSERIAL PRIMARY KEY,
  weight_kg DECIMAL(5,2) NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 食事記録テーブル
CREATE TABLE IF NOT EXISTS meals (
  id BIGSERIAL PRIMARY KEY,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  description TEXT NOT NULL,
  calories INTEGER,
  recorded_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 運動記録テーブル
CREATE TABLE IF NOT EXISTS exercises (
  id BIGSERIAL PRIMARY KEY,
  description TEXT NOT NULL,
  duration_minutes INTEGER,
  calories_burned INTEGER,
  heart_rate_avg INTEGER,
  recorded_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- チャット履歴テーブル
CREATE TABLE IF NOT EXISTS chat_messages (
  id BIGSERIAL PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_meals_recorded_at ON meals(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_exercises_recorded_at ON exercises(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_weight_logs_recorded_at ON weight_logs(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);

-- RLS (Row Level Security) - 必要に応じて有効化
-- ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
