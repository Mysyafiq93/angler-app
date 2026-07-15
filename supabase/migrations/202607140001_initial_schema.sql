create extension if not exists pgcrypto;

create type public.location_privacy as enum ('approximate', 'state', 'private');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null check (char_length(username) between 3 and 30),
  display_name text not null,
  avatar_path text,
  location text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  story text not null default '',
  species text not null,
  weight_kg numeric(7,2),
  technique text,
  location_label text,
  latitude numeric(9,6),
  longitude numeric(9,6),
  privacy public.location_privacy not null default 'approximate',
  released boolean,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.post_images (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  storage_path text not null unique,
  width integer,
  height integer,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);

create table public.likes (
  post_id uuid references public.posts(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table public.marketplace_listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null default '',
  price_myr numeric(10,2) not null check (price_myr >= 0),
  location text not null,
  image_path text,
  status text not null default 'active' check (status in ('active','reserved','sold')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.post_images enable row level security;
alter table public.comments enable row level security;
alter table public.likes enable row level security;
alter table public.marketplace_listings enable row level security;

create policy "profiles are public" on public.profiles for select using (true);
create policy "users manage own profile" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "public posts are readable" on public.posts for select using (privacy <> 'private' or auth.uid() = author_id);
create policy "users create own posts" on public.posts for insert with check (auth.uid() = author_id);
create policy "users update own posts" on public.posts for update using (auth.uid() = author_id) with check (auth.uid() = author_id);
create policy "users delete own posts" on public.posts for delete using (auth.uid() = author_id);
create policy "post images are readable" on public.post_images for select using (exists (select 1 from public.posts p where p.id = post_id and (p.privacy <> 'private' or p.author_id = auth.uid())));
create policy "users manage own post images" on public.post_images for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "comments are public" on public.comments for select using (true);
create policy "users create own comments" on public.comments for insert with check (auth.uid() = author_id);
create policy "users delete own comments" on public.comments for delete using (auth.uid() = author_id);
create policy "likes are public" on public.likes for select using (true);
create policy "users manage own likes" on public.likes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "active listings are public" on public.marketplace_listings for select using (status = 'active' or auth.uid() = seller_id);
create policy "sellers manage own listings" on public.marketplace_listings for all using (auth.uid() = seller_id) with check (auth.uid() = seller_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('catch-images', 'catch-images', true, 10485760, array['image/jpeg','image/png','image/webp']),
       ('marketplace-images', 'marketplace-images', true, 10485760, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

create policy "public reads catch images" on storage.objects for select using (bucket_id = 'catch-images');
create policy "users upload own catch images" on storage.objects for insert to authenticated with check (bucket_id = 'catch-images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "users manage own catch images" on storage.objects for update to authenticated using (bucket_id = 'catch-images' and owner_id = auth.uid()::text);
create policy "users delete own catch images" on storage.objects for delete to authenticated using (bucket_id = 'catch-images' and owner_id = auth.uid()::text);
create policy "public reads marketplace images" on storage.objects for select using (bucket_id = 'marketplace-images');
create policy "users upload own marketplace images" on storage.objects for insert to authenticated with check (bucket_id = 'marketplace-images' and (storage.foldername(name))[1] = auth.uid()::text);
