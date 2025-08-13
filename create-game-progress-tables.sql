-- 不足しているテーブルの作成
-- game_progressテーブルと連携して動作するテーブル群

-- 既存のテーブルを削除（存在する場合）
DROP TABLE IF EXISTS public.square_event_history CASCADE;
DROP TABLE IF EXISTS public.card_usage_history CASCADE;
DROP TABLE IF EXISTS public.daily_reset_management CASCADE;
DROP TABLE IF EXISTS public.game_progress CASCADE;

-- 1. ゲーム進行状況テーブル
CREATE TABLE public.game_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id TEXT NOT NULL UNIQUE,
  current_position INTEGER DEFAULT 0,
  total_progress INTEGER DEFAULT 0,
  hand_cards_count INTEGER DEFAULT 5,
  max_hand_size INTEGER DEFAULT 5,
  last_save_date TIMESTAMPTZ DEFAULT NOW(),
  game_version TEXT DEFAULT '1.0.0',
  total_cards_used INTEGER DEFAULT 0,
  total_events_triggered INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 日次リセット管理テーブル
CREATE TABLE public.daily_reset_management (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id TEXT NOT NULL UNIQUE,
  last_reset_date_year INTEGER NOT NULL DEFAULT 2024,
  last_reset_date_month INTEGER NOT NULL DEFAULT 4,
  last_reset_date_day INTEGER NOT NULL DEFAULT 1,
  daily_cards_generated BOOLEAN NOT NULL DEFAULT FALSE,
  cards_generated_count INTEGER NOT NULL DEFAULT 0,
  next_reset_date_year INTEGER NOT NULL DEFAULT 2024,
  next_reset_date_month INTEGER NOT NULL DEFAULT 4,
  next_reset_date_day INTEGER NOT NULL DEFAULT 2,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. カード使用履歴テーブル
CREATE TABLE public.card_usage_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id TEXT NOT NULL,
  player_id TEXT,
  card_id TEXT NOT NULL,
  card_name TEXT NOT NULL,
  card_category TEXT NOT NULL,
  used_at TIMESTAMPTZ DEFAULT NOW(),
  used_position INTEGER NOT NULL DEFAULT 0,
  effects_applied JSONB,
  success BOOLEAN NOT NULL DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. マス効果履歴テーブル
CREATE TABLE public.square_event_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id TEXT NOT NULL,
  square_position INTEGER NOT NULL DEFAULT 0,
  square_type TEXT NOT NULL,
  event_name TEXT,
  event_description TEXT,
  event_effects JSONB,
  occurred_at TIMESTAMPTZ DEFAULT NOW(),
  game_date_year INTEGER NOT NULL DEFAULT 2024,
  game_date_month INTEGER NOT NULL DEFAULT 4,
  game_date_day INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 外部キー制約（schools.idがtext型の場合）
DO $$ 
BEGIN
  -- game_progressの外部キー制約
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_game_progress_school' 
    AND table_name = 'game_progress'
  ) THEN
    ALTER TABLE public.game_progress 
    ADD CONSTRAINT fk_game_progress_school 
    FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE;
  END IF;

  -- daily_reset_managementの外部キー制約
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_daily_reset_management_school' 
    AND table_name = 'daily_reset_management'
  ) THEN
    ALTER TABLE public.daily_reset_management 
    ADD CONSTRAINT fk_daily_reset_management_school 
    FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE;
  END IF;

  -- card_usage_historyの外部キー制約
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_card_usage_history_school' 
    AND table_name = 'card_usage_history'
  ) THEN
    ALTER TABLE public.card_usage_history 
    ADD CONSTRAINT fk_card_usage_history_school 
    FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE;
  END IF;

  -- square_event_historyの外部キー制約
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_square_event_history_school' 
    AND table_name = 'square_event_history'
  ) THEN
    ALTER TABLE public.square_event_history 
    ADD CONSTRAINT fk_square_event_history_school 
    FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE;
  END IF;
END $$;

-- RLSを有効化
ALTER TABLE public.game_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_reset_management ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_usage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.square_event_history ENABLE ROW LEVEL SECURITY;

-- RLSポリシーを作成
DO $$ 
BEGIN
  -- game_progressのRLSポリシー
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'game_progress' 
    AND policyname = 'game_progress_own_all'
  ) THEN
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
  END IF;

  -- daily_reset_managementのRLSポリシー
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'daily_reset_management' 
    AND policyname = 'daily_reset_management_own_all'
  ) THEN
    CREATE POLICY "daily_reset_management_own_all" ON public.daily_reset_management
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM public.schools s 
          WHERE s.id = daily_reset_management.school_id 
          AND s.user_id = auth.uid()
        )
      ) WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.schools s 
          WHERE s.id = daily_reset_management.school_id 
          AND s.user_id = auth.uid()
        )
      );
  END IF;

  -- card_usage_historyのRLSポリシー
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'card_usage_history' 
    AND policyname = 'card_usage_history_own_all'
  ) THEN
    CREATE POLICY "card_usage_history_own_all" ON public.card_usage_history
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM public.schools s 
          WHERE s.id = card_usage_history.school_id 
          AND s.user_id = auth.uid()
        )
      ) WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.schools s 
          WHERE s.id = card_usage_history.school_id 
          AND s.user_id = auth.uid()
        )
      );
  END IF;

  -- square_event_historyのRLSポリシー
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'square_event_history' 
    AND policyname = 'square_event_history_own_all'
  ) THEN
    CREATE POLICY "square_event_history_own_all" ON public.square_event_history
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM public.schools s 
          WHERE s.id = square_event_history.school_id 
          AND s.user_id = auth.uid()
        )
      ) WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.schools s 
          WHERE s.id = square_event_history.school_id 
          AND s.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- インデックスを作成
CREATE INDEX idx_game_progress_school_id ON public.game_progress(school_id);
CREATE INDEX idx_daily_reset_management_school_id ON public.daily_reset_management(school_id);
CREATE INDEX idx_card_usage_history_school_id ON public.card_usage_history(school_id);
CREATE INDEX idx_square_event_history_school_id ON public.square_event_history(school_id);
CREATE INDEX idx_card_usage_history_used_at ON public.card_usage_history(used_at);
CREATE INDEX idx_square_event_history_position ON public.square_event_history(square_position);

-- トリガー：updated_at自動更新
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- game_progressのトリガー
CREATE TRIGGER update_game_progress_updated_at 
  BEFORE UPDATE ON public.game_progress 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- daily_reset_managementのトリガー
CREATE TRIGGER update_daily_reset_management_updated_at 
  BEFORE UPDATE ON public.daily_reset_management 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 既存の学校に対して初期データを作成
DO $$
DECLARE
  school_record RECORD;
BEGIN
  FOR school_record IN SELECT id FROM public.schools LOOP
    -- game_progressの初期化
    INSERT INTO public.game_progress (school_id, current_position, total_progress, hand_cards_count, max_hand_size)
    VALUES (school_record.id, 0, 0, 5, 5);
    
    -- daily_reset_managementの初期化
    INSERT INTO public.daily_reset_management (
      school_id, 
      last_reset_date_year, last_reset_date_month, last_reset_date_day,
      next_reset_date_year, next_reset_date_month, next_reset_date_day
    )
    VALUES (school_record.id, 2024, 4, 1, 2024, 4, 2);
  END LOOP;
END $$;

-- 確認用クエリ
SELECT 'Tables created successfully' as status;
