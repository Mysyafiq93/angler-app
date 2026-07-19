# AnglerMY Development Setup

## Repository

- GitHub: `https://github.com/Mysyafiq93/angler-app`
- Shared development branch: `Angler_rl`
- Production branch: `main`
- Preview URL: `https://anglermy-preview.anglermy.workers.dev`

## Start Locally

```bash
git clone https://github.com/Mysyafiq93/angler-app.git
cd angler-app
git switch Angler_rl
npm install
cp .env.example .env.local
npm run dev -- --hostname 0.0.0.0 --port 3000
```

Open `http://localhost:3000`. For phone testing on the same Wi-Fi, use the laptop LAN IP and port `3000`.

## Environment Variables

Set these in `.env.local` for local Supabase data:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Never commit `.env.local` or any private keys.

## Cloudflare Preview

Pushes to `Angler_rl` trigger `.github/workflows/cloudflare-preview.yml`. The workflow builds OpenNext and deploys the `anglermy-preview` Worker.

Required GitHub Actions secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

The API token needs **Account -> Workers Scripts -> Edit** for the AnglerMY account.

## Daily Workflow

```bash
git switch Angler_rl
git pull --ff-only origin Angler_rl
# make and test focused changes
npm run lint
npm run build
git add .
git commit -m "feat: describe the change"
git push origin Angler_rl
```

Use pull requests to merge stable work from `Angler_rl` into `main`.

## Image Uploads

Home catch uploads are resized client-side to a maximum 1280px width and JPEG quality 72% before upload. Existing database images are not rewritten.
