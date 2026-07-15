# AnglerMY Project Context

Source conversation: https://chatgpt.com/share/6a562e0f-b05c-83ec-8388-0f82dd81bbf1

## Product direction

AnglerMY is a Malaysia-focused fishing community application combining:

- Catch posts, photos, profiles, comments, likes, follows, and achievements
- Fishing locations, map discovery, privacy-aware catch locations, and heatmaps
- Weather, marine, tide, safety, and fishing-score forecasts
- Fishing trips, communities, and a marketplace
- Malaysian fish species, techniques, bait, and local fishing knowledge

The local catch dataset is intended to become the product's main advantage. Early
forecast scores should use environmental rules; statistical and machine-learning
predictions should only be introduced after enough verified catch records exist.

## Current prototype

`index.html` is the recovered Complete Demo v2. It includes:

- Responsive desktop and mobile navigation
- Home feed and browser-local demo catch posts
- Phone photo/camera selection and preview
- Interactive Leaflet/OpenStreetMap fishing map
- GPS location and sample Malaysian fishing spots
- Live Open-Meteo weather and marine requests
- Chart.js forecast dashboards and hourly fishing scores
- Profiles, achievements, trips, communities, and marketplace demo screens

The fishing spots and community content are demonstration records. Internet access
is required for libraries, map tiles, forecasts, and remote sample images.

## Agreed implementation path

1. Rebuild the single-file demo as a maintainable Next.js responsive PWA.
2. Use Supabase for authentication, PostgreSQL data, image storage, and realtime.
3. Deploy web testing builds on Vercel.
4. Test first with a website/PWA link.
5. Package the stable web application for Android with Capacitor.

Suggested first backend entities include profiles, posts, post images, comments,
likes, follows, fish species, catch records, fishing locations, trips, communities,
and marketplace listings.

## Version-one scope

- Text and image catch posts
- Approximate location with explicit privacy controls
- Species, weight/size, bait/lure, technique, and released/kept status
- Profiles and social interactions
- Fishing map and environmental forecast
- Trips and essential community features

Video and custom AI/ML forecasting are later phases. If video is introduced, use a
dedicated streaming service rather than storing large video files in Supabase.

## Immediate next milestone

Create the Next.js application foundation and migrate the current visual experience
into components while preserving the prototype as a behavior and design reference.
Then add the Supabase schema and authentication before replacing demo feed data.
