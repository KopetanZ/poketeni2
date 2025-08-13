-- 栄冠ナイン式ステータスゲージシステム用データベーススキーマ追加
-- このファイルを実行して、ステータスゲージと成長効率のカラムを追加してください

-- プレイヤーテーブルにステータスゲージシステム用カラムを追加
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS stat_gages JSONB DEFAULT '{
  "serve_skill_gage": 0,
  "return_skill_gage": 0,
  "volley_skill_gage": 0,
  "stroke_skill_gage": 0,
  "mental_gage": 0,
  "stamina_gage": 0
}'::jsonb;

-- プレイヤーテーブルに成長効率係数用カラムを追加
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS growth_efficiency JSONB DEFAULT '{
  "serve_skill_efficiency": 0.1,
  "return_skill_efficiency": 0.1,
  "volley_skill_efficiency": 0.05,
  "stroke_skill_efficiency": 0.15,
  "mental_efficiency": 0.2,
  "stamina_efficiency": 0.25
}'::jsonb;

-- 拡張特殊能力システム用のカラムを追加
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS special_abilities_detailed JSONB DEFAULT '{}'::jsonb;

-- 既存のプレイヤーデータに初期値を設定
UPDATE players 
SET 
  stat_gages = '{
    "serve_skill_gage": 0,
    "return_skill_gage": 0,
    "volley_skill_gage": 0,
    "stroke_skill_gage": 0,
    "mental_gage": 0,
    "stamina_gage": 0
  }'::jsonb,
  growth_efficiency = '{
    "serve_skill_efficiency": 0.1,
    "return_skill_efficiency": 0.1,
    "volley_skill_efficiency": 0.05,
    "stroke_skill_efficiency": 0.15,
    "mental_efficiency": 0.2,
    "stamina_efficiency": 0.25
  }'::jsonb,
  special_abilities_detailed = COALESCE(special_abilities, '{}'::jsonb)
WHERE stat_gages IS NULL OR growth_efficiency IS NULL OR special_abilities_detailed IS NULL;

-- 拡張特殊能力システム用の新しいテーブルを作成

-- 特殊能力マスターテーブル
CREATE TABLE IF NOT EXISTS special_abilities_master (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  english_name TEXT NOT NULL,
  category TEXT NOT NULL, -- serve, return, volley, stroke, mental, physical, situational
  color TEXT NOT NULL,    -- diamond, gold, blue, green, purple, orange, gray, red
  rank TEXT NOT NULL,     -- SS+, SS, S+, S, A+, A, B+, B, C, D
  description TEXT NOT NULL,
  
  -- 効果データ（JSONB）
  effects JSONB NOT NULL,
  
  -- 取得条件
  acquisition_requirements JSONB,
  acquisition_methods JSONB,
  
  -- バランス調整用
  power_level INTEGER DEFAULT 100,
  rarity_weight DECIMAL(5,3) DEFAULT 1.000,
  
  -- UI表示用
  icon_path TEXT,
  color_code TEXT,
  display_order INTEGER DEFAULT 0,
  
  -- メタデータ
  version TEXT DEFAULT '1.0',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 特殊能力組み合わせテーブル
CREATE TABLE IF NOT EXISTS ability_combinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  combination_name TEXT NOT NULL,
  required_abilities TEXT[] NOT NULL,
  result_ability_id TEXT REFERENCES special_abilities_master(id),
  success_rate DECIMAL(5,2) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 特殊能力習得履歴テーブル（playersテーブルのid型に合わせて修正）
CREATE TABLE IF NOT EXISTS ability_acquisition_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id TEXT REFERENCES players(id), -- playersテーブルのid型（TEXT）に合わせて修正
  ability_id TEXT REFERENCES special_abilities_master(id),
  acquisition_method TEXT NOT NULL,
  acquisition_date DATE NOT NULL,
  success_rate_used DECIMAL(5,2),
  was_combination BOOLEAN DEFAULT false,
  combination_id UUID REFERENCES ability_combinations(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックスを追加してパフォーマンスを向上
CREATE INDEX IF NOT EXISTS idx_players_stat_gages ON players USING GIN (stat_gages);
CREATE INDEX IF NOT EXISTS idx_players_growth_efficiency ON players USING GIN (growth_efficiency);
CREATE INDEX IF NOT EXISTS idx_players_special_abilities_detailed ON players USING GIN (special_abilities_detailed);

-- 特殊能力システム用のインデックス
CREATE INDEX IF NOT EXISTS idx_special_abilities_category ON special_abilities_master(category);
CREATE INDEX IF NOT EXISTS idx_special_abilities_color ON special_abilities_master(color);
CREATE INDEX IF NOT EXISTS idx_special_abilities_rank ON special_abilities_master(rank);
CREATE INDEX IF NOT EXISTS idx_special_abilities_active ON special_abilities_master(is_active);
CREATE INDEX IF NOT EXISTS idx_special_abilities_category_color ON special_abilities_master(category, color);
CREATE INDEX IF NOT EXISTS idx_special_abilities_rank_rarity ON special_abilities_master(rank, rarity_weight);
CREATE INDEX IF NOT EXISTS idx_ability_effects_gin ON special_abilities_master USING GIN (effects);

-- 履歴テーブル用のインデックス
CREATE INDEX IF NOT EXISTS idx_ability_acquisition_player_id ON ability_acquisition_history(player_id);
CREATE INDEX IF NOT EXISTS idx_ability_acquisition_ability_id ON ability_acquisition_history(ability_id);
CREATE INDEX IF NOT EXISTS idx_ability_acquisition_date ON ability_acquisition_history(acquisition_date);

-- コメントを追加
COMMENT ON COLUMN players.stat_gages IS '栄冠ナイン式ステータスゲージシステム - 各スキルの成長ゲージ（0-100）';
COMMENT ON COLUMN players.growth_efficiency IS '栄冠ナイン式成長効率係数 - 設備・道具による成長効率の倍率（0.1-2.0）';
COMMENT ON COLUMN players.special_abilities_detailed IS '拡張特殊能力システム - 詳細な特殊能力データ（JSONB形式）';

-- 確認用クエリ
SELECT 
  id,
  pokemon_name,
  stat_gages,
  growth_efficiency,
  special_abilities_detailed
FROM players 
LIMIT 5;

-- ゲーム進行状況とセーブ機能のためのテーブル追加

-- ゲーム進行状況テーブル（すごろくの位置、カードの状態などを保存）
CREATE TABLE IF NOT EXISTS game_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  
  -- すごろく進行状況
  current_position INTEGER DEFAULT 0, -- 現在のマス位置（0-23）
  total_progress INTEGER DEFAULT 0,   -- 累計進行マス数
  
  -- 手札の状態
  hand_cards_count INTEGER DEFAULT 5, -- 現在の手札枚数
  max_hand_size INTEGER DEFAULT 5,    -- 最大手札サイズ
  
  -- ゲーム状態
  last_save_date TIMESTAMPTZ DEFAULT NOW(),
  game_version TEXT DEFAULT '1.0.0',
  
  -- 統計情報
  total_cards_used INTEGER DEFAULT 0,
  total_events_triggered INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- カード使用履歴テーブル（どのカードをいつ使ったかを記録）
CREATE TABLE IF NOT EXISTS card_usage_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  player_id TEXT REFERENCES players(id),
  
  -- カード情報
  card_id TEXT NOT NULL,
  card_name TEXT NOT NULL,
  card_category TEXT NOT NULL,
  
  -- 使用情報
  used_at TIMESTAMPTZ DEFAULT NOW(),
  used_position INTEGER NOT NULL, -- 使用時のすごろく位置
  effects_applied JSONB, -- 適用された効果
  
  -- 結果
  success BOOLEAN DEFAULT true,
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- すごろくマス効果履歴テーブル（各マスで何が起こったかを記録）
CREATE TABLE IF NOT EXISTS square_event_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  
  -- マス情報
  square_position INTEGER NOT NULL, -- マス位置（0-23）
  square_type TEXT NOT NULL, -- マスタイプ（good, bad, normal等）
  
  -- イベント情報
  event_name TEXT,
  event_description TEXT,
  event_effects JSONB, -- 発生した効果
  
  -- 発生情報
  occurred_at TIMESTAMPTZ DEFAULT NOW(),
  game_date_year INTEGER NOT NULL,
  game_date_month INTEGER NOT NULL,
  game_date_day INTEGER NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 日次リセット管理テーブル（カードの日次生成を管理）
CREATE TABLE IF NOT EXISTS daily_reset_management (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  
  -- リセット情報
  last_reset_date_year INTEGER NOT NULL,
  last_reset_date_month INTEGER NOT NULL,
  last_reset_date_day INTEGER NOT NULL,
  
  -- カード生成状態
  daily_cards_generated BOOLEAN DEFAULT false,
  cards_generated_count INTEGER DEFAULT 0,
  
  -- 次回リセット予定
  next_reset_date_year INTEGER NOT NULL,
  next_reset_date_month INTEGER NOT NULL,
  next_reset_date_day INTEGER NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス作成（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_game_progress_school_id ON game_progress(school_id);
CREATE INDEX IF NOT EXISTS idx_card_usage_history_school_id ON card_usage_history(school_id);
CREATE INDEX IF NOT EXISTS idx_square_event_history_school_id ON square_event_history(school_id);
CREATE INDEX IF NOT EXISTS idx_daily_reset_management_school_id ON daily_reset_management(school_id);

-- 外部キー制約
ALTER TABLE game_progress ADD CONSTRAINT fk_game_progress_school 
  FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE;

ALTER TABLE card_usage_history ADD CONSTRAINT fk_card_usage_history_school 
  FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE;

ALTER TABLE card_usage_history ADD CONSTRAINT fk_card_usage_history_player 
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE SET NULL;

ALTER TABLE square_event_history ADD CONSTRAINT fk_square_event_history_school 
  FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE;

ALTER TABLE daily_reset_management ADD CONSTRAINT fk_daily_reset_management_school 
  FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE;

-- RLSポリシー設定
ALTER TABLE game_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_usage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE square_event_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reset_management ENABLE ROW LEVEL SECURITY;

-- ゲーム進行状況のポリシー
CREATE POLICY "Users can manage their own game progress" ON game_progress
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM schools 
      WHERE schools.id = game_progress.school_id 
      AND schools.user_id = auth.uid()
    )
  );

-- カード使用履歴のポリシー
CREATE POLICY "Users can manage their own card usage history" ON card_usage_history
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM schools 
      WHERE schools.id = card_usage_history.school_id 
      AND schools.user_id = auth.uid()
    )
  );

-- マス効果履歴のポリシー
CREATE POLICY "Users can manage their own square event history" ON square_event_history
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM schools 
      WHERE schools.id = square_event_history.school_id 
      AND schools.user_id = auth.uid()
    )
  );

-- 日次リセット管理のポリシー
CREATE POLICY "Users can manage their own daily reset management" ON daily_reset_management
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM schools 
      WHERE schools.id = daily_reset_management.school_id 
      AND schools.user_id = auth.uid()
    )
  );

-- トリガー：updated_at自動更新
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_game_progress_updated_at 
  BEFORE UPDATE ON game_progress 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_reset_management_updated_at 
  BEFORE UPDATE ON daily_reset_management 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 初期データ挿入用の関数
CREATE OR REPLACE FUNCTION initialize_game_progress_for_school(school_id_param TEXT)
RETURNS VOID AS $$
BEGIN
  -- ゲーム進行状況の初期化
  INSERT INTO game_progress (school_id, current_position, total_progress, hand_cards_count, max_hand_size)
  VALUES (school_id_param, 0, 0, 5, 5)
  ON CONFLICT (school_id) DO NOTHING;
  
  -- 日次リセット管理の初期化
  INSERT INTO daily_reset_management (
    school_id, 
    last_reset_date_year, last_reset_date_month, last_reset_date_day,
    next_reset_date_year, next_reset_date_month, next_reset_date_day
  )
  VALUES (school_id_param, 2024, 4, 1, 2024, 4, 2)
  ON CONFLICT (school_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- 既存の学校に対して初期化を実行
SELECT initialize_game_progress_for_school(id) FROM schools;

-- 確認用クエリ
SELECT 
  'game_progress' as table_name,
  COUNT(*) as record_count
FROM game_progress
UNION ALL
SELECT 
  'daily_reset_management' as table_name,
  COUNT(*) as record_count
FROM daily_reset_management;
