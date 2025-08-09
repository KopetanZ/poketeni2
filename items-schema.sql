-- アイテム・装備システム用データベーススキーマ

-- プレイヤーインベントリテーブル
CREATE TABLE IF NOT EXISTS player_inventories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  
  -- 戦績ポイント（栄冠ナイン式）
  victory_points INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- アイテム所持テーブル
CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_id UUID NOT NULL REFERENCES player_inventories(id) ON DELETE CASCADE,
  
  -- アイテム情報
  item_id TEXT NOT NULL, -- items-database.tsのID
  item_data JSONB NOT NULL, -- アイテムの完全なデータ
  quantity INTEGER DEFAULT 1,
  
  -- 装備品固有
  current_durability INTEGER, -- 現在の耐久値
  is_equipped BOOLEAN DEFAULT FALSE,
  equipped_to_player_id UUID REFERENCES players(id),
  
  -- 施設固有
  facility_level INTEGER DEFAULT 1,
  facility_installation_date TIMESTAMPTZ,
  last_maintenance_date TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- プレイヤー装備テーブル
CREATE TABLE IF NOT EXISTS player_equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  
  -- 装備スロット
  racket_item_id UUID REFERENCES inventory_items(id),
  shoes_item_id UUID REFERENCES inventory_items(id),
  accessory_item_id UUID REFERENCES inventory_items(id),
  pokemon_item_id UUID REFERENCES inventory_items(id),
  
  -- 装備ボーナス（計算済み）
  total_serve_bonus INTEGER DEFAULT 0,
  total_return_bonus INTEGER DEFAULT 0,
  total_volley_bonus INTEGER DEFAULT 0,
  total_stroke_bonus INTEGER DEFAULT 0,
  total_mental_bonus INTEGER DEFAULT 0,
  total_stamina_bonus INTEGER DEFAULT 0,
  experience_boost_percentage INTEGER DEFAULT 0,
  
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- コート施設テーブル（栄冠ナイン式グラウンドレベル）
CREATE TABLE IF NOT EXISTS court_facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  
  -- 基本施設情報
  court_level INTEGER DEFAULT 1,
  court_surface TEXT DEFAULT 'hard' CHECK (court_surface IN ('clay', 'hard', 'grass', 'indoor')),
  overall_training_efficiency INTEGER DEFAULT 100, -- パーセンテージ
  
  -- 設置済み施設
  installed_facilities JSONB DEFAULT '{}', -- facility_id -> facility_data のマッピング
  
  -- メンテナンス
  last_maintenance_year INTEGER DEFAULT 2024,
  last_maintenance_month INTEGER DEFAULT 4,
  last_maintenance_day INTEGER DEFAULT 1,
  maintenance_cost_per_day INTEGER DEFAULT 100,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- アイテム使用ログテーブル
CREATE TABLE IF NOT EXISTS item_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  
  -- 使用情報
  item_id TEXT NOT NULL,
  item_name TEXT NOT NULL,
  usage_type TEXT NOT NULL CHECK (usage_type IN ('equip', 'consume', 'install', 'upgrade', 'repair')),
  
  -- 対象
  target_type TEXT CHECK (target_type IN ('player', 'facility', 'school')),
  target_id UUID,
  
  -- 効果
  effects_applied JSONB,
  success BOOLEAN DEFAULT TRUE,
  
  -- 使用日時
  usage_year INTEGER NOT NULL,
  usage_month INTEGER NOT NULL,
  usage_day INTEGER NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ショップ訪問履歴テーブル
CREATE TABLE IF NOT EXISTS shop_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  
  -- 訪問情報
  visit_type TEXT DEFAULT 'victory_triggered' CHECK (visit_type IN ('victory_triggered', 'manual_summon', 'scheduled')),
  victories_since_last_visit INTEGER DEFAULT 0,
  
  -- 購入履歴
  items_purchased JSONB DEFAULT '[]',
  total_points_spent INTEGER DEFAULT 0,
  
  -- 訪問日
  visit_year INTEGER NOT NULL,
  visit_month INTEGER NOT NULL,
  visit_day INTEGER NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security設定
ALTER TABLE player_inventories DISABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE player_equipment DISABLE ROW LEVEL SECURITY;
ALTER TABLE court_facilities DISABLE ROW LEVEL SECURITY;
ALTER TABLE item_usage_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE shop_visits DISABLE ROW LEVEL SECURITY;

-- トリガー設定（updated_at自動更新）
CREATE TRIGGER update_player_inventories_updated_at 
  BEFORE UPDATE ON player_inventories 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_items_updated_at 
  BEFORE UPDATE ON inventory_items 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_player_equipment_updated_at 
  BEFORE UPDATE ON player_equipment 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_court_facilities_updated_at 
  BEFORE UPDATE ON court_facilities 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_player_inventories_school ON player_inventories(school_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_inventory ON inventory_items(inventory_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_equipped ON inventory_items(is_equipped, equipped_to_player_id) WHERE is_equipped = TRUE;
CREATE INDEX IF NOT EXISTS idx_player_equipment_player ON player_equipment(player_id);
CREATE INDEX IF NOT EXISTS idx_court_facilities_school ON court_facilities(school_id);
CREATE INDEX IF NOT EXISTS idx_item_usage_logs_school ON item_usage_logs(school_id);
CREATE INDEX IF NOT EXISTS idx_item_usage_logs_date ON item_usage_logs(usage_year, usage_month, usage_day);
CREATE INDEX IF NOT EXISTS idx_shop_visits_school ON shop_visits(school_id);

-- 初期データ: 各学校にインベントリとコート施設を作成するための関数
CREATE OR REPLACE FUNCTION initialize_school_facilities(school_uuid UUID)
RETURNS VOID AS $$
BEGIN
  -- プレイヤーインベントリを作成
  INSERT INTO player_inventories (school_id, victory_points) 
  VALUES (school_uuid, 1000) -- 初期ポイント
  ON CONFLICT DO NOTHING;
  
  -- コート施設を作成
  INSERT INTO court_facilities (school_id, court_level, overall_training_efficiency) 
  VALUES (school_uuid, 1, 100)
  ON CONFLICT DO NOTHING;
  
  -- 各選手に装備テーブルを作成
  INSERT INTO player_equipment (player_id)
  SELECT id FROM players WHERE school_id = school_uuid
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- 既存の学校に対して初期化を実行
-- この部分は実際の運用時にはコメントアウト
-- SELECT initialize_school_facilities(id) FROM schools;