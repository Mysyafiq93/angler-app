alter table public.marketplace_listings
add column if not exists condition text not null default 'used'
check (condition in ('used', 'new'));

create table if not exists public.marketplace_listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.marketplace_listings(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  storage_path text not null unique,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.marketplace_listing_images enable row level security;

create policy "marketplace listing images are public"
on public.marketplace_listing_images for select
using (
  exists (
    select 1 from public.marketplace_listings listing
    where listing.id = listing_id and (listing.status = 'active' or listing.seller_id = auth.uid())
  )
);

create policy "sellers manage own marketplace listing images"
on public.marketplace_listing_images for all
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy "users update own marketplace images"
on storage.objects for update to authenticated
using (bucket_id = 'marketplace-images' and owner_id = auth.uid()::text)
with check (bucket_id = 'marketplace-images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "users delete own marketplace images"
on storage.objects for delete to authenticated
using (bucket_id = 'marketplace-images' and owner_id = auth.uid()::text);
