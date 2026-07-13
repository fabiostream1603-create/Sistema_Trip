# Security

Guardrails already in place:

- no service role usage in the frontend
- environment-based Supabase bootstrap
- protected routes for internal navigation
- no credentials committed to the repository

Upcoming Phase 2 items:

- public schema RLS for the core trip tables
- membership and role SQL helpers
- private storage policies

Implemented in Phase 2:

- `profiles`, `trips`, `trip_members`, `travelers`, and `destinations` all have RLS enabled
- trip access is gated through `is_trip_member()`
- owner/editor checks are enforced through `owns_trip()` and `has_trip_role()`
- the frontend still uses only the anon key, never the service role
