-- playersテーブルにpokemon_statsカラムを追加
-- このカラムは、ポケモンの個体値情報を保存するために使用されます

-- 1. pokemon_statsカラムを追加（JSONB型）
ALTER TABLE public.players 
ADD COLUMN IF NOT EXISTS pokemon_stats JSONB;

-- 2. 既存のレコードに対してデフォルト値を設定
UPDATE public.players 
SET pokemon_stats = NULL 
WHERE pokemon_stats IS NULL;

-- 3. カラムの存在確認
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'players' 
AND column_name = 'pokemon_stats';

-- 4. テーブル構造の確認
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'players' 
ORDER BY ordinal_position;
