-- Row Level Security ポリシーの正しい設定
-- 認証されたユーザーが自分のデータを作成・管理できるようにする

-- 1. 既存のポリシーを削除
DROP POLICY IF EXISTS "Users can manage their own school" ON schools;
DROP POLICY IF EXISTS "Users can manage their school's players" ON players;
DROP POLICY IF EXISTS "Users can manage their school's cards" ON hand_cards;
DROP POLICY IF EXISTS "Allow all operations on schools" ON schools;
DROP POLICY IF EXISTS "Allow all operations on players" ON players;
DROP POLICY IF EXISTS "Allow all operations on hand_cards" ON hand_cards;

-- 2. 正しいRLSポリシーを作成

-- schoolsテーブルのポリシー
CREATE POLICY "Users can manage their own school" ON schools
  FOR ALL 
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- playersテーブルのポリシー
CREATE POLICY "Users can manage their school's players" ON players
  FOR ALL 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM schools 
      WHERE schools.id = players.school_id 
      AND schools.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM schools 
      WHERE schools.id = players.school_id 
      AND schools.user_id = auth.uid()
    )
  );

-- hand_cardsテーブルのポリシー
CREATE POLICY "Users can manage their school's cards" ON hand_cards
  FOR ALL 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM schools 
      WHERE schools.id = hand_cards.school_id 
      AND schools.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM schools 
      WHERE schools.id = hand_cards.school_id 
      AND schools.user_id = auth.uid()
    )
  );

-- 3. RLSが有効になっていることを確認
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE hand_cards ENABLE ROW LEVEL SECURITY;

-- 4. ポリシーの確認
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('schools', 'players', 'hand_cards');
