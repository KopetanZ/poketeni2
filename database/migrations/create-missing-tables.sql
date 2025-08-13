-- 不足しているテーブルの作成
-- game_progressテーブルと連携して動作するテーブル群

-- 1. 日次リセット管理テーブル
CREATE TABLE IF NOT EXISTS public.daily_reset_management (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id TEXT NOT NULL,
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

-- 2. カード使用履歴テーブル
CREATE TABLE IF NOT EXISTS public.card_usage_history (
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

-- 3. マス効果履歴テーブル
CREATE TABLE IF NOT EXISTS public.square_event_history (
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

-- 外部キー制約（schools.idがtext型の場合）- 重複を避けるため条件付きで作成
DO $$ 
BEGIN
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
ALTER TABLE public.daily_reset_management ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_usage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.square_event_history ENABLE ROW LEVEL SECURITY;

-- RLSポリシーを作成（重複を避けるため条件付きで作成）
DO $$ 
BEGIN
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
CREATE INDEX IF NOT EXISTS idx_daily_reset_management_school_id ON public.daily_reset_management(school_id);
CREATE INDEX IF NOT EXISTS idx_card_usage_history_school_id ON public.card_usage_history(school_id);
CREATE INDEX IF NOT EXISTS idx_square_event_history_school_id ON public.square_event_history(school_id);
CREATE INDEX IF NOT EXISTS idx_card_usage_history_used_at ON public.card_usage_history(used_at);
CREATE INDEX IF NOT EXISTS idx_square_event_history_position ON public.square_event_history(square_position);

-- トリガー：updated_at自動更新
CREATE OR REPLACE FUNCTION update_daily_reset_management_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_daily_reset_management_updated_at ON public.daily_reset_management;
CREATE TRIGGER update_daily_reset_management_updated_at 
  BEFORE UPDATE ON public.daily_reset_management 
  FOR EACH ROW EXECUTE FUNCTION update_daily_reset_management_updated_at();

-- テーブル構造確認（各テーブルを個別に確認）
-- daily_reset_managementテーブルの構造確認
SELECT 'daily_reset_management' as table_name, column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'daily_reset_management' 
ORDER BY ordinal_position;

-- card_usage_historyテーブルの構造確認
SELECT 'card_usage_history' as table_name, column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'card_usage_history' 
ORDER BY ordinal_position;

-- square_event_historyテーブルの構造確認
SELECT 'square_event_history' as table_name, column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'square_event_history' 
ORDER BY ordinal_position;
