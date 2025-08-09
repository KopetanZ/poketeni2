-- 完全な外部キー制約とポリシーの修正

-- Step 1: 既存ポリシーをすべて削除
DROP POLICY IF EXISTS "Users can manage their own school" ON schools;
DROP POLICY IF EXISTS "Users can manage their school's players" ON players;
DROP POLICY IF EXISTS "Users can manage their school's cards" ON hand_cards;

-- Step 2: RLSを一時的に無効化
ALTER TABLE schools DISABLE ROW LEVEL SECURITY;
ALTER TABLE players DISABLE ROW LEVEL SECURITY;
ALTER TABLE hand_cards DISABLE ROW LEVEL SECURITY;

-- Step 3: 外部キー制約を削除
ALTER TABLE schools DROP CONSTRAINT IF EXISTS schools_user_id_fkey;
ALTER TABLE players DROP CONSTRAINT IF EXISTS players_school_id_fkey;
ALTER TABLE hand_cards DROP CONSTRAINT IF EXISTS hand_cards_school_id_fkey;

-- Step 4: user_idをtext型に変更
ALTER TABLE schools ALTER COLUMN user_id TYPE text;

-- Step 5: 開発環境用の簡単なポリシーを再作成（オプション）
-- ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all operations" ON schools FOR ALL USING (true) WITH CHECK (true);

-- Step 6: インデックスを再作成（パフォーマンス用）
DROP INDEX IF EXISTS idx_schools_user_id;
CREATE INDEX idx_schools_user_id ON schools(user_id);

-- 確認用：テーブル構造を表示
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'schools' AND column_name = 'user_id';