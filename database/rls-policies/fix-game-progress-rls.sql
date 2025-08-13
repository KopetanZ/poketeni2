-- game_progressテーブルのRLSポリシー修正
-- 問題: RLSポリシーが正しく設定されておらず、INSERT/UPDATEが拒否されている

-- 1. 既存のポリシーを削除
DROP POLICY IF EXISTS "game_progress_own_all" ON public.game_progress;
DROP POLICY IF EXISTS "Users can manage their own game progress" ON public.game_progress;

-- 2. 正しいRLSポリシーを作成
-- 認証されたユーザーが自分の学校のgame_progressを管理できるようにする
CREATE POLICY "game_progress_own_all" ON public.game_progress
  FOR ALL 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.schools s 
      WHERE s.id = game_progress.school_id 
      AND s.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.schools s 
      WHERE s.id = game_progress.school_id 
      AND s.user_id = auth.uid()
    )
  );

-- 3. RLSが有効になっていることを確認
ALTER TABLE public.game_progress ENABLE ROW LEVEL SECURITY;

-- 4. ポリシーの確認
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual, 
  with_check
FROM pg_policies 
WHERE tablename = 'game_progress';

-- 5. 現在のRLS設定確認
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'game_progress';
