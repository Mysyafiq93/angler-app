# Supabase setup

1. Create a Supabase project at <https://database.new>.
2. Open SQL Editor and run `migrations/202607140001_initial_schema.sql`.
3. Copy the project URL and publishable key from Project Settings > API.
4. Add them to `.env.local` and to the Vercel project's environment variables:

```text
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
```

Never expose the Supabase service-role key in the browser or commit it to Git.

The current online demo saves new posts in the current browser only. After these
credentials are configured, implement authentication and replace the mock post
repository with Supabase queries and Storage uploads.
