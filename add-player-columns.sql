-- playersテーブルに不足しているカラムを追加

-- 戦績カラムを追加
ALTER TABLE players ADD COLUMN IF NOT EXISTS matches_played INTEGER DEFAULT 0;
ALTER TABLE players ADD COLUMN IF NOT EXISTS matches_won INTEGER DEFAULT 0;
ALTER TABLE players ADD COLUMN IF NOT EXISTS sets_won INTEGER DEFAULT 0;
ALTER TABLE players ADD COLUMN IF NOT EXISTS sets_lost INTEGER DEFAULT 0;

-- テーブル構造を確認
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'players' 
ORDER BY ordinal_position;