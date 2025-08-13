-- データベーススキーマ完全修正スクリプト
-- 型の不一致（text vs uuid）を完全解決し、ゲーム進行状況とセーブ機能を追加

-- 1. 既存のテーブルを完全削除
drop table if exists public.event_history cascade;
drop table if exists public.tournament_matches cascade;
drop table if exists public.tournament_players cascade;
drop table if exists public.tournaments cascade;
drop table if exists public.hand_cards cascade;
drop table if exists public.players cascade;
drop table if exists public.schools cascade;
drop table if exists public.game_progress cascade;
drop table if exists public.card_usage_history cascade;
drop table if exists public.square_event_history cascade;
drop table if exists public.daily_reset_management cascade;
drop table if exists public.special_abilities_master cascade;
drop table if exists public.ability_combinations cascade;
drop table if exists public.ability_acquisition_history cascade;

-- 2. 正しい型でテーブルを再作成

-- 学校テーブル（idをtext型で作成）
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
  
  -- 栄冠ナイン式ステータスゲージシステム用カラム
  stat_gages jsonb default '{
    "serve_skill_gage": 0,
    "return_skill_gage": 0,
    "volley_skill_gage": 0,
    "stroke_skill_gage": 0,
    "mental_gage": 0,
    "stamina_gage": 0
  }'::jsonb,
  
  -- 成長効率係数用カラム
  growth_efficiency jsonb default '{
    "serve_skill_efficiency": 0.1,
    "return_skill_efficiency": 0.1,
    "volley_skill_efficiency": 0.05,
    "stroke_skill_efficiency": 0.15,
    "mental_efficiency": 0.2,
    "stamina_efficiency": 0.25
  }'::jsonb,
  
  -- 拡張特殊能力システム用のカラム
  special_abilities_detailed jsonb default '{}'::jsonb,
  
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

-- ゲーム進行状況テーブル（すごろくの位置、カードの状態などを保存）
create table public.game_progress (
  id uuid primary key default gen_random_uuid(),
  school_id text not null,
  
  -- すごろく進行状況
  current_position integer default 0, -- 現在のマス位置（0-23）
  total_progress integer default 0,   -- 累計進行マス数
  
  -- 手札の状態
  hand_cards_count integer default 5, -- 現在の手札枚数
  max_hand_size integer default 5,    -- 最大手札サイズ
  
  -- ゲーム状態
  last_save_date timestamptz default now(),
  game_version text default '1.0.0',
  
  -- 統計情報
  total_cards_used integer default 0,
  total_events_triggered integer default 0,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- カード使用履歴テーブル（どのカードをいつ使ったかを記録）
create table public.card_usage_history (
  id uuid primary key default gen_random_uuid(),
  school_id text not null,
  player_id text references players(id),
  
  -- カード情報
  card_id text not null,
  card_name text not null,
  card_category text not null,
  
  -- 使用情報
  used_at timestamptz default now(),
  used_position integer not null, -- 使用時のすごろく位置
  effects_applied jsonb, -- 適用された効果
  
  -- 結果
  success boolean default true,
  notes text,
  
  created_at timestamptz default now()
);

-- すごろくマス効果履歴テーブル（各マスで何が起こったかを記録）
create table public.square_event_history (
  id uuid primary key default gen_random_uuid(),
  school_id text not null,
  
  -- マス情報
  square_position integer not null, -- マス位置（0-23）
  square_type text not null, -- マスタイプ（good, bad, normal等）
  
  -- イベント情報
  event_name text,
  event_description text,
  event_effects jsonb, -- 発生した効果
  
  -- 発生情報
  occurred_at timestamptz default now(),
  game_date_year integer not null,
  game_date_month integer not null,
  game_date_day integer not null,
  
  created_at timestamptz default now()
);

-- 日次リセット管理テーブル（カードの日次生成を管理）
create table public.daily_reset_management (
  id uuid primary key default gen_random_uuid(),
  school_id text not null,
  
  -- リセット情報
  last_reset_date_year integer not null,
  last_reset_date_month integer not null,
  last_reset_date_day integer not null,
  
  -- カード生成状態
  daily_cards_generated boolean default false,
  cards_generated_count integer default 0,
  
  -- 次回リセット予定
  next_reset_date_year integer not null,
  next_reset_date_month integer not null,
  next_reset_date_day integer not null,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 特殊能力マスターテーブル
create table public.special_abilities_master (
  id text primary key,
  name text not null,
  english_name text not null,
  category text not null, -- serve, return, volley, stroke, mental, physical, situational
  color text not null,    -- diamond, gold, blue, green, purple, orange, gray, red
  rank text not null,     -- SS+, SS, S+, S, A+, A, B+, B, C, D
  description text not null,
  
  -- 効果データ（JSONB）
  effects jsonb not null,
  
  -- 取得条件
  acquisition_requirements jsonb,
  acquisition_methods jsonb,
  
  -- バランス調整用
  power_level integer default 100,
  rarity_weight decimal(5,3) default 1.000,
  
  -- UI表示用
  icon_path text,
  color_code text,
  display_order integer default 0,
  
  -- メタデータ
  version text default '1.0',
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 特殊能力組み合わせテーブル
create table public.ability_combinations (
  id uuid primary key default gen_random_uuid(),
  combination_name text not null,
  required_abilities text[] not null,
  result_ability_id text references special_abilities_master(id),
  success_rate decimal(5,2) not null,
  description text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 特殊能力習得履歴テーブル
create table public.ability_acquisition_history (
  id uuid primary key default gen_random_uuid(),
  player_id text references players(id),
  ability_id text references special_abilities_master(id),
  acquisition_method text not null,
  acquisition_date date not null,
  success_rate_used decimal(5,2),
  was_combination boolean default false,
  combination_id uuid references ability_combinations(id),
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

-- ゲーム進行状況関連の外部キー制約
alter table public.game_progress add constraint fk_game_progress_school 
  foreign key (school_id) references public.schools(id) on delete cascade;

alter table public.card_usage_history add constraint fk_card_usage_history_school 
  foreign key (school_id) references public.schools(id) on delete cascade;

alter table public.card_usage_history add constraint fk_card_usage_history_player 
  foreign key (player_id) references public.players(id) on delete set null;

alter table public.square_event_history add constraint fk_square_event_history_school 
  foreign key (school_id) references public.schools(id) on delete cascade;

alter table public.daily_reset_management add constraint fk_daily_reset_management_school 
  foreign key (school_id) references public.schools(id) on delete cascade;

-- 4. RLSを有効化
alter table public.schools enable row level security;
alter table public.players enable row level security;
alter table public.hand_cards enable row level security;
alter table public.tournaments enable row level security;
alter table public.tournament_players enable row level security;
alter table public.tournament_matches enable row level security;
alter table public.event_history enable row level security;
alter table public.game_progress enable row level security;
alter table public.card_usage_history enable row level security;
alter table public.square_event_history enable row level security;
alter table public.daily_reset_management enable row level security;
alter table public.special_abilities_master enable row level security;
alter table public.ability_combinations enable row level security;
alter table public.ability_acquisition_history enable row level security;

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

-- ゲーム進行状況関連のポリシー
create policy "Users can manage their own game progress" on public.game_progress
  for all using (
    exists (
      select 1 from schools 
      where schools.id = game_progress.school_id 
      and schools.user_id = auth.uid()
    )
  );

create policy "Users can manage their own card usage history" on public.card_usage_history
  for all using (
    exists (
      select 1 from schools 
      where schools.id = card_usage_history.school_id 
      and schools.user_id = auth.uid()
    )
  );

create policy "Users can manage their own square event history" on public.square_event_history
  for all using (
    exists (
      select 1 from schools 
      where schools.id = square_event_history.school_id 
      and schools.user_id = auth.uid()
    )
  );

create policy "Users can manage their own daily reset management" on public.daily_reset_management
  for all using (
    exists (
      select 1 from schools 
      where schools.id = daily_reset_management.school_id 
      and schools.user_id = auth.uid()
    )
  );

-- 特殊能力関連のポリシー
create policy "Users can view all special abilities" on public.special_abilities_master
  for select using (true);

create policy "Users can view all ability combinations" on public.ability_combinations
  for select using (true);

create policy "Users can manage their own ability acquisition history" on public.ability_acquisition_history
  for all using (
    exists (
      select 1 from players p
      join schools s on s.id = p.school_id
      where p.id = ability_acquisition_history.player_id 
      and s.user_id = auth.uid()
    )
  );

-- 6. インデックスを作成
create index if not exists idx_players_school on public.players(school_id);
create index if not exists idx_hand_cards_school on public.hand_cards(school_id);
create index if not exists idx_tournaments_school on public.tournaments(school_id);
create index if not exists idx_tournament_players_tournament on public.tournament_players(tournament_id);
create index if not exists idx_tournament_matches_tournament on public.tournament_matches(tournament_id);
create index if not exists idx_event_history_school on public.event_history(school_id);
create index if not exists idx_event_history_date on public.event_history(event_date_year, event_date_month, event_date_day);

-- ゲーム進行状況関連のインデックス
create index if not exists idx_game_progress_school_id on public.game_progress(school_id);
create index if not exists idx_card_usage_history_school_id on public.card_usage_history(school_id);
create index if not exists idx_square_event_history_school_id on public.square_event_history(school_id);
create index if not exists idx_daily_reset_management_school_id on public.daily_reset_management(school_id);

-- 特殊能力関連のインデックス
create index if not exists idx_players_stat_gages on public.players using gin (stat_gages);
create index if not exists idx_players_growth_efficiency on public.players using gin (growth_efficiency);
create index if not exists idx_players_special_abilities_detailed on public.players using gin (special_abilities_detailed);
create index if not exists idx_special_abilities_category on public.special_abilities_master(category);
create index if not exists idx_special_abilities_color on public.special_abilities_master(color);
create index if not exists idx_special_abilities_rank on public.special_abilities_master(rank);
create index if not exists idx_special_abilities_active on public.special_abilities_master(is_active);
create index if not exists idx_ability_acquisition_player_id on public.ability_acquisition_history(player_id);
create index if not exists idx_ability_acquisition_ability_id on public.ability_acquisition_history(ability_id);

-- 7. 拡張機能を有効化
create extension if not exists "pgcrypto";

-- 8. トリガー：updated_at自動更新
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language 'plpgsql';

create trigger update_game_progress_updated_at 
  before update on public.game_progress 
  for each row execute function update_updated_at_column();

create trigger update_daily_reset_management_updated_at 
  before update on public.daily_reset_management 
  for each row execute function update_updated_at_column();

-- 9. 初期データ挿入用の関数
create or replace function initialize_game_progress_for_school(school_id_param text)
returns void as $$
begin
  -- ゲーム進行状況の初期化
  insert into game_progress (school_id, current_position, total_progress, hand_cards_count, max_hand_size)
  values (school_id_param, 0, 0, 5, 5)
  on conflict (school_id) do nothing;
  
  -- 日次リセット管理の初期化
  insert into daily_reset_management (
    school_id, 
    last_reset_date_year, last_reset_date_month, last_reset_date_day,
    next_reset_date_year, next_reset_date_month, next_reset_date_day
  )
  values (school_id_param, 2024, 4, 1, 2024, 4, 2)
  on conflict (school_id) do nothing;
end;
$$ language plpgsql;

-- 10. 確認用クエリ
select 'Schema creation completed successfully' as status;
