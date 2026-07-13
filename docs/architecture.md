# Architecture

Phase 1 establishes a frontend-first modular structure with clear boundaries:

- `app`: bootstrapping, providers, router, global styles
- `features/auth`: auth orchestration and protected routing
- `components`: reusable UI and layout primitives
- `pages`: route-level composition
- `lib`: utility helpers and configuration parsing
- `supabase`: client bootstrap only, with no secrets committed

This keeps Phase 2 database work and Phase 3 map work additive rather than invasive.
