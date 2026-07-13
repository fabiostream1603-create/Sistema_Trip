# Database

Phase 2 adds the first real database layer in `supabase/migrations/20260712234500_phase2_core_schema.sql`.

Included now:

- `profiles`
- `trips`
- `trip_members`
- `travelers`
- `destinations`
- `itinerary_days`
- `itinerary_items`
- `expense_categories`
- `expenses`
- `expense_splits`
- `documents`
- `bookings`
- `transport_segments`
- `accommodations`
- `set_updated_at()` trigger helper
- `handle_new_user_profile()` auth trigger
- `is_trip_member()`, `owns_trip()`, and `has_trip_role()`
- RLS enabled on every public table created in this phase
- dashboard and future-facing placeholder views

Seed guidance lives in `supabase/seed.sql` and expects real Auth users to exist first.
