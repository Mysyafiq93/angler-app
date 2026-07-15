create table public.follows (
  follower_id uuid references public.profiles(id) on delete cascade,
  following_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

create table public.trips (
  id uuid primary key default gen_random_uuid(),
  organiser_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  location text not null,
  starts_at timestamptz not null,
  price_myr numeric(10,2) not null default 0,
  seats integer not null check (seats > 0),
  description text not null default '',
  status text not null default 'open' check (status in ('open','full','completed','cancelled')),
  created_at timestamptz not null default now()
);

create table public.trip_members (
  trip_id uuid references public.trips(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  status text not null default 'requested' check (status in ('requested','approved','declined','cancelled')),
  created_at timestamptz not null default now(),
  primary key (trip_id, user_id)
);

create table public.communities (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete set null,
  name text unique not null,
  description text not null default '',
  image_path text,
  created_at timestamptz not null default now()
);

create table public.community_members (
  community_id uuid references public.communities(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('member','moderator','owner')),
  created_at timestamptz not null default now(),
  primary key (community_id, user_id)
);

alter table public.follows enable row level security;
alter table public.trips enable row level security;
alter table public.trip_members enable row level security;
alter table public.communities enable row level security;
alter table public.community_members enable row level security;

create policy "follows are public" on public.follows for select using (true);
create policy "users manage own follows" on public.follows for all using (auth.uid() = follower_id) with check (auth.uid() = follower_id);
create policy "trips are public" on public.trips for select using (true);
create policy "organisers manage trips" on public.trips for all using (auth.uid() = organiser_id) with check (auth.uid() = organiser_id);
create policy "trip members are visible" on public.trip_members for select using (true);
create policy "users request trips" on public.trip_members for insert with check (auth.uid() = user_id);
create policy "users cancel own request" on public.trip_members for delete using (auth.uid() = user_id);
create policy "communities are public" on public.communities for select using (true);
create policy "owners manage communities" on public.communities for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "community membership is public" on public.community_members for select using (true);
create policy "users manage own membership" on public.community_members for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

insert into public.communities (name, description) values
  ('Penang Anglers Club', 'Shore and island fishing'),
  ('Kelong Hunters Malaysia', 'Kelong and bottom fishing'),
  ('Siakap Casting Utara', 'Northern casting reports'),
  ('Beginner Anglers MY', 'Learn, ask, and improve')
on conflict (name) do nothing;
