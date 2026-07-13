import type { PropsWithChildren } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthProvider'
import { hasSupabaseEnv } from '@/supabase/client'

export function ProtectedRoute({ children }: PropsWithChildren) {
  const location = useLocation()
  const { isLoading, session } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    )
  }

  if (!hasSupabaseEnv) {
    return (
      <div className="mx-auto flex min-h-svh max-w-lg items-center px-6 text-center">
        <div className="rounded-3xl border bg-card p-8 shadow-[var(--shadow-card)]">
          <h1 className="font-serif text-3xl">Supabase not configured</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to start using
            protected routes.
          </p>
        </div>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <>{children}</>
}
