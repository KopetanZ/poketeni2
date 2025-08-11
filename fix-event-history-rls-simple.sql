-- event_historyテーブルのRLSポリシーを修正
-- このSQLをSupabaseダッシュボードのSQL Editorで実行してください

-- 1. 既存のRLSポリシーを削除
drop policy if exists "event_history_own_all" on public.event_history;

-- 2. 新しいRLSポリシーを作成
-- 読み取り権限：自分の学校のイベント履歴のみ
create policy "event_history_select_policy" on public.event_history
  for select using (
    exists (
      select 1 from public.schools s
      where s.id = event_history.school_id 
      and s.user_id = auth.uid()
    )
  );

-- 挿入権限：自分の学校のイベント履歴のみ
create policy "event_history_insert_policy" on public.event_history
  for insert with check (
    exists (
      select 1 from public.schools s
      where s.id = event_history.school_id 
      and s.user_id = auth.uid()
    )
  );

-- 更新権限：自分の学校のイベント履歴のみ
create policy "event_history_update_policy" on public.event_history
  for update using (
    exists (
      select 1 from public.schools s
      where s.id = event_history.school_id 
      and s.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.schools s
      where s.id = event_history.school_id 
      and s.user_id = auth.uid()
    )
  );

-- 削除権限：自分の学校のイベント履歴のみ
create policy "event_history_delete_policy" on public.event_history
  for delete using (
    exists (
      select 1 from public.schools s
      where s.id = event_history.school_id 
      and s.user_id = auth.uid()
    )
  );

-- 3. ポリシーが正しく作成されたか確認
select 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
from pg_policies 
where tablename = 'event_history'
order by policyname;
