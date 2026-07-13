import { Receipt, Wallet } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useTripExpenses } from '@/features/expenses/use-trip-expenses'
import { formatMoney } from '@/lib/currency/money'
import { hasSupabaseEnv } from '@/supabase/client'

export function TripExpensesPage() {
  const { tripId = '' } = useParams()
  const expensesQuery = useTripExpenses(tripId)

  if (!hasSupabaseEnv) {
    return (
      <StateCard
        title="Conexao com Supabase obrigatoria"
        body="Configure as variaveis do ambiente e rode as migrations antes de usar os gastos."
      />
    )
  }

  if (expensesQuery.isLoading) {
    return (
      <div className="grid gap-4">
        <div className="h-48 animate-pulse rounded-[2rem] border bg-muted/50" />
        <div className="h-40 animate-pulse rounded-[2rem] border bg-muted/50" />
      </div>
    )
  }

  if (expensesQuery.isError || !expensesQuery.data) {
    return (
      <StateCard
        title="Nao foi possivel carregar os gastos"
        body={
          expensesQuery.error instanceof Error
            ? expensesQuery.error.message
            : 'Os dados financeiros da viagem nao puderam ser carregados.'
        }
      />
    )
  }

  const { expenses, summary, balances } = expensesQuery.data

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border bg-[linear-gradient(140deg,rgba(15,118,110,0.95),rgba(23,60,83,0.92),rgba(240,139,111,0.78))] px-6 py-8 text-white shadow-[var(--shadow-card)]">
        <p className="text-sm uppercase tracking-[0.35em] text-white/75">Gastos</p>
        <h1 className="mt-4 max-w-2xl font-serif text-4xl leading-tight">
          Orcamento compartilhado, gastos reais e saldos entre viajantes
        </h1>
        <div className="mt-5">
          <Button asChild variant="secondary">
            <Link to={`/trips/${tripId}/expenses/new`}>Novo gasto</Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total gasto"
          value={summary ? formatMoney(summary.total_spent, summary.base_currency) : '--'}
        />
        <SummaryCard
          label="Planejado"
          value={summary ? formatMoney(summary.total_planned, summary.base_currency) : '--'}
        />
        <SummaryCard
          label="Pago"
          value={summary ? formatMoney(summary.total_paid, summary.base_currency) : '--'}
        />
        <SummaryCard
          label="Restante"
          value={summary ? formatMoney(summary.budget_remaining, summary.base_currency) : '--'}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2 text-primary">
                  <Receipt className="size-5" />
                </div>
                <div>
                  <h2 className="font-serif text-2xl">Lancamentos</h2>
                  <p className="text-sm text-muted-foreground">
                    Custos reais e previstos na moeda base da viagem.
                  </p>
                </div>
              </div>
            </div>

            {expenses.length > 0 ? (
              <div className="space-y-3">
                {expenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between rounded-[1.5rem] border px-4 py-4"
                  >
                    <div>
                      <p className="font-medium">{expense.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {expense.category_name} - {expense.paid_by_name} - {expense.expense_date}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {expense.city && expense.country
                          ? `${expense.city}, ${expense.country}`
                          : expense.country ?? 'Local nao definido'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {formatMoney(expense.base_amount, expense.base_currency)}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.25em] text-muted-foreground">
                        {expense.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum gasto lancado ainda.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-2 text-primary">
                <Wallet className="size-5" />
              </div>
              <div>
                <h2 className="font-serif text-2xl">Saldos dos viajantes</h2>
                <p className="text-sm text-muted-foreground">
                  Valor positivo significa que a pessoa adiantou mais do que a propria parte.
                </p>
              </div>
            </div>

            {balances.length > 0 ? (
              <div className="space-y-3">
                {balances.map((balance) => (
                  <div
                    key={balance.traveler_id}
                    className="flex items-center justify-between rounded-[1.5rem] border px-4 py-4"
                  >
                    <p className="font-medium">{balance.traveler_name}</p>
                    <p className="font-semibold">
                      {formatMoney(balance.balance_amount, balance.base_currency)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum saldo disponivel ainda.</p>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="space-y-2 p-6">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-serif text-3xl">{value}</p>
      </CardContent>
    </Card>
  )
}

function StateCard({ body, title }: { body: string; title: string }) {
  return (
    <Card>
      <CardContent className="space-y-3 p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-primary">Gastos</p>
        <h1 className="font-serif text-4xl">{title}</h1>
        <p className="max-w-2xl text-muted-foreground">{body}</p>
      </CardContent>
    </Card>
  )
}
