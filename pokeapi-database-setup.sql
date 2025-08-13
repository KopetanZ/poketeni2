-- PokeAPI統合 部員ライブラリー拡張 データベースセットアップ
-- 作成日: 2025-01-13
-- 目的: 1,302種のポケモンデータベース化と自動配属システム実装

-- 1. ポケモンマスターデータテーブル作成
CREATE TABLE IF NOT EXISTS pokemon_master_data (
  id SERIAL PRIMARY KEY,
  pokemon_id INTEGER UNIQUE NOT NULL,
  japanese_name TEXT NOT NULL,
  english_name TEXT NOT NULL,
  types TEXT[] NOT NULL,
  base_stats JSONB NOT NULL,          -- 種族値データ
  sprite_urls JSONB NOT NULL,         -- 画像URL集
  rarity_level TEXT NOT NULL DEFAULT 'common', -- common, uncommon, rare, epic, legendary
  generation INTEGER NOT NULL,
  is_recruitable BOOLEAN DEFAULT true, -- 直接配属可能か
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 進化関係テーブル作成
CREATE TABLE IF NOT EXISTS pokemon_evolution_chains (
  id SERIAL PRIMARY KEY,
  pokemon_id INTEGER REFERENCES pokemon_master_data(pokemon_id),
  evolution_stage INTEGER NOT NULL,    -- 1: 基本, 2: 1進化, 3: 2進化
  evolves_from INTEGER REFERENCES pokemon_master_data(pokemon_id),
  evolves_to INTEGER[] DEFAULT '{}',   -- 進化先ID配列
  evolution_conditions JSONB,         -- 進化条件
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. playersテーブル拡張
ALTER TABLE players ADD COLUMN IF NOT EXISTS individual_values JSONB DEFAULT NULL;
ALTER TABLE players ADD COLUMN IF NOT EXISTS evolution_data JSONB DEFAULT NULL;
ALTER TABLE players ADD COLUMN IF NOT EXISTS special_abilities TEXT[] DEFAULT '{}';
ALTER TABLE players ADD COLUMN IF NOT EXISTS rarity_level TEXT DEFAULT 'common';
ALTER TABLE players ADD COLUMN IF NOT EXISTS pokemon_master_id INTEGER REFERENCES pokemon_master_data(pokemon_id);

-- 4. インデックス作成
CREATE INDEX IF NOT EXISTS idx_pokemon_master_recruitable ON pokemon_master_data(is_recruitable);
CREATE INDEX IF NOT EXISTS idx_pokemon_master_rarity ON pokemon_master_data(rarity_level);
CREATE INDEX IF NOT EXISTS idx_evolution_stage ON pokemon_evolution_chains(evolution_stage);
CREATE INDEX IF NOT EXISTS idx_players_rarity ON players(rarity_level);
CREATE INDEX IF NOT EXISTS idx_players_pokemon_master ON players(pokemon_master_id);

-- 5. レアリティ制約（既存の場合はスキップ）
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'check_rarity_level' 
    AND table_name = 'pokemon_master_data'
  ) THEN
    ALTER TABLE pokemon_master_data ADD CONSTRAINT check_rarity_level 
      CHECK (rarity_level IN ('common', 'uncommon', 'rare', 'epic', 'legendary'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'check_player_rarity_level' 
    AND table_name = 'players'
  ) THEN
    ALTER TABLE players ADD CONSTRAINT check_player_rarity_level 
      CHECK (rarity_level IN ('common', 'uncommon', 'rare', 'epic', 'legendary'));
  END IF;
END $$;

-- 6. 進化ステージ制約（既存の場合はスキップ）
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'check_evolution_stage' 
    AND table_name = 'pokemon_evolution_chains'
  ) THEN
    ALTER TABLE pokemon_evolution_chains ADD CONSTRAINT check_evolution_stage 
      CHECK (evolution_stage BETWEEN 1 AND 3);
  END IF;
END $$;

-- 7. サンプルデータ挿入（テスト用）
INSERT INTO pokemon_master_data (pokemon_id, japanese_name, english_name, types, base_stats, sprite_urls, rarity_level, generation, is_recruitable) VALUES
(1, 'フシギダネ', 'bulbasaur', '{"grass","poison"}', '{"hp":45,"attack":49,"defense":49,"sp_attack":65,"sp_defense":65,"speed":45}', '{"default":"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png","official":"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-art/1.png"}', 'rare', 1, true),
(2, 'フシギソウ', 'ivysaur', '{"grass","poison"}', '{"hp":60,"attack":62,"defense":63,"sp_attack":80,"sp_defense":80,"speed":60}', '{"default":"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/2.png","official":"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-art/2.png"}', 'epic', 1, false),
(3, 'フシギバナ', 'venusaur', '{"grass","poison"}', '{"hp":80,"attack":82,"defense":83,"sp_attack":100,"sp_defense":100,"speed":80}', '{"default":"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/3.png","official":"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-art/3.png"}', 'legendary', 1, false),
(4, 'ヒトカゲ', 'charmander', '{"fire"}', '{"hp":39,"attack":52,"defense":43,"sp_attack":60,"sp_defense":50,"speed":65}', '{"default":"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png","official":"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-art/4.png"}', 'rare', 1, true),
(5, 'リザード', 'charmeleon', '{"fire"}', '{"hp":58,"attack":64,"defense":58,"sp_attack":80,"sp_defense":65,"speed":80}', '{"default":"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/5.png","official":"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-art/5.png"}', 'epic', 1, false),
(6, 'リザードン', 'charizard', '{"fire","flying"}', '{"hp":78,"attack":84,"defense":78,"sp_attack":109,"sp_defense":85,"speed":100}', '{"default":"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png","official":"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-art/6.png"}', 'legendary', 1, false),
(7, 'ゼニガメ', 'squirtle', '{"water"}', '{"hp":44,"attack":48,"defense":65,"sp_attack":50,"sp_defense":64,"speed":43}', '{"default":"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png","official":"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-art/7.png"}', 'rare', 1, true),
(8, 'カメール', 'wartortle', '{"water"}', '{"hp":59,"attack":63,"defense":80,"sp_attack":65,"sp_defense":80,"speed":58}', '{"default":"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/8.png","official":"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-art/8.png"}', 'epic', 1, false),
(9, 'カメックス', 'blastoise', '{"water"}', '{"hp":79,"attack":83,"defense":100,"sp_attack":85,"sp_defense":105,"speed":78}', '{"default":"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/9.png","official":"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-art/9.png"}', 'legendary', 1, false),
(25, 'ピカチュウ', 'pikachu', '{"electric"}', '{"hp":35,"attack":55,"defense":40,"sp_attack":50,"sp_defense":50,"speed":90}', '{"default":"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png","official":"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-art/25.png"}', 'epic', 1, true)
ON CONFLICT (pokemon_id) DO NOTHING;

-- 8. 進化関係データ挿入
INSERT INTO pokemon_evolution_chains (pokemon_id, evolution_stage, evolves_from, evolves_to, evolution_conditions) VALUES
(1, 1, NULL, '{2}', '{"level":16}'),
(2, 2, 1, '{3}', '{"level":32}'),
(3, 3, 2, '{}', NULL),
(4, 1, NULL, '{5}', '{"level":16}'),
(5, 2, 4, '{6}', '{"level":36}'),
(6, 3, 5, '{}', NULL),
(7, 1, NULL, '{8}', '{"level":16}'),
(8, 2, 7, '{9}', '{"level":36}'),
(9, 3, 8, '{}', NULL),
(25, 1, NULL, '{26}', '{"item":"thunder-stone"}')
ON CONFLICT DO NOTHING;

-- 9. 既存プレイヤーにポケモンマスターIDを設定（サンプル）
UPDATE players 
SET pokemon_master_id = 1, rarity_level = 'rare'
WHERE pokemon_name = 'フシギダネ' AND pokemon_master_id IS NULL;

-- 10. ビュー作成（配属可能ポケモン一覧）
CREATE OR REPLACE VIEW recruitable_pokemon AS
SELECT 
  pmd.pokemon_id,
  pmd.japanese_name,
  pmd.english_name,
  pmd.types,
  pmd.base_stats,
  pmd.sprite_urls,
  pmd.rarity_level,
  pmd.generation,
  ec.evolution_stage,
  ec.evolves_from,
  ec.evolves_to,
  ec.evolution_conditions
FROM pokemon_master_data pmd
LEFT JOIN pokemon_evolution_chains ec ON pmd.pokemon_id = ec.pokemon_id
WHERE pmd.is_recruitable = true
ORDER BY pmd.pokemon_id;

-- 11. 統計ビュー作成
CREATE OR REPLACE VIEW pokemon_statistics AS
SELECT 
  rarity_level,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM pokemon_master_data), 2) as percentage
FROM pokemon_master_data
GROUP BY rarity_level
ORDER BY 
  CASE rarity_level
    WHEN 'common' THEN 1
    WHEN 'uncommon' THEN 2
    WHEN 'rare' THEN 3
    WHEN 'epic' THEN 4
    WHEN 'legendary' THEN 5
  END;

-- 12. 完了メッセージ
DO $$
BEGIN
  RAISE NOTICE '✅ PokeAPI統合データベースセットアップ完了';
  RAISE NOTICE '📊 作成されたテーブル: pokemon_master_data, pokemon_evolution_chains';
  RAISE NOTICE '🔧 playersテーブル拡張完了';
  RAISE NOTICE '📋 サンプルデータ挿入完了（10種のポケモン）';
  RAISE NOTICE '🎯 次のステップ: PokeAPIから全1,302種のデータを取得・挿入';
END $$;
