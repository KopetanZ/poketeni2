-- ゲーム進行管理テーブルの作成
-- カード使用履歴、日次リセット、手札管理などを統合

CREATE TABLE IF NOT EXISTS public.game_progress (
  id TEXT PRIMARY KEY,
  school_id TEXT NOT NULL,
  
  -- ゲーム進行状態
  current_position INTEGER DEFAULT 0, -- すごろくの現在位置
  current_year INTEGER DEFAULT 2024,
  current_month INTEGER DEFAULT 4,
  current_day INTEGER DEFAULT 1,
  
  -- 手札管理
  hand_cards_count INTEGER DEFAULT 0,
  last_daily_reset_year INTEGER DEFAULT 2024,
  last_daily_reset_month INTEGER DEFAULT 4,
  last_daily_reset_day INTEGER DEFAULT 1,
  
  -- カード使用履歴
  cards_used_today INTEGER DEFAULT 0,
  total_cards_used INTEGER DEFAULT 0,
  
  -- 統計情報
  total_moves INTEGER DEFAULT 0,
  total_events_triggered INTEGER DEFAULT 0,
  
  -- タイムスタンプ
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 外部キー制約（schools.idがtext型の場合）
ALTER TABLE public.game_progress 
ADD CONSTRAINT fk_game_progress_school 
FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE;

-- RLSを有効化
ALTER TABLE public.game_progress ENABLE ROW LEVEL SECURITY;

-- RLSポリシーを作成
CREATE POLICY "game_progress_own_all" ON public.game_progress
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.schools s 
      WHERE s.id = game_progress.school_id 
      AND s.user_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.schools s 
      WHERE s.id = game_progress.school_id 
      AND s.user_id = auth.uid()
    )
  );

-- インデックスを作成
CREATE INDEX IF NOT EXISTS idx_game_progress_school_id ON public.game_progress(school_id);
CREATE INDEX IF NOT EXISTS idx_game_progress_date ON public.game_progress(current_year, current_month, current_day);

-- トリガー：updated_at自動更新
CREATE OR REPLACE FUNCTION update_game_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_game_progress_updated_at 
  BEFORE UPDATE ON public.game_progress 
  FOR EACH ROW EXECUTE FUNCTION update_game_progress_updated_at();

-- テーブル構造確認
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'game_progress' 
ORDER BY ordinal_position;
