# AnglerMY

AnglerMY is a responsive fishing community application for Malaysian anglers. It
combines catch sharing, public angler profiles, interactive fishing maps, live
weather and marine forecasts, trips, learning resources, a marketplace, and
achievement tracking.

The active application is under `src/`. The original single-file prototype is
preserved as `index.html` for historical reference.

This repository is public for development collaboration. Never place production
credentials, database passwords, or Supabase service-role keys in source control.

## Technology

- Next.js 16 App Router
- React and TypeScript
- Supabase Auth, PostgreSQL, and Storage
- Leaflet and OpenStreetMap
- Open-Meteo weather and marine APIs
- Recharts
- Playwright
- Cloudflare Workers deployment via the OpenNext adapter

## Requirements

- Node.js 22 or later
- npm
- A Supabase project with the migrations in `supabase/migrations/` applied

## Installation

```sh
npm install
cp .env.example .env.local
```

Set the public Supabase values in `.env.local` before starting the application.
Do not commit `.env.local` or any Supabase service-role key.

## Environment Variables

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Public URL of the Supabase project |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase browser publishable key |

## Development

```sh
npm run dev
```

Open <http://localhost:3000>.

## Production Build

```sh
npm run build
npm run start
```

## Quality Checks

```sh
npm run lint
npx playwright test
npm run build
```

Playwright runs the browser suite at standard desktop and mobile viewports.

## Project Structure

```text
src/app/                 Next.js pages and global styles
src/components/          Reusable interface and feature components
src/data/                Seed and demonstration content
src/lib/                 Supabase, forecast, and repository utilities
src/types/               Shared domain types
supabase/migrations/     Database and Storage migrations
tests/                   Playwright browser tests
index.html               Preserved legacy prototype
PROJECT_CONTEXT.md       Product background and direction
```

## Deployment

The deployment target is Cloudflare Workers using the OpenNext adapter. In the
Cloudflare dashboard, connect the GitHub repository through Workers Builds,
configure the two public Supabase environment variables, and use:

- Build command: `npm run cf:build`
- Deploy command: `npm run cf:deploy`
- Worker entrypoint: `.open-next/worker.js`
- Production branch: `main`

For a local preview, run `npm run cf:preview`. Supabase secrets, database
passwords, local deployment metadata, and private keys
must remain outside the repository.
