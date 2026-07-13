# Offline Strategy

Phase 8 focuses on safe, practical offline support rather than pretending the whole app is offline-complete.

Currently improved:

- App shell is cached by the PWA service worker.
- Recent REST reads can be reused through runtime caching.
- An online/offline banner keeps status visible.
- Checklist toggles, itinerary reads, and previously loaded trip screens remain more resilient after initial online access.

Intentionally limited:

- Private documents are not indiscriminately cached.
- Upload flows still require connectivity.
- Full offline mutation queues are not yet implemented for every feature.

Next logical upgrade:

- add a local queue for expenses and checklist mutations
- reconcile background sync when the connection returns
- selectively persist lightweight trip summaries in IndexedDB
