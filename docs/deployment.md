# Deployment

## Supabase

1. Create the Supabase project.
2. Enable Email/Password in Auth.
3. Create at least two development Auth users before running `supabase/seed.sql`.
4. Apply all SQL files in `supabase/migrations` in timestamp order.
5. Confirm the private Storage bucket `trip-documents` exists with the configured MIME and size restrictions.

## Vercel

1. Import the repository.
2. If Vercel expects `main` by default, set the Production Branch to `develop` or create a `main` branch before go-live.
3. Add `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_APP_NAME`, `VITE_APP_URL`, and `VITE_MAP_STYLE_URL`.
4. Set `VITE_APP_URL` to the final deployed URL, for example `https://your-project.vercel.app`.
5. Keep SPA rewrites enabled via `vercel.json`.
6. In Supabase Auth, add the deployed Vercel URL to the allowed site URL / redirect URL list.
7. Redeploy after changing Auth redirect URLs or PWA metadata.

## Production checklist

1. Confirm the Vercel build passes with the current branch.
2. Confirm the deployed URL opens deep links such as `/login`, `/install`, and `/trips/...` without a 404.
3. Confirm Supabase login works from the deployed domain.
4. Confirm document upload works against the production Supabase project and storage policies.
5. Confirm the map style URL is reachable from the deployed app.
6. Confirm the password reset pages are still placeholders if that workflow has not been implemented yet.

## iPhone testing

1. Open the deployed URL in Safari on iPhone.
2. Sign in once while online.
3. Visit the main trip routes so the shell and recent data warm the caches.
4. Use `/install` to guide Add to Home Screen.
5. Toggle airplane mode and confirm dashboard, itinerary, and checklists still open.
