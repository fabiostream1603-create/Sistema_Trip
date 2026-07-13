import { useParams } from 'react-router-dom'
import { NewExpenseForm } from '@/components/forms/NewExpenseForm'
import { hasSupabaseEnv } from '@/supabase/client'
import { Card, CardContent } from '@/components/ui/card'

export function NewExpensePage() {
  const { tripId = '' } = useParams()

  if (!hasSupabaseEnv) {
    return (
      <Card>
        <CardContent className="space-y-3 p-8">
          <p className="text-sm uppercase tracking-[0.3em] text-primary">Novo gasto</p>
          <h1 className="font-serif text-4xl">Conexao com Supabase obrigatoria</h1>
          <p className="max-w-2xl text-muted-foreground">
            Configure as variaveis do ambiente e rode as migrations antes de criar gastos.
          </p>
        </CardContent>
      </Card>
    )
  }

  return <NewExpenseForm tripId={tripId} />
}
