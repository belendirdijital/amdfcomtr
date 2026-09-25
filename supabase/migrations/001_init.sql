-- amdfcomtr Veteranlar Ligi schema
create extension if not exists "pgcrypto";

create type public.user_role as enum ('admin', 'team');

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  short_name text not null,
  color text not null default '#F05A28',
  secondary_color text not null default '#2B6EF2',
  manager text default '',
  contact_phone text default '',
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null default 'team',
  team_id uuid references public.teams (id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  round integer not null,
  home_id uuid not null references public.teams (id) on delete cascade,
  away_id uuid not null references public.teams (id) on delete cascade,
  date date not null,
  time text not null default '18:00',
  venue text not null default 'AMDF Arena',
  home_score integer,
  away_score integer,
  created_at timestamptz not null default now()
);

create table public.match_goals (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches (id) on delete cascade,
  team_id uuid not null references public.teams (id) on delete cascade,
  player_name text not null,
  minute integer,
  count integer not null default 1 check (count > 0),
  created_at timestamptz not null default now()
);

create table public.cards (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  player text not null default '',
  yellow integer not null default 0 check (yellow >= 0),
  red integer not null default 0 check (red >= 0),
  note text not null default '',
  created_at date not null default current_date
);

create table public.licenses (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  license_no text not null,
  first_name text not null,
  last_name text not null,
  national_id text not null,
  birth_date date not null,
  birth_place text not null,
  blood_type text not null,
  club text not null,
  registration_date date not null,
  visa_season text not null,
  player_photo text not null,
  club_logo text not null,
  federation_logo text not null default '',
  created_at timestamptz not null default now()
);

create index matches_round_idx on public.matches (round);
create index match_goals_player_idx on public.match_goals (player_name);
create index licenses_team_idx on public.licenses (team_id);

alter table public.teams enable row level security;
alter table public.profiles enable row level security;
alter table public.matches enable row level security;
alter table public.match_goals enable row level security;
alter table public.cards enable row level security;
alter table public.licenses enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

create or replace function public.my_team_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select team_id from public.profiles where id = auth.uid();
$$;

-- Public read for league tables
create policy "teams_public_read" on public.teams for select using (true);
create policy "matches_public_read" on public.matches for select using (true);
create policy "goals_public_read" on public.match_goals for select using (true);
create policy "cards_public_read" on public.cards for select using (true);

-- Admin write
create policy "teams_admin_write" on public.teams for all using (public.is_admin()) with check (public.is_admin());
create policy "matches_admin_write" on public.matches for all using (public.is_admin()) with check (public.is_admin());
create policy "goals_admin_write" on public.match_goals for all using (public.is_admin()) with check (public.is_admin());
create policy "cards_admin_write" on public.cards for all using (public.is_admin()) with check (public.is_admin());

-- Profiles
create policy "profiles_self_read" on public.profiles for select using (auth.uid() = id or public.is_admin());
create policy "profiles_admin_write" on public.profiles for all using (public.is_admin()) with check (public.is_admin());

-- Licenses: admin all; team own club
create policy "licenses_admin_all" on public.licenses for all using (public.is_admin()) with check (public.is_admin());
create policy "licenses_team_select" on public.licenses for select using (team_id = public.my_team_id());
create policy "licenses_team_insert" on public.licenses for insert with check (team_id = public.my_team_id());
create policy "licenses_team_update" on public.licenses for update using (team_id = public.my_team_id()) with check (team_id = public.my_team_id());
create policy "licenses_team_delete" on public.licenses for delete using (team_id = public.my_team_id());

-- Storage bucket for license images (optional; data URLs also supported)
insert into storage.buckets (id, name, public)
values ('licenses', 'licenses', false)
on conflict (id) do nothing;

create policy "licenses_storage_admin" on storage.objects
  for all using (bucket_id = 'licenses' and public.is_admin())
  with check (bucket_id = 'licenses' and public.is_admin());

create policy "licenses_storage_team_read" on storage.objects
  for select using (
    bucket_id = 'licenses'
    and (storage.foldername(name))[1] = public.my_team_id()::text
  );

create policy "licenses_storage_team_write" on storage.objects
  for insert with check (
    bucket_id = 'licenses'
    and (storage.foldername(name))[1] = public.my_team_id()::text
  );

-- Seed teams
insert into public.teams (id, name, short_name, color, secondary_color, manager, contact_phone) values
  ('11111111-1111-1111-1111-111111111101', 'AMDF Veteranlar', 'AMDF', '#F05A28', '#2B6EF2', 'Serkan Yılmaz', ''),
  ('11111111-1111-1111-1111-111111111102', 'Anadolu 1985', 'AND', '#2B6EF2', '#D33E55', 'Murat Kaya', ''),
  ('11111111-1111-1111-1111-111111111103', 'Boğazın Kartalları', 'BJK', '#4E5969', '#D33E55', 'Levent Akın', ''),
  ('11111111-1111-1111-1111-111111111104', 'Kuzey Yıldızı', 'KZY', '#14A673', '#4E5969', 'Hakan Demir', ''),
  ('11111111-1111-1111-1111-111111111105', 'Şehrin Efsaneleri', 'ŞEF', '#7C4DFF', '#D9A20B', 'Orhan Şen', ''),
  ('11111111-1111-1111-1111-111111111106', 'Altın Kramponlar', 'AKR', '#D9A20B', '#4E5969', 'Turgay Öz', '');

insert into public.cards (id, team_id, player, yellow, red, note, created_at) values
  ('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111102', 'Emre K.', 1, 0, 'Sportmenlik dışı hareket', '2026-08-29'),
  ('22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111103', 'Cenk A.', 2, 0, 'Maç sonu toplamı', '2026-09-05'),
  ('22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111106', 'Ahmet T.', 0, 1, 'Doğrudan kırmızı kart', '2026-09-05');

-- Auto-create profile stub on signup (role set by admin/service later)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, team_id)
  values (
    new.id,
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'team'),
    nullif(new.raw_user_meta_data->>'team_id', '')::uuid
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
