-- トーナメント・試合システム用データベーススキーマ

-- 大会テーブル
CREATE TABLE IF NOT EXISTS tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  tournament_type TEXT NOT NULL CHECK (tournament_type IN ('practice', 'regional', 'national')),
  description TEXT,
  
  -- 大会期間
  start_date_year INTEGER NOT NULL,
  start_date_month INTEGER NOT NULL,
  start_date_day INTEGER NOT NULL,
  end_date_year INTEGER NOT NULL,
  end_date_month INTEGER NOT NULL,
  end_date_day INTEGER NOT NULL,
  
  -- 大会設定
  max_participants INTEGER DEFAULT 8,
  current_participants INTEGER DEFAULT 0,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
  prize_reputation INTEGER DEFAULT 0,
  prize_funds INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 大会参加テーブル
CREATE TABLE IF NOT EXISTS tournament_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  
  -- 参加情報
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'active', 'eliminated', 'winner')),
  
  -- トーナメント成績
  matches_played INTEGER DEFAULT 0,
  matches_won INTEGER DEFAULT 0,
  sets_won INTEGER DEFAULT 0,
  sets_lost INTEGER DEFAULT 0,
  final_rank INTEGER,
  
  UNIQUE(tournament_id, school_id)
);

-- 試合テーブル
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  
  -- 対戦チーム
  home_school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  away_school_id UUID REFERENCES schools(id) ON DELETE CASCADE, -- NULLの場合はCPU対戦
  
  -- 試合情報
  match_type TEXT NOT NULL CHECK (match_type IN ('practice', 'tournament', 'friendly')),
  round_name TEXT, -- '1回戦', '準決勝', '決勝' など
  
  -- 試合日程
  scheduled_year INTEGER NOT NULL,
  scheduled_month INTEGER NOT NULL,
  scheduled_day INTEGER NOT NULL,
  
  -- 試合結果
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  home_sets_won INTEGER DEFAULT 0,
  away_sets_won INTEGER DEFAULT 0,
  winner_school_id UUID REFERENCES schools(id),
  
  -- 追加情報
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 個別セット結果テーブル
CREATE TABLE IF NOT EXISTS match_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  
  -- セット情報
  set_number INTEGER NOT NULL, -- 1, 2, 3...
  
  -- 出場選手
  home_player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  away_player_id UUID REFERENCES players(id) ON DELETE CASCADE, -- NULLの場合はCPU
  away_cpu_name TEXT, -- CPU選手名
  away_cpu_data JSONB, -- CPU選手データ
  
  -- セット結果
  home_score INTEGER DEFAULT 0,
  away_score INTEGER DEFAULT 0,
  winner TEXT CHECK (winner IN ('home', 'away')),
  
  -- パフォーマンス統計
  home_performance JSONB, -- 各スキルのパフォーマンス記録
  away_performance JSONB,
  
  -- 試合の詳細ログ
  match_log JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CPU対戦相手データ（トーナメント用）
CREATE TABLE IF NOT EXISTS cpu_schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  reputation INTEGER DEFAULT 0,
  region TEXT DEFAULT '全国',
  
  -- 学校の特徴
  school_type TEXT DEFAULT 'normal' CHECK (school_type IN ('normal', 'strong', 'elite', 'legendary')),
  specialty TEXT, -- 'serve', 'volley', 'mental' など
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CPU選手データ
CREATE TABLE IF NOT EXISTS cpu_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cpu_school_id UUID NOT NULL REFERENCES cpu_schools(id) ON DELETE CASCADE,
  
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
  
  -- CPU特有の特徴
  ai_personality TEXT DEFAULT 'balanced' CHECK (ai_personality IN ('aggressive', 'defensive', 'balanced', 'unpredictable')),
  special_ability TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security設定
ALTER TABLE tournaments DISABLE ROW LEVEL SECURITY; -- 全員が閲覧可能
ALTER TABLE tournament_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE cpu_schools DISABLE ROW LEVEL SECURITY; -- 全員が閲覧可能
ALTER TABLE cpu_players DISABLE ROW LEVEL SECURITY; -- 全員が閲覧可能

-- RLSポリシー
CREATE POLICY "Users can manage their tournament participation" ON tournament_participants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM schools 
      WHERE schools.id = tournament_participants.school_id 
      AND schools.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view and manage their matches" ON matches
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM schools 
      WHERE (schools.id = matches.home_school_id OR schools.id = matches.away_school_id)
      AND schools.user_id = auth.uid()
    )
    OR matches.away_school_id IS NULL -- CPU戦は誰でも参照可能
  );

CREATE POLICY "Users can view and manage their match sets" ON match_sets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM matches 
      JOIN schools ON (schools.id = matches.home_school_id OR schools.id = matches.away_school_id)
      WHERE matches.id = match_sets.match_id 
      AND schools.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM matches 
      WHERE matches.id = match_sets.match_id 
      AND matches.away_school_id IS NULL -- CPU戦
    )
  );

-- トリガー設定
CREATE TRIGGER update_tournaments_updated_at 
  BEFORE UPDATE ON tournaments 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at 
  BEFORE UPDATE ON matches 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_tournaments_type_status ON tournaments(tournament_type, status);
CREATE INDEX IF NOT EXISTS idx_tournament_participants_tournament ON tournament_participants(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_participants_school ON tournament_participants(school_id);
CREATE INDEX IF NOT EXISTS idx_matches_tournament ON matches(tournament_id);
CREATE INDEX IF NOT EXISTS idx_matches_schools ON matches(home_school_id, away_school_id);
CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(scheduled_year, scheduled_month, scheduled_day);
CREATE INDEX IF NOT EXISTS idx_match_sets_match ON match_sets(match_id);
CREATE INDEX IF NOT EXISTS idx_cpu_players_school ON cpu_players(cpu_school_id);

-- 初期データ: サンプル大会
INSERT INTO tournaments (name, tournament_type, description, start_date_year, start_date_month, start_date_day, end_date_year, end_date_month, end_date_day, max_participants, prize_reputation, prize_funds) 
VALUES 
('春季地区大会', 'regional', '新学期最初の地区大会。初心者にもおすすめ。', 2024, 5, 1, 2024, 5, 15, 16, 50, 5000),
('夏季全国大会', 'national', '全国の強豪校が集まる夏の大会。優勝すれば全国制覇！', 2024, 7, 20, 2024, 8, 10, 32, 200, 50000),
('秋季練習試合週間', 'practice', '他校との練習試合で実力を試そう。', 2024, 10, 1, 2024, 10, 31, 8, 20, 2000)
ON CONFLICT DO NOTHING;

-- 初期データ: CPU学校
INSERT INTO cpu_schools (name, reputation, school_type, specialty) 
VALUES 
('青空高校', 30, 'normal', 'serve'),
('雷鳴学園', 60, 'strong', 'volley'),
('炎熱高等学校', 45, 'normal', 'mental'),
('氷結アカデミー', 80, 'elite', 'return'),
('森林高校', 25, 'normal', 'stamina'),
('海洋学園', 90, 'elite', 'stroke'),
('山岳高等学校', 70, 'strong', 'mental'),
('全国王者学院', 150, 'legendary', 'all')
ON CONFLICT DO NOTHING;