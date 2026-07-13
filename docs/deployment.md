# Deployment

## Supabase

1. Create the Supabase project.
2. Enable Email/Password in Auth.
3. Create at least two development Auth users before running `supabase/seed.sql`.
4. Apply all SQL files in `supabase/migrations` in timestamp order.
5. Confirm the private Storage bucket `trip-documents` exists with the configured MIME and size restrictions.

## Vercel

1. Import the repository.
2. Add `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_APP_NAME`, `VITE_APP_URL`, and `VITE_MAP_STYLE_URL`.
3. Keep SPA rewrites enabled via `vercel.json`.
4. Redeploy after changing Auth redirect URLs or PWA metadata.

## iPhone testing

1. Open the deployed URL in Safari on iPhone.
2. Sign in once while online.
3. Visit the main trip routes so the shell and recent data warm the caches.
4. Use `/install` to guide Add to Home Screen.
5. Toggle airplane mode and confirm dashboard, itinerary, and checklists still open.
