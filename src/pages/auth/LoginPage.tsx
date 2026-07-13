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
              Seu centro de controle de viagens para planejar tudo em um so lugar.
            </h2>
            <p className="mt-4 max-w-md text-white/80">
              Planeje roteiro, documentos, gastos e detalhes importantes com
              acesso facil no celular durante toda a viagem.
            </p>
          </div>
          <div className="grid gap-3 text-sm text-white/85 sm:grid-cols-3">
            <FeaturePill label="PWA no iPhone" />
            <FeaturePill label="Login seguro com Supabase" />
            <FeaturePill label="Base pronta para offline" />
          </div>
        </section>

        <section className="flex items-center">
          <div className="w-full">
            <LoginForm />
            <div className="mt-4 flex items-center justify-between px-2 text-sm text-muted-foreground">
              <Link className="hover:text-foreground" to="/forgot-password">
                Esqueceu a senha?
              </Link>
              <Link className="hover:text-foreground" to="/install">
                Instalar no iPhone
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
