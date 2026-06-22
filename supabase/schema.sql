create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  platform text not null check (platform in ('discord', 'youtube', 'web')),
  platform_user_id text not null,
  display_name text not null,
  level integer not null default 1 check (level >= 1),
  xp integer not null default 0 check (xp >= 0),
  coin integer not null default 0 check (coin >= 0),
  total_focus_time integer not null default 0 check (total_focus_time >= 0),
  current_title text,
  favorite_badges text[] not null default '{}',
  focus_tree_stage text not null default 'Seed',
  focus_tree_updated_at timestamptz,
  today_goal text,
  today_message text,
  streak_days integer not null default 0 check (streak_days >= 0),
  favorite_seat text,
  live_url_youtube text,
  live_url_tiktok text,
  live_url_twitch text,
  is_live boolean not null default false,
  created_at timestamptz not null default now(),
  unique (platform, platform_user_id)
);

alter table public.users add column if not exists level integer not null default 1 check (level >= 1);
alter table public.users add column if not exists xp integer not null default 0 check (xp >= 0);
alter table public.users add column if not exists coin integer not null default 0 check (coin >= 0);
alter table public.users add column if not exists total_focus_time integer not null default 0 check (total_focus_time >= 0);
alter table public.users add column if not exists current_title text;
alter table public.users add column if not exists favorite_badges text[] not null default '{}';
alter table public.users add column if not exists focus_tree_stage text not null default 'Seed';
alter table public.users add column if not exists focus_tree_updated_at timestamptz;
alter table public.users add column if not exists today_goal text;
alter table public.users add column if not exists today_message text;
alter table public.users add column if not exists streak_days integer not null default 0 check (streak_days >= 0);
alter table public.users add column if not exists favorite_seat text;
alter table public.users add column if not exists live_url_youtube text;
alter table public.users add column if not exists live_url_tiktok text;
alter table public.users add column if not exists live_url_twitch text;
alter table public.users add column if not exists is_live boolean not null default false;

create table if not exists public.rooms (
  id text primary key,
  name text not null unique,
  description text,
  icon text,
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.seats (
  id uuid primary key default gen_random_uuid(),
  room_id text not null references public.rooms(id) on delete cascade,
  seat_id text not null,
  label text not null,
  zone text,
  status text not null default 'available' check (status in ('available', 'occupied', 'mine', 'reserved')),
  created_at timestamptz not null default now(),
  unique (room_id, seat_id)
);

create table if not exists public.active_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  platform text not null check (platform in ('discord', 'youtube', 'web')),
  platform_user_id text not null,
  display_name text not null,
  room_id text not null references public.rooms(id) on delete restrict,
  seat_id text,
  started_at timestamptz not null default now(),
  unique (platform, platform_user_id)
);

create table if not exists public.session_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  platform text not null check (platform in ('discord', 'youtube', 'web')),
  platform_user_id text not null,
  display_name text not null,
  room_id text not null references public.rooms(id) on delete restrict,
  seat_id text,
  started_at timestamptz not null,
  ended_at timestamptz not null,
  duration_seconds integer not null check (duration_seconds >= 0),
  leave_reason text,
  goal text,
  xp_earned integer not null default 0,
  coin_earned integer not null default 0,
  result_summary jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.warnings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  reason text not null,
  created_by text,
  created_at timestamptz not null default now()
);

create table if not exists public.bans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  reason text not null,
  expires_at timestamptz,
  created_by text,
  created_at timestamptz not null default now()
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  room_id text references public.rooms(id) on delete cascade,
  message text not null,
  active boolean not null default true,
  created_by text,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_actions (
  id uuid primary key default gen_random_uuid(),
  action_type text not null,
  target_user_id uuid references public.users(id) on delete set null,
  room_id text references public.rooms(id) on delete set null,
  seat_id text,
  message text,
  created_by text,
  created_at timestamptz not null default now()
);

create table if not exists public.focus_trees (
  user_id uuid primary key references public.users(id) on delete cascade,
  stage text not null default 'Seed',
  total_focus_time integer not null default 0 check (total_focus_time >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.focus_calendar (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  date date not null,
  focus_minutes integer not null default 0 check (focus_minutes >= 0),
  unique (user_id, date)
);

create table if not exists public.rankings (
  id uuid primary key default gen_random_uuid(),
  period text not null,
  room_id text references public.rooms(id) on delete set null,
  user_id uuid references public.users(id) on delete cascade,
  focus_minutes integer not null default 0,
  rank integer not null default 0
);

create table if not exists public.friends (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  friend_user_id uuid references public.users(id) on delete cascade,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  unique (user_id, friend_user_id)
);

create table if not exists public.reactions (
  id uuid primary key default gen_random_uuid(),
  from_user_id uuid references public.users(id) on delete set null,
  to_user_id uuid references public.users(id) on delete set null,
  room_id text references public.rooms(id) on delete set null,
  seat_id text,
  type text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  month text not null,
  image_url text,
  summary jsonb,
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;
alter table public.rooms enable row level security;
alter table public.seats enable row level security;
alter table public.active_sessions enable row level security;
alter table public.session_logs enable row level security;
alter table public.warnings enable row level security;
alter table public.bans enable row level security;
alter table public.announcements enable row level security;
alter table public.admin_actions enable row level security;
alter table public.focus_trees enable row level security;
alter table public.focus_calendar enable row level security;
alter table public.rankings enable row level security;
alter table public.friends enable row level security;
alter table public.reactions enable row level security;
alter table public.certificates enable row level security;

drop policy if exists "Allow public display read for rooms" on public.rooms;
create policy "Allow public display read for rooms"
on public.rooms
for select
to anon
using (true);

drop policy if exists "Allow public display read for seats" on public.seats;
create policy "Allow public display read for seats"
on public.seats
for select
to anon
using (true);

drop policy if exists "Allow public display read for active sessions" on public.active_sessions;
create policy "Allow public display read for active sessions"
on public.active_sessions
for select
to anon
using (true);

drop policy if exists "Allow public display read for announcements" on public.announcements;
create policy "Allow public display read for announcements"
on public.announcements
for select
to anon
using (active = true);

insert into public.rooms (id, name, description, icon)
values
  ('cafe', 'Cafe Room', '木目、暖色ライト、Lo-Fi、雨音。少しだけ雑談OKのカフェ席。', '☕'),
  ('library', 'Library Room', '静かな自習室。本棚、読書、勉強向け。会話禁止の深い集中席。', '📚'),
  ('office', 'Office Room', '黒ガラス、デスク、仕事、事務作業。タスクを静かに片づける部屋。', '▦'),
  ('creator', 'Creator Room', '動画編集、デザイン、制作作業向け。少し近未来感のある作業席。', '✦'),
  ('night', 'Night Room', '深夜作業、暗め、月明かり。長時間じっくり集中する夜の部屋。', '☾')
on conflict (id) do update
set
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon;

insert into public.seats (room_id, seat_id, label, zone)
select room_id, seat_id, seat_id, zone
from (
  values
    ('cafe', 'A1', '窓側席'), ('cafe', 'A2', '窓側席'), ('cafe', 'A3', 'カウンター席'), ('cafe', 'A4', 'カウンター席'),
    ('cafe', 'B1', '観葉植物横'), ('cafe', 'B2', '観葉植物横'), ('cafe', 'B3', '木目テーブル'), ('cafe', 'B4', '木目テーブル'),
    ('cafe', 'C1', '木目テーブル'), ('cafe', 'C2', '木目テーブル'), ('cafe', 'C3', '木目テーブル'), ('cafe', 'C4', '木目テーブル'),
    ('library', 'A1', '本棚横'), ('library', 'A2', '本棚横'), ('library', 'A3', '静音席'), ('library', 'A4', '静音席'),
    ('library', 'B1', '集中席'), ('library', 'B2', '集中席'), ('library', 'B3', '読書机'), ('library', 'B4', '読書机'),
    ('office', 'A1', 'デスク席'), ('office', 'A2', 'デスク席'), ('office', 'A3', '会議室風席'), ('office', 'A4', '会議室風席'),
    ('office', 'B1', '作業ブース'), ('office', 'B2', '作業ブース'), ('office', 'B3', '窓際デスク'), ('office', 'B4', '窓際デスク'),
    ('creator', 'A1', '編集ブース'), ('creator', 'A2', '編集ブース'), ('creator', 'A3', 'モニター席'), ('creator', 'A4', 'モニター席'),
    ('creator', 'B1', 'デザイン席'), ('creator', 'B2', 'デザイン席'), ('creator', 'B3', 'プレビュー席'), ('creator', 'B4', 'プレビュー席'),
    ('night', 'A1', '深夜席'), ('night', 'A2', '深夜席'), ('night', 'A3', '月明かり席'), ('night', 'A4', '月明かり席'),
    ('night', 'B1', '長時間集中席'), ('night', 'B2', '長時間集中席'), ('night', 'B3', '静かな隅'), ('night', 'B4', '静かな隅')
) as seed(room_id, seat_id, zone)
on conflict (room_id, seat_id) do update
set zone = excluded.zone;

create index if not exists active_sessions_room_id_idx on public.active_sessions(room_id);
create index if not exists active_sessions_seat_idx on public.active_sessions(room_id, seat_id);
create index if not exists session_logs_user_idx on public.session_logs(user_id);
create index if not exists admin_actions_created_at_idx on public.admin_actions(created_at);
create index if not exists users_level_idx on public.users(level);
create index if not exists users_xp_idx on public.users(xp);

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'active_sessions'
  ) then
    alter publication supabase_realtime add table public.active_sessions;
  end if;
end $$;
