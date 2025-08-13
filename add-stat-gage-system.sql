-- 栄冠ナイン式ステータスゲージシステム用データベーススキーマ追加
-- このファイルを実行して、ステータスゲージと成長効率のカラムを追加してください

-- プレイヤーテーブルにステータスゲージシステム用カラムを追加
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS stat_gages JSONB DEFAULT '{
  "serve_skill_gage": 0,
  "return_skill_gage": 0,
  "volley_skill_gage": 0,
  "stroke_skill_gage": 0,
  "mental_gage": 0,
  "stamina_gage": 0
}'::jsonb;

-- プレイヤーテーブルに成長効率係数用カラムを追加
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS growth_efficiency JSONB DEFAULT '{
  "serve_skill_efficiency": 0.1,
  "return_skill_efficiency": 0.1,
  "volley_skill_efficiency": 0.05,
  "stroke_skill_efficiency": 0.15,
  "mental_efficiency": 0.2,
  "stamina_efficiency": 0.25
}'::jsonb;

-- 既存のプレイヤーデータに初期値を設定
UPDATE players 
SET 
  stat_gages = '{
    "serve_skill_gage": 0,
    "return_skill_gage": 0,
    "volley_skill_gage": 0,
    "stroke_skill_gage": 0,
    "mental_gage": 0,
    "stamina_gage": 0
  }'::jsonb,
  growth_efficiency = '{
    "serve_skill_efficiency": 0.1,
    "return_skill_efficiency": 0.1,
    "volley_skill_efficiency": 0.05,
    "stroke_skill_efficiency": 0.15,
    "mental_efficiency": 0.2,
    "stamina_efficiency": 0.25
  }'::jsonb
WHERE stat_gages IS NULL OR growth_efficiency IS NULL;

-- インデックスを追加してパフォーマンスを向上
CREATE INDEX IF NOT EXISTS idx_players_stat_gages ON players USING GIN (stat_gages);
CREATE INDEX IF NOT EXISTS idx_players_growth_efficiency ON players USING GIN (growth_efficiency);

-- コメントを追加
COMMENT ON COLUMN players.stat_gages IS '栄冠ナイン式ステータスゲージシステム - 各スキルの成長ゲージ（0-100）';
COMMENT ON COLUMN players.growth_efficiency IS '栄冠ナイン式成長効率係数 - 設備・道具による成長効率の倍率（0.1-2.0）';

-- 確認用クエリ
SELECT 
  id,
  pokemon_name,
  stat_gages,
  growth_efficiency
FROM players 
LIMIT 5;
