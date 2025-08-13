-- ポケテニマスター データベーススキーマ
-- 日付同期問題を解決するためのシンプルな構造

-- 学校テーブル（単一の日付管理）
CREATE TABLE IF NOT EXISTS schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL DEFAULT '未設定高校',
  reputation INTEGER DEFAULT 0,
  funds INTEGER DEFAULT 1000,
  
  -- 統一日付管理（最重要）
  current_year INTEGER DEFAULT 2024,
  current_month INTEGER DEFAULT 4,
  current_day INTEGER DEFAULT 1,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ポケモン選手テーブル
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  
  -- ポケモン基本情報
  pokemon_name TEXT NOT NULL,
  pokemon_id INTEGER NOT NULL,
  level INTEGER DEFAULT 1,
  grade INTEGER DEFAULT 1 CHECK (grade IN (1, 2, 3)),
  position TEXT DEFAULT 'member' CHECK (position IN ('captain', 'vice_captain', 'regular', 'member')),
  
  -- テニススキル
  serve_skill INTEGER DEFAULT 10,
  return_skill INTEGER DEFAULT 10,
  volley_skill INTEGER DEFAULT 10,
  stroke_skill INTEGER DEFAULT 10,
  mental INTEGER DEFAULT 10,
  stamina INTEGER DEFAULT 10,
  
  -- 状態
  condition TEXT DEFAULT 'normal' CHECK (condition IN ('excellent', 'good', 'normal', 'poor', 'terrible')),
  motivation INTEGER DEFAULT 50,
  experience INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 手札テーブル
CREATE TABLE IF NOT EXISTS hand_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  card_data JSONB NOT NULL, -- カード情報をJSONで保存
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) 設定
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE hand_cards ENABLE ROW LEVEL SECURITY;

-- RLSポリシー設定
CREATE POLICY "Users can manage their own school" ON schools
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their school's players" ON players
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM schools 
      WHERE schools.id = players.school_id 
      AND schools.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their school's cards" ON hand_cards
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM schools 
      WHERE schools.id = hand_cards.school_id 
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

CREATE TRIGGER update_schools_updated_at 
  BEFORE UPDATE ON schools 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_players_updated_at 
  BEFORE UPDATE ON players 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_schools_user_id ON schools(user_id);
CREATE INDEX IF NOT EXISTS idx_players_school_id ON players(school_id);
CREATE INDEX IF NOT EXISTS idx_hand_cards_school_id ON hand_cards(school_id);