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
          <p className="text-sm uppercase tracking-[0.3em] text-primary">New expense</p>
          <h1 className="font-serif text-4xl">Supabase connection required</h1>
          <p className="max-w-2xl text-muted-foreground">
            Configure the env values and run the migrations before creating expenses.
          </p>
        </CardContent>
      </Card>
    )
  }

  return <NewExpenseForm tripId={tripId} />
}
