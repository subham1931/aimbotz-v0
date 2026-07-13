-- AimBotz player profiles (linked to auth.users)
create table if not exists public.aimbotz_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  display_name text not null default 'Player',
  avatar_url text,
  role text not null default 'user' check (role in ('user', 'admin')),
  coins integer not null default 50 check (coins >= 0),
  total_hours numeric not null default 0 check (total_hours >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists aimbotz_profiles_coins_idx on public.aimbotz_profiles (coins desc);
create index if not exists aimbotz_profiles_hours_idx on public.aimbotz_profiles (total_hours desc);

alter table public.aimbotz_profiles enable row level security;

drop policy if exists "aimbotz_profiles_select_own" on public.aimbotz_profiles;
create policy "aimbotz_profiles_select_own"
  on public.aimbotz_profiles for select
  using (auth.uid() = id or true);

drop policy if exists "aimbotz_profiles_update_own" on public.aimbotz_profiles;
create policy "aimbotz_profiles_update_own"
  on public.aimbotz_profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "aimbotz_profiles_insert_own" on public.aimbotz_profiles;
create policy "aimbotz_profiles_insert_own"
  on public.aimbotz_profiles for insert
  with check (auth.uid() = id);

-- Auto-create profile on signup / OAuth
create or replace function public.handle_aimbotz_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.aimbotz_profiles (id, email, display_name, avatar_url, role, coins)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(coalesce(new.email, 'player'), '@', 1)
    ),
    new.raw_user_meta_data->>'avatar_url',
    'user',
    50
  )
  on conflict (id) do update set
    email = excluded.email,
    display_name = coalesce(public.aimbotz_profiles.display_name, excluded.display_name),
    avatar_url = coalesce(excluded.avatar_url, public.aimbotz_profiles.avatar_url),
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_aimbotz on auth.users;
create trigger on_auth_user_created_aimbotz
  after insert on auth.users
  for each row execute function public.handle_aimbotz_new_user();
