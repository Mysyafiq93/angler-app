-- Heatmap support: distinguish phone GPS from broad legacy locations.
alter table public.posts
  add column if not exists location_source text not null default 'user_gps'
    check (location_source in ('user_gps', 'approximate_geocode', 'unknown'));

-- Existing text-only locations are intentionally broad map points, never exact fishing spots.
update public.posts
set latitude = 5.285000,
    longitude = 100.269000,
    location_source = 'approximate_geocode'
where latitude is null
  and longitude is null
  and lower(coalesce(location_label, '')) like '%penang%';

update public.posts
set latitude = 3.337000,
    longitude = 101.250000,
    location_source = 'approximate_geocode'
where latitude is null
  and longitude is null
  and lower(coalesce(location_label, '')) like '%kuala selangor%';

create index if not exists posts_heatmap_coordinates_idx
  on public.posts (latitude, longitude)
  where latitude is not null and longitude is not null;
