-- データベーススキーマ修正スクリプト v2
-- 型の不一致（text vs uuid）を完全解決

-- 1. 既存のテーブルを完全削除
drop table if exists public.event_history cascade;
drop table if exists public.tournament_matches cascade;
drop table if exists public.tournament_players cascade;
drop table if exists public.tournaments cascade;
drop table if exists public.hand_cards cascade;
drop table if exists public.players cascade;
drop table if exists public.schools cascade;

-- 2. 正しい型でテーブルを再作成

-- 学校テーブル（user_idをuuid型に変更）
create table public.schools (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  reputation integer not null default 50,
  funds integer not null default 50000,
  current_year integer not null default 2024,
  current_month integer not null default 4,
  current_day integer not null default 1,
  created_at timestamptz default now()
);

-- プレイヤーテーブル
create table public.players (
  id text primary key,
  school_id text not null,
  pokemon_name text not null,
  pokemon_id integer not null,
  level integer not null default 1,
  grade integer not null default 1,
  position text not null default 'member',
  serve_skill integer not null default 30,
  return_skill integer not null default 30,
  volley_skill integer not null default 30,
  stroke_skill integer not null default 30,
  mental integer not null default 30,
  stamina integer not null default 30,
  condition text not null default 'normal',
  motivation integer not null default 50,
  experience integer not null default 0,
  matches_played integer default 0,
  matches_won integer default 0,
  sets_won integer default 0,
  sets_lost integer default 0,
  types text[],
  special_abilities jsonb,
  personality text not null default 'normal',
  enrollment_year integer not null default 2024,
  created_at timestamptz default now()
);

-- 手札テーブル
create table public.hand_cards (
  id text primary key,
  school_id text not null,
  card_data jsonb not null,
  created_at timestamptz default now()
);

-- トーナメントテーブル
create table public.tournaments (
  id text primary key,
  school_id text not null,
  name text not null,
  tournament_type text not null,
  start_date date not null,
  end_date date not null,
  status text not null default 'upcoming',
  created_at timestamptz default now()
);

-- トーナメントプレイヤーテーブル
create table public.tournament_players (
  id text primary key,
  tournament_id text not null,
  player_id text not null,
  seed integer,
  final_rank integer,
  created_at timestamptz default now()
);

-- トーナメントマッチテーブル
create table public.tournament_matches (
  id text primary key,
  tournament_id text not null,
  player1_id text not null,
  player2_id text not null,
  winner_id text,
  score text,
  match_date date,
  created_at timestamptz default now()
);

-- イベント履歴テーブル
create table public.event_history (
  id uuid primary key default gen_random_uuid(),
  school_id text not null,
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

-- 3. 外部キー制約を追加
alter table public.players add constraint fk_players_school 
  foreign key (school_id) references public.schools(id) on delete cascade;

alter table public.hand_cards add constraint fk_hand_cards_school 
  foreign key (school_id) references public.schools(id) on delete cascade;

alter table public.tournaments add constraint fk_tournaments_school 
  foreign key (school_id) references public.schools(id) on delete cascade;

alter table public.tournament_players add constraint fk_tournament_players_tournament 
  foreign key (tournament_id) references public.tournaments(id) on delete cascade;

alter table public.tournament_players add constraint fk_tournament_players_player 
  foreign key (player_id) references public.players(id) on delete cascade;

alter table public.tournament_matches add constraint fk_tournament_matches_tournament 
  foreign key (tournament_id) references public.tournaments(id) on delete cascade;

alter table public.tournament_matches add constraint fk_tournament_matches_player1 
  foreign key (player1_id) references public.players(id) on delete cascade;

alter table public.tournament_matches add constraint fk_tournament_matches_player2 
  foreign key (player2_id) references public.players(id) on delete cascade;

-- 4. RLSを有効化
alter table public.schools enable row level security;
alter table public.players enable row level security;
alter table public.hand_cards enable row level security;
alter table public.tournaments enable row level security;
alter table public.tournament_players enable row level security;
alter table public.tournament_matches enable row level security;
alter table public.event_history enable row level security;

-- 5. RLSポリシーを作成
-- schools（user_idがuuid型なので直接比較可能）
create policy "schools_own_all" on public.schools
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- players
create policy "players_own_all" on public.players
  for all using (
    exists (select 1 from public.schools s where s.id = players.school_id and s.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.schools s where s.id = players.school_id and s.user_id = auth.uid())
  );

-- hand_cards
create policy "hand_cards_own_all" on public.hand_cards
  for all using (
    exists (select 1 from public.schools s where s.id = hand_cards.school_id and s.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.schools s where s.id = hand_cards.school_id and s.user_id = auth.uid())
  );

-- tournaments
create policy "tournaments_own_all" on public.tournaments
  for all using (
    exists (select 1 from public.schools s where s.id = tournaments.school_id and s.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.schools s where s.id = tournaments.school_id and s.user_id = auth.uid())
  );

-- tournament_players
create policy "tournament_players_own_all" on public.tournament_players
  for all using (
    exists (select 1 from public.tournaments t 
            join public.schools s on s.id = t.school_id 
            where t.id = tournament_players.tournament_id and s.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.tournaments t 
            join public.schools s on s.id = t.school_id 
            where t.id = tournament_players.tournament_id and s.user_id = auth.uid())
  );

-- tournament_matches
create policy "tournament_matches_own_all" on public.tournament_matches
  for all using (
    exists (select 1 from public.tournaments t 
            join public.schools s on s.id = t.school_id 
            where t.id = tournament_matches.tournament_id and s.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.tournaments t 
            join public.schools s on s.id = t.school_id 
            where t.id = tournament_matches.tournament_id and s.user_id = auth.uid())
  );

-- event_history
create policy "event_history_own_all" on public.event_history
  for all using (
    exists (select 1 from public.schools s where s.id = event_history.school_id and s.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.schools s where s.id = event_history.school_id and s.user_id = auth.uid())
  );

-- 6. インデックスを作成
create index if not exists idx_players_school on public.players(school_id);
create index if not exists idx_hand_cards_school on public.hand_cards(school_id);
create index if not exists idx_tournaments_school on public.tournaments(school_id);
create index if not exists idx_tournament_players_tournament on public.tournament_players(tournament_id);
create index if not exists idx_tournament_matches_tournament on public.tournament_matches(tournament_id);
create index if not exists idx_event_history_school on public.event_history(school_id);
create index if not exists idx_event_history_date on public.event_history(event_date_year, event_date_month, event_date_day);

-- 7. 拡張機能を有効化
create extension if not exists "pgcrypto";
