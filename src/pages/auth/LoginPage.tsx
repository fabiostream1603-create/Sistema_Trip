import { Link } from 'react-router-dom'
import { LoginForm } from '@/components/forms/LoginForm'

export function LoginPage() {
  return (
    <div className="relative min-h-svh overflow-hidden px-4 py-8 sm:px-6">
      <div className="mx-auto grid min-h-[calc(100svh-4rem)] max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="flex flex-col justify-between rounded-[2rem] border bg-[linear-gradient(160deg,rgba(15,118,110,0.92),rgba(17,72,84,0.88),rgba(240,139,111,0.82))] p-8 text-white shadow-[var(--shadow-card)]">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-white/80">
              Voyage Hub
            </p>
            <h2 className="mt-6 max-w-lg font-serif text-5xl leading-tight">
              A premium travel command center for Italy and Greece.
            </h2>
            <p className="mt-4 max-w-md text-white/80">
              Built for shared itineraries, document safety, smart budgeting, and
              calm mobile access while you are on the move.
            </p>
          </div>
          <div className="grid gap-3 text-sm text-white/85 sm:grid-cols-3">
            <FeaturePill label="PWA on iPhone" />
            <FeaturePill label="Secure Supabase Auth" />
            <FeaturePill label="Offline-ready shell" />
          </div>
        </section>

        <section className="flex items-center">
          <div className="w-full">
            <LoginForm />
            <div className="mt-4 flex items-center justify-between px-2 text-sm text-muted-foreground">
              <Link className="hover:text-foreground" to="/forgot-password">
                Forgot password?
              </Link>
              <Link className="hover:text-foreground" to="/install">
                Install on iPhone
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

function FeaturePill({ label }: { label: string }) {
  return (
    <div className="rounded-full border border-white/20 bg-white/10 px-4 py-3 text-center backdrop-blur">
      {label}
    </div>
  )
}
