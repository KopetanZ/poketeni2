-- playersテーブルに特殊能力と追加データのカラムを追加

-- 特殊能力情報（JSONB形式で保存）
ALTER TABLE players ADD COLUMN IF NOT EXISTS special_abilities JSONB DEFAULT '[]';

-- ポケモン種族情報
ALTER TABLE players ADD COLUMN IF NOT EXISTS types JSONB DEFAULT '["normal"]';

-- 個体値システムデータ（JSONB形式で保存）
ALTER TABLE players ADD COLUMN IF NOT EXISTS pokemon_stats JSONB DEFAULT NULL;

-- 戦績カラムを追加（まだ存在しない場合）
ALTER TABLE players ADD COLUMN IF NOT EXISTS matches_played INTEGER DEFAULT 0;
ALTER TABLE players ADD COLUMN IF NOT EXISTS matches_won INTEGER DEFAULT 0;
ALTER TABLE players ADD COLUMN IF NOT EXISTS sets_won INTEGER DEFAULT 0;
ALTER TABLE players ADD COLUMN IF NOT EXISTS sets_lost INTEGER DEFAULT 0;

-- インデックスを追加（JSONBフィールドの検索性能向上）
CREATE INDEX IF NOT EXISTS idx_players_special_abilities ON players USING GIN (special_abilities);
CREATE INDEX IF NOT EXISTS idx_players_types ON players USING GIN (types);
CREATE INDEX IF NOT EXISTS idx_players_pokemon_stats ON players USING GIN (pokemon_stats);

-- テーブル構造を確認
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'players' 
ORDER BY ordinal_position;