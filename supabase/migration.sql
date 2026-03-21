-- Supabase SQL migration: run this in the Supabase SQL Editor

-- Score categories
create table if not exists score_categories (
  id serial primary key,
  name text not null unique,
  "order" integer not null unique
);

-- Seed score categories
insert into score_categories (name, "order") values
  ('Red', 1),
  ('Yellow', 2),
  ('Bronze Yellow', 3),
  ('Bronze', 4),
  ('Silver Bronze', 5),
  ('Silver', 6),
  ('Gold Silver', 7),
  ('Gold', 8),
  ('Platinum Gold', 9),
  ('Platinum', 10)
on conflict (name) do nothing;

-- Games
create table if not exists games (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  picture text not null default '',
  start_date date not null default current_date,
  finish_date date,
  "left" boolean not null default false,
  score_id integer references score_categories(id)
);

-- Movies
create table if not exists movies (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  picture text not null default '',
  watch_date date not null default current_date,
  score_id integer references score_categories(id)
);

-- Enable Row Level Security (allow all for now - no auth)
alter table score_categories enable row level security;
alter table games enable row level security;
alter table movies enable row level security;

create policy "Allow all on score_categories" on score_categories for all using (true) with check (true);
create policy "Allow all on games" on games for all using (true) with check (true);
create policy "Allow all on movies" on movies for all using (true) with check (true);
