-- game_progressテーブルに不足しているカラムを追加

-- 1. cards_used_todayカラムを追加
ALTER TABLE public.game_progress 
ADD COLUMN IF NOT EXISTS cards_used_today INTEGER DEFAULT 0;

-- 2. total_movesカラムを追加
ALTER TABLE public.game_progress 
ADD COLUMN IF NOT EXISTS total_moves INTEGER DEFAULT 0;

-- 3. その他の不足している可能性のあるカラムを追加
ALTER TABLE public.game_progress 
ADD COLUMN IF NOT EXISTS current_game_date_year INTEGER DEFAULT 2024;

ALTER TABLE public.game_progress 
ADD COLUMN IF NOT EXISTS current_game_date_month INTEGER DEFAULT 4;

ALTER TABLE public.game_progress 
ADD COLUMN IF NOT EXISTS current_game_date_day INTEGER DEFAULT 1;

ALTER TABLE public.game_progress 
ADD COLUMN IF NOT EXISTS last_game_date_year INTEGER DEFAULT 2024;

ALTER TABLE public.game_progress 
ADD COLUMN IF NOT EXISTS last_game_date_month INTEGER DEFAULT 4;

ALTER TABLE public.game_progress 
ADD COLUMN IF NOT EXISTS last_game_date_day INTEGER DEFAULT 1;

ALTER TABLE public.game_progress 
ADD COLUMN IF NOT EXISTS total_days_played INTEGER DEFAULT 0;

ALTER TABLE public.game_progress 
ADD COLUMN IF NOT EXISTS consecutive_days_played INTEGER DEFAULT 0;

ALTER TABLE public.game_progress 
ADD COLUMN IF NOT EXISTS last_play_date TIMESTAMPTZ DEFAULT NOW();

-- 4. 既存のレコードの値を更新
UPDATE public.game_progress 
SET 
  cards_used_today = 0,
  total_moves = 0,
  current_game_date_year = 2024,
  current_game_date_month = 4,
  current_game_date_day = 1,
  last_game_date_year = 2024,
  last_game_date_month = 4,
  last_game_date_day = 1,
  total_days_played = 0,
  consecutive_days_played = 0,
  last_play_date = NOW()
WHERE cards_used_today IS NULL 
   OR total_moves IS NULL 
   OR current_game_date_year IS NULL;

-- 5. 確認用クエリ
SELECT 
  'game_progress columns updated successfully' as status,
  COUNT(*) as record_count
FROM public.game_progress;
