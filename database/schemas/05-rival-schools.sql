-- ライバル校システム用データベーススキーマ
-- このファイルを実行して、ライバル校システムの基盤となるテーブルを作成してください

-- ========================================
-- 1. 地域特性テーブル
-- ========================================
CREATE TABLE IF NOT EXISTS regional_characteristics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prefecture VARCHAR(50) UNIQUE NOT NULL,
  region VARCHAR(50) NOT NULL,
  
  -- 気候データ
  climate_data JSONB NOT NULL DEFAULT '{}',
  
  -- 文化データ
  culture_data JSONB NOT NULL DEFAULT '{}',
  
  -- インフラデータ
  infrastructure_data JSONB NOT NULL DEFAULT '{}',
  
  -- シグネチャーポケモン
  signature_pokemon JSONB NOT NULL DEFAULT '{}',
  
  -- メタデータ
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- 2. ライバル校テーブル
-- ========================================
CREATE TABLE IF NOT EXISTS rival_schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  prefecture VARCHAR(50) NOT NULL,
  region VARCHAR(50) NOT NULL,
  
  -- 学校の基本情報
  school_type VARCHAR(50) NOT NULL, -- traditional, emerging, technical, power, balanced, specialized, academy
  school_rank VARCHAR(10) NOT NULL, -- S++, S+, S, A+, A, B+, B
  
  -- 能力値
  rating INTEGER NOT NULL DEFAULT 1000,
  level INTEGER NOT NULL DEFAULT 1,
  
  -- 学校の特徴
  philosophy TEXT,
  specialties TEXT[],
  weaknesses TEXT[],
  
  -- 戦術プロファイル
  tactics_profile JSONB NOT NULL DEFAULT '{}',
  
  -- チーム構成
  team_composition JSONB NOT NULL DEFAULT '{}',
  
  -- エースポケモン
  ace_pokemon JSONB NOT NULL DEFAULT '{}',
  
  -- 現在の状態
  current_form VARCHAR(50) DEFAULT 'normal', -- excellent, good, normal, poor, terrible
  growth_trajectory VARCHAR(50) DEFAULT 'stable', -- rising, stable, declining
  
  -- 怪我・疲労状況
  injury_situation JSONB NOT NULL DEFAULT '{}',
  
  -- 地域・文化による修正値
  regional_modifiers JSONB NOT NULL DEFAULT '{}',
  culture_modifiers JSONB NOT NULL DEFAULT '{}',
  
  -- メタデータ
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- 3. 学校成長履歴テーブル
-- ========================================
CREATE TABLE IF NOT EXISTS school_growth_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES rival_schools(id) ON DELETE CASCADE,
  
  -- 成長記録
  date DATE NOT NULL,
  previous_rating INTEGER NOT NULL,
  new_rating INTEGER NOT NULL,
  rating_change INTEGER NOT NULL,
  
  -- 成長要因
  growth_factors JSONB NOT NULL DEFAULT '{}',
  
  -- メタデータ
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- 4. ライバル関係テーブル
-- ========================================
CREATE TABLE IF NOT EXISTS rivalry_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id_1 UUID NOT NULL REFERENCES rival_schools(id) ON DELETE CASCADE,
  school_id_2 UUID NOT NULL REFERENCES rival_schools(id) ON DELETE CASCADE,
  
  -- ライバル関係の種類
  rivalry_type VARCHAR(50) NOT NULL, -- intense, friendly, historical, regional
  
  -- 関係の強度
  intensity INTEGER NOT NULL DEFAULT 50, -- 0-100
  
  -- 関係の履歴
  rivalry_history JSONB NOT NULL DEFAULT '{}',
  
  -- メタデータ
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- ユニーク制約
  UNIQUE(school_id_1, school_id_2)
);

-- ========================================
-- 5. 学校実績・記録テーブル
-- ========================================
CREATE TABLE IF NOT EXISTS school_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES rival_schools(id) ON DELETE CASCADE,
  
  -- 実績の種類
  achievement_type VARCHAR(50) NOT NULL, -- tournament_win, record_break, milestone, special_event
  
  -- 実績の詳細
  title TEXT NOT NULL,
  description TEXT,
  achievement_data JSONB NOT NULL DEFAULT '{}',
  
  -- 獲得日
  achieved_date DATE NOT NULL,
  
  -- メタデータ
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- 6. 対戦記録テーブル
-- ========================================
CREATE TABLE IF NOT EXISTS match_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 対戦参加校
  school_id_1 UUID NOT NULL REFERENCES rival_schools(id) ON DELETE CASCADE,
  school_id_2 UUID NOT NULL REFERENCES rival_schools(id) ON DELETE CASCADE,
  
  -- 対戦結果
  winner_id UUID REFERENCES rival_schools(id),
  score JSONB NOT NULL DEFAULT '{}',
  
  -- 対戦の詳細
  match_date DATE NOT NULL,
  match_type VARCHAR(50) NOT NULL, -- friendly, tournament, league
  tournament_id UUID, -- 大会ID（大会戦の場合）
  
  -- 戦術データ
  tactics_used JSONB NOT NULL DEFAULT '{}',
  player_performance JSONB NOT NULL DEFAULT '{}',
  
  -- メタデータ
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- 7. インデックスの作成
-- ========================================

-- 地域特性テーブルのインデックス
CREATE INDEX IF NOT EXISTS idx_regional_characteristics_prefecture ON regional_characteristics(prefecture);
CREATE INDEX IF NOT EXISTS idx_regional_characteristics_region ON regional_characteristics(region);

-- ライバル校テーブルのインデックス
CREATE INDEX IF NOT EXISTS idx_rival_schools_prefecture ON rival_schools(prefecture);
CREATE INDEX IF NOT EXISTS idx_rival_schools_region ON rival_schools(region);
CREATE INDEX IF NOT EXISTS idx_rival_schools_type ON rival_schools(school_type);
CREATE INDEX IF NOT EXISTS idx_rival_schools_rank ON rival_schools(school_rank);
CREATE INDEX IF NOT EXISTS idx_rival_schools_rating ON rival_schools(rating);

-- 成長履歴テーブルのインデックス
CREATE INDEX IF NOT EXISTS idx_school_growth_history_school_id ON school_growth_history(school_id);
CREATE INDEX IF NOT EXISTS idx_school_growth_history_date ON school_growth_history(date);

-- ライバル関係テーブルのインデックス
CREATE INDEX IF NOT EXISTS idx_rivalry_connections_school_1 ON rivalry_connections(school_id_1);
CREATE INDEX IF NOT EXISTS idx_rivalry_connections_school_2 ON rivalry_connections(school_id_2);

-- 実績テーブルのインデックス
CREATE INDEX IF NOT EXISTS idx_school_achievements_school_id ON school_achievements(school_id);
CREATE INDEX IF NOT EXISTS idx_school_achievements_type ON school_achievements(achievement_type);

-- 対戦記録テーブルのインデックス
CREATE INDEX IF NOT EXISTS idx_match_records_school_1 ON match_records(school_id_1);
CREATE INDEX IF NOT EXISTS idx_match_records_school_2 ON match_records(school_id_2);
CREATE INDEX IF NOT EXISTS idx_match_records_date ON match_records(match_date);

-- ========================================
-- 8. RLS（Row Level Security）ポリシーの設定
-- ========================================

-- 地域特性テーブル（読み取り専用）
ALTER TABLE regional_characteristics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to regional characteristics" ON regional_characteristics
  FOR SELECT USING (true);

-- ライバル校テーブル（読み取り専用）
ALTER TABLE rival_schools ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to rival schools" ON rival_schools
  FOR SELECT USING (true);

-- 成長履歴テーブル（読み取り専用）
ALTER TABLE school_growth_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to growth history" ON school_growth_history
  FOR SELECT USING (true);

-- ライバル関係テーブル（読み取り専用）
ALTER TABLE rivalry_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to rivalry connections" ON rivalry_connections
  FOR SELECT USING (true);

-- 実績テーブル（読み取り専用）
ALTER TABLE school_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to achievements" ON school_achievements
  FOR SELECT USING (true);

-- 対戦記録テーブル（読み取り専用）
ALTER TABLE match_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to match records" ON match_records
  FOR SELECT USING (true);

-- ========================================
-- 9. 初期データの挿入（サンプル）
-- ========================================

-- 地域特性のサンプルデータ（北海道）
INSERT INTO regional_characteristics (prefecture, region, climate_data, culture_data, infrastructure_data, signature_pokemon) 
VALUES (
  '北海道',
  '北海道',
  '{"temperature": "cold", "humidity": "low", "seasonal_changes": "extreme"}',
  '{"preferred_types": ["ice", "steel"], "traditional_tactics": "defensive", "training_philosophy": "endurance", "competitive_spirit": "high"}',
  '{"facility_quality": "excellent", "coaching_level": "high", "funding": "generous", "population_density": "low"}',
  '{"primary": "Froslass", "secondary": ["Mamoswine", "Weavile"]}'
) ON CONFLICT (prefecture) DO NOTHING;

-- ライバル校のサンプルデータ（北海道）
INSERT INTO rival_schools (name, prefecture, region, school_type, school_rank, rating, level, philosophy, specialties, weaknesses, tactics_profile, team_composition, ace_pokemon) 
VALUES (
  '北海道氷河学院',
  '北海道',
  '北海道',
  'traditional',
  'S',
  1200,
  5,
  '厳しい環境で鍛えられた不屈の精神',
  ARRAY['ice', 'defense', 'endurance'],
  ARRAY['fire', 'speed'],
  '{"style": "defensive", "focus": "endurance", "adaptability": "high"}',
  '{"formation": "defensive", "strategy": "counter-attack"}',
  '{"species": "Froslass", "level": 50, "moves": ["Blizzard", "Shadow Ball", "Destiny Bond"]}'
) ON CONFLICT DO NOTHING;

-- ========================================
-- 10. 完了メッセージ
-- ========================================
SELECT 'ライバル校システム用データベーススキーマの作成が完了しました。' as message;
