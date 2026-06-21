create extension if not exists "pgcrypto";

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

create table if not exists public.active_sessions (
  id uuid primary key default gen_random_uuid(),
  platform text not null check (platform in ('youtube', 'discord')),
  platform_user_id text not null,
  display_name text not null,
  room_id uuid not null references public.rooms(id) on delete restrict,
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

insert into public.rooms (name)
values ('編集'), ('勉強'), ('作業'), ('デザイン')
on conflict (name) do nothing;

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
