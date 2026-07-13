# Deployment

Phase 1 includes:

- `vercel.json` with SPA rewrites
- base security headers
- PWA manifest generation through `vite-plugin-pwa`

Before first deployment:

1. Create the Supabase project.
2. Configure env vars in Vercel.
3. Set Auth redirect URLs for local and production domains.
4. Run `npm run build` locally.
