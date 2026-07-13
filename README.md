# Voyage Hub

Voyage Hub is a travel planning application for shared itineraries, expenses, documents, and maps. This repository now contains the complete Phase 1 foundation requested for a production-minded React + TypeScript + Supabase app.

## Current scope

- React 19 + Vite + TypeScript strict
- Tailwind CSS v4 and shadcn/ui-compatible setup
- Supabase Auth, PostgreSQL, Storage, and private document workflows
- Trips, itinerary, expenses, documents, bookings, transports, accommodations, and checklists
- MapLibre + OpenFreeMap integration with external navigation helpers
- Mobile-first application shell, bottom navigation, and quick-add sheet
- PWA with install guidance, update prompt, online/offline banner, and runtime caching for trip APIs
- ESLint, Prettier, Vitest, React Testing Library

## Scripts

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run test:coverage`

## Environment

Copy `.env.example` to `.env` and fill in:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_APP_NAME`
- `VITE_APP_URL`
- `VITE_MAP_STYLE_URL`

Do not add service role keys, passwords, or any private credentials to the frontend.

## Architecture

- `src/app`: app composition, router, providers, global styles
- `src/components`: shared UI, layout, forms, navigation
- `src/features/auth`: auth state, route protection, validation
- `src/pages`: route-level screens
- `src/lib`: shared utilities and env parsing
- `src/supabase`: Supabase client bootstrap
- `src/test`: test setup

## Setup flow

1. Create the Supabase project and add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
2. Configure Supabase Auth email/password and redirect URLs.
3. Run all SQL migrations in `supabase/migrations`.
4. Optionally run `supabase/seed.sql` after creating your test Auth users.
5. Start the app with `npm run dev`.

## Current status

The project now includes the main Phase 1-8 foundations requested so far. Remaining big product areas are traveler management polish, settings, places CRUD, and deeper offline sync behavior.
