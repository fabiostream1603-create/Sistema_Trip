# Voyage Hub

Voyage Hub is a travel planning application for shared itineraries, expenses, documents, and maps. This repository now contains the complete Phase 1 foundation requested for a production-minded React + TypeScript + Supabase app.

## Phase 1 scope

- React 19 + Vite + TypeScript strict
- Tailwind CSS v4 and shadcn/ui-compatible setup
- React Router with protected internal routes
- Supabase client wiring and auth provider
- Functional login screen using Supabase Auth
- TanStack Query provider
- Mobile-first application shell with bottom navigation and quick-add sheet
- PWA base configuration with install guide for iPhone
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

The wider directory structure for future phases is documented below and partially pre-created through placeholder modules and route stubs.

## Next steps

1. Create the Supabase project and add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
2. Configure Supabase Auth email/password and redirect URLs.
3. Start Phase 2 with migrations, RLS, trip membership, and the first real trip data flow.
