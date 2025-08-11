-- イベント履歴テーブル（自動発火したイベントを保存）

create table if not exists public.event_history (
  id uuid primary key default gen_random_uuid(),
  school_id text not null, -- schools.idがtext型のため
  event_type text not null check (event_type in ('seasonal','hidden','square_effect','card_effect')),
  event_id text not null,
  event_name text,
  description text,
  source text not null default 'card_progress' check (source in ('card_progress','advance_day','manual')),
  event_date_year integer not null,
  event_date_month integer not null,
  event_date_day integer not null,
  created_at timestamptz default now()
);

-- 外部キー制約（schools.idがtext型の場合）
-- alter table public.event_history add constraint fk_event_history_school 
--   foreign key (school_id) references public.schools(id) on delete cascade;

-- RLS
alter table public.event_history enable row level security;
create policy "event_history_own_all" on public.event_history
  for all using (
    exists (select 1 from public.schools s
            where s.id = event_history.school_id and s.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.schools s
            where s.id = event_history.school_id and s.user_id = auth.uid())
  );

-- インデックス
create index if not exists idx_event_history_school on public.event_history(school_id);
create index if not exists idx_event_history_date on public.event_history(event_date_year, event_date_month, event_date_day);


