# Offline Strategy

Phase 8 focuses on safe, practical offline support rather than pretending the whole app is offline-complete.

Currently improved:

- App shell is cached by the PWA service worker.
- Recent REST reads can be reused through runtime caching.
- An online/offline banner keeps status visible.
- Checklist toggles can be queued locally and replayed when connectivity returns.
- New expenses can be queued locally and replayed when connectivity returns.
- Itinerary reads and previously loaded trip screens remain more resilient after initial online access.

Intentionally limited:

- Private documents are not indiscriminately cached.
- Upload flows still require connectivity.
- Full offline mutation queues are not yet implemented for every feature.
- Conflict resolution is still last-write-wins for the currently queued lightweight mutations.

Next logical upgrade:

- expand queued sync to traveler and places edits
- selectively persist lightweight trip summaries in IndexedDB
- add richer conflict resolution and user review for replay failures
