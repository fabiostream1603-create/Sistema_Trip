import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function LandingPage() {
  return (
    <div className="mx-auto flex min-h-svh max-w-6xl items-center px-4 py-8 sm:px-6">
      <Card className="w-full overflow-hidden">
        <CardContent className="grid gap-10 p-8 lg:grid-cols-[1.2fr_0.8fr] lg:p-12">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-primary">
              Voyage Hub
            </p>
            <h1 className="mt-5 max-w-xl font-serif text-5xl leading-tight">
              Um centro de controle leve para roteiro, documentos, gastos e mapa.
            </h1>
            <p className="mt-5 max-w-2xl text-muted-foreground">
              A base do app ja entrega autenticacao segura, rotas protegidas,
              layout mobile-first, suporte a tema e instalacao como PWA no iPhone.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/login">Abrir login</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/install">Guia de instalacao</Link>
              </Button>
            </div>
          </div>
          <div className="grid gap-4">
            {[
              'React 19 + TypeScript strict + Vite',
              'Cliente Supabase e autenticacao',
              'Rotas protegidas e navegacao mobile',
              'Base com Tailwind v4 + shadcn/ui',
            ].map((item) => (
              <div key={item} className="rounded-[1.75rem] border bg-muted/50 p-5">
                {item}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
