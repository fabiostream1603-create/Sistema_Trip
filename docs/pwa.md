# PWA

Phase 1 configures:

- web app manifest
- service worker registration via `vite-plugin-pwa`
- install instructions page at `/install`
- standalone display mode

Offline document caching is intentionally deferred until secure document access rules are in place.

Phase 8 adds:

- online/offline banner in the app shell
- update prompt using `virtual:pwa-register/react`
- runtime caching for Supabase REST reads
- richer `/install` guidance around offline behavior
