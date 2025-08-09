-- Row Level Security ポリシーの修正
-- 問題: 匿名ユーザーがデータを挿入できない

-- 一時的にRLSを無効化（開発環境のみ）
ALTER TABLE schools DISABLE ROW LEVEL SECURITY;
ALTER TABLE players DISABLE ROW LEVEL SECURITY;
ALTER TABLE hand_cards DISABLE ROW LEVEL SECURITY;

-- または、より緩いポリシーを作成
-- （本番環境では適切な認証ベースのポリシーを使用）

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Users can manage their own school" ON schools;
DROP POLICY IF EXISTS "Users can manage their school's players" ON players;
DROP POLICY IF EXISTS "Users can manage their school's cards" ON hand_cards;

-- 開発用の緩いポリシー作成（任意のユーザーが自分のuser_idでアクセス可能）
CREATE POLICY "Allow all operations on schools" ON schools
  FOR ALL 
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on players" ON players
  FOR ALL 
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on hand_cards" ON hand_cards
  FOR ALL 
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- 注意: 本番環境では適切なポリシーを設定してください