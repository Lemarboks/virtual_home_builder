-- Run this in your Supabase SQL editor to set up the schema.

create table if not exists projects (
  id         uuid        primary key default gen_random_uuid(),
  name       text        not null default 'Untitled room',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists rooms (
  id          uuid        primary key default gen_random_uuid(),
  project_id  uuid        not null references projects(id) on delete cascade,
  name        text        not null default 'Main Room',
  width       numeric     not null default 8,
  length      numeric     not null default 10,
  height      numeric     not null default 3,
  wall_color  text        not null default '#f2eee7',
  floor_color text        not null default '#d6c4ad',
  created_at  timestamptz not null default now()
);

create table if not exists furniture_items (
  id          text        primary key,
  project_id  uuid        not null references projects(id) on delete cascade,
  room_id     uuid        not null references rooms(id) on delete cascade,
  type        text        not null,
  position_x  numeric     not null default 0,
  position_y  numeric     not null default 0,
  position_z  numeric     not null default 0,
  rotation_x  numeric     not null default 0,
  rotation_y  numeric     not null default 0,
  rotation_z  numeric     not null default 0,
  size_x      numeric     not null default 1,
  size_y      numeric     not null default 1,
  size_z      numeric     not null default 1,
  color       text        not null default '#ffffff',
  created_at  timestamptz not null default now()
);

-- Fix #10: index updated_at descending to match the listProjects() ORDER BY.
create index if not exists projects_updated_at_idx        on projects(updated_at desc);
create index if not exists rooms_project_id_idx           on rooms(project_id);
create index if not exists furniture_items_project_id_idx on furniture_items(project_id);
create index if not exists furniture_items_room_id_idx    on furniture_items(room_id);

-- Fix #10: trigger keeps updated_at current on every UPDATE so the sort order
-- is always correct even when rows are modified outside the app (e.g. via the
-- Supabase dashboard or a future admin tool).
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger projects_set_updated_at
  before update on projects
  for each row execute function set_updated_at();

-- Row Level Security: disabled for now (no auth yet).
-- When you add Supabase Auth, enable RLS and add policies like:
--   alter table projects enable row level security;
--   create policy "Users own their projects" on projects
--     using (auth.uid() = user_id);
-- Then add a user_id uuid column referencing auth.users.
