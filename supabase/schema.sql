create extension if not exists "pgcrypto";

create table if not exists public.rooms (
  id text primary key,
  name text not null unique,
  description text,
  icon text
);

create table if not exists public.active_sessions (
  id uuid primary key default gen_random_uuid(),
  platform text not null check (platform in ('youtube', 'discord')),
  platform_user_id text not null,
  display_name text not null,
  room_id text not null references public.rooms(id) on delete restrict,
  started_at timestamptz not null default now(),
  unique (platform, platform_user_id)
);

alter table public.rooms enable row level security;
alter table public.active_sessions enable row level security;

drop policy if exists "Allow public display read for rooms" on public.rooms;
create policy "Allow public display read for rooms"
on public.rooms
for select
to anon
using (true);

drop policy if exists "Allow public display read for active sessions" on public.active_sessions;
create policy "Allow public display read for active sessions"
on public.active_sessions
for select
to anon
using (true);

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

create index if not exists active_sessions_room_id_idx on public.active_sessions(room_id);

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
