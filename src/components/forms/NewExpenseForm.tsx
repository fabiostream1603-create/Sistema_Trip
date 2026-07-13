import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { Calculator, CreditCard, MapPinned, Wallet } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  expenseFormSchema,
  type ExpenseFormInputValues,
  type ExpenseFormValues,
} from '@/features/expenses/expense-schema'
import { useCreateExpense } from '@/features/expenses/use-create-expense'
import { useAuth } from '@/features/auth/AuthProvider'
import { buildEqualSplits } from '@/lib/currency/splits'
import { convertToBaseCurrency } from '@/lib/currency/money'
import { getTripExpensesData } from '@/services/expenses/expenses-service'
import type { CurrencyCode } from '@/types/trips'

export function NewExpenseForm({ tripId }: { tripId: string }) {
  const { session } = useAuth()
  const navigate = useNavigate()
  const createExpenseMutation = useCreateExpense(tripId)
  const dataQuery = useQuery({
    queryKey: ['trip-expenses-form', tripId],
    queryFn: () => getTripExpensesData(tripId),
  })

  const form = useForm<ExpenseFormInputValues, undefined, ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      category_id: '',
      city: '',
      country: '',
      expense_date: new Date().toISOString().slice(0, 10),
      exchange_rate: 1,
      notes: '',
      original_amount: 0,
      original_currency: 'EUR',
      paid_by_traveler_id: '',
      payment_method: 'card',
      status: 'paid',
      title: '',
    },
  })

  useEffect(() => {
    if (!dataQuery.data) {
      return
    }

    const firstCategory = dataQuery.data.categories[0]
    const firstTraveler = dataQuery.data.travelers[0]
    if (firstCategory) {
      form.setValue('category_id', firstCategory.id)
    }
    if (firstTraveler) {
      form.setValue('paid_by_traveler_id', firstTraveler.id)
    }
  }, [dataQuery.data, form])

  function handleDestinationSuggestionChange(destinationId: string) {
    const destination = dataQuery.data?.destinations.find((entry) => entry.id === destinationId)

    if (!destination) {
      return
    }

    form.setValue('city', destination.city)
    form.setValue('country', destination.country)
  }

  const splitPreview = useMemo(() => {
    const travelerCount = dataQuery.data?.travelers.length ?? 0
    const amount = Number(form.watch('original_amount') ?? 0)
    const exchangeRate = Number(form.watch('exchange_rate') ?? 1)

    if (travelerCount === 0) {
      return 0
    }

    return convertToBaseCurrency(amount, exchangeRate) / travelerCount
  }, [dataQuery.data?.travelers.length, form])

  async function onSubmit(values: ExpenseFormValues) {
    if (!dataQuery.data || !session?.user.id) {
      toast.error('Nao foi possivel validar os dados do gasto agora.')
      return
    }

    const baseCurrency = dataQuery.data.summary?.base_currency ?? 'EUR'
    const baseAmount = convertToBaseCurrency(
      values.original_amount,
      values.exchange_rate,
    )
    const equalSplits = buildEqualSplits(
      dataQuery.data.travelers.map((traveler) => traveler.id),
      baseAmount,
    )

    try {
      const result = await createExpenseMutation.mutateAsync({
        base_currency: baseCurrency as CurrencyCode,
        category_id: values.category_id,
        city: values.city,
        country: values.country,
        created_by: session.user.id,
        exchange_rate: values.exchange_rate,
        expense_date: values.expense_date,
        notes: values.notes,
        original_amount: values.original_amount,
        original_currency: values.original_currency,
        paid_by_traveler_id: values.paid_by_traveler_id,
        payment_method: values.payment_method,
        splits: equalSplits.map((split) => ({
          traveler_id: split.traveler_id,
          amount: split.amount,
          split_type: 'equal',
        })),
        status: values.status,
        title: values.title,
        trip_id: tripId,
        description: undefined,
      })

      toast.success(
        result.queued
          ? 'Gasto salvo offline. Ele sera sincronizado quando a conexao voltar.'
          : 'Gasto criado com sucesso.',
      )
      navigate(`/trips/${tripId}/expenses`)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Nao foi possivel salvar o gasto agora.',
      )
    }
  }

  if (dataQuery.isLoading) {
    return <div className="h-80 animate-pulse rounded-[2rem] border bg-muted/50" />
  }

  if (dataQuery.isError || !dataQuery.data) {
    return (
      <Card>
        <CardContent className="space-y-3 p-8">
          <h1 className="font-serif text-3xl">Formulario de gasto indisponivel</h1>
          <p className="text-sm text-muted-foreground">
            {dataQuery.error instanceof Error
              ? dataQuery.error.message
              : 'Nao foi possivel carregar categorias e viajantes.'}
          </p>
        </CardContent>
      </Card>
    )
  }

  if (dataQuery.data.categories.length === 0 || dataQuery.data.travelers.length === 0) {
    return (
      <Card>
        <CardContent className="space-y-3 p-8">
          <h1 className="font-serif text-3xl">Faltam dados para lancar gastos</h1>
          <p className="text-sm text-muted-foreground">
            Antes de registrar gastos, confirme se a viagem tem pelo menos um
            viajante e categorias financeiras cadastradas.
          </p>
        </CardContent>
      </Card>
    )
  }

  const baseCurrency = dataQuery.data.summary?.base_currency ?? 'EUR'
  const baseAmount = convertToBaseCurrency(
    Number(form.watch('original_amount') ?? 0),
    Number(form.watch('exchange_rate') ?? 1),
  )

  return (
    <Card>
      <CardContent className="space-y-6 p-6">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-primary">
            Novo gasto
          </p>
          <h1 className="mt-2 font-serif text-4xl">Lancamento rapido de gasto</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Registre quanto foi gasto, quem pagou, em qual moeda e em que cidade
            da viagem isso aconteceu.
          </p>
        </div>

        <form className="grid gap-5 md:grid-cols-2" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-3 md:col-span-2 md:grid-cols-3">
            <SummaryTile
              icon={<Wallet className="size-4" />}
              label="Moeda base"
              value={baseCurrency}
            />
            <SummaryTile
              icon={<CreditCard className="size-4" />}
              label="Viajantes no rateio"
              value={`${dataQuery.data.travelers.length}`}
            />
            <SummaryTile
              icon={<Calculator className="size-4" />}
              label="Previsao por pessoa"
              value={`${baseCurrency} ${splitPreview.toFixed(2)}`}
            />
          </div>

          <div className="rounded-[1.5rem] border bg-muted/20 p-4 md:col-span-2">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-2 text-primary">
                <MapPinned className="size-5" />
              </div>
              <div>
                <h2 className="font-serif text-2xl">Onde esse gasto aconteceu?</h2>
                <p className="text-sm text-muted-foreground">
                  Selecione uma cidade da viagem para preencher local e pais automaticamente.
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <Field>
                <Label htmlFor="destination_suggestion">Cidade da viagem</Label>
                <select
                  className="h-12 rounded-2xl border border-border bg-background px-4 text-sm outline-none"
                  id="destination_suggestion"
                  defaultValue=""
                  onChange={(event) => handleDestinationSuggestionChange(event.target.value)}
                >
                  <option value="">Selecionar cidade</option>
                  {dataQuery.data.destinations.map((destination) => (
                    <option key={destination.id} value={destination.id}>
                      {destination.city}, {destination.country}
                    </option>
                  ))}
                </select>
              </Field>

              <Field>
                <Label htmlFor="city">Cidade</Label>
                <Input id="city" {...form.register('city')} />
              </Field>

              <Field>
                <Label htmlFor="country">Pais</Label>
                <Input id="country" {...form.register('country')} />
              </Field>
            </div>
          </div>

          <div className="rounded-[1.5rem] border bg-background p-4 md:col-span-2">
            <h2 className="font-serif text-2xl">Informacoes do gasto</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Defina titulo, categoria, data e quem realizou o pagamento.
            </p>

            <div className="grid gap-5 md:grid-cols-2">
              <Field>
                <Label htmlFor="title">Titulo</Label>
                <Input id="title" placeholder="Ex.: Airbnb em Roma" {...form.register('title')} />
                <ErrorText message={form.formState.errors.title?.message} />
              </Field>

              <Field>
                <Label htmlFor="expense_date">Data</Label>
                <Input id="expense_date" type="date" {...form.register('expense_date')} />
                <ErrorText message={form.formState.errors.expense_date?.message} />
              </Field>

              <Field>
                <Label htmlFor="category_id">Categoria</Label>
                <select
                  className="h-12 rounded-2xl border border-border bg-background px-4 text-sm outline-none"
                  id="category_id"
                  {...form.register('category_id')}
                >
                  {dataQuery.data.categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <ErrorText message={form.formState.errors.category_id?.message} />
              </Field>

              <Field>
                <Label htmlFor="paid_by_traveler_id">Pago por</Label>
                <select
                  className="h-12 rounded-2xl border border-border bg-background px-4 text-sm outline-none"
                  id="paid_by_traveler_id"
                  {...form.register('paid_by_traveler_id')}
                >
                  {dataQuery.data.travelers.map((traveler) => (
                    <option key={traveler.id} value={traveler.id}>
                      {traveler.name}
                    </option>
                  ))}
                </select>
                <ErrorText message={form.formState.errors.paid_by_traveler_id?.message} />
              </Field>

              <Field>
                <Label htmlFor="status">Status</Label>
                <select
                  className="h-12 rounded-2xl border border-border bg-background px-4 text-sm outline-none"
                  id="status"
                  {...form.register('status')}
                >
                  <option value="planned">Planejado</option>
                  <option value="paid">Pago</option>
                  <option value="reimbursed">Reembolsado</option>
                </select>
              </Field>

              <Field>
                <Label htmlFor="payment_method">Forma de pagamento</Label>
                <select
                  className="h-12 rounded-2xl border border-border bg-background px-4 text-sm outline-none"
                  id="payment_method"
                  {...form.register('payment_method')}
                >
                  <option value="card">Cartao</option>
                  <option value="cash">Dinheiro</option>
                  <option value="pix">Pix</option>
                  <option value="transfer">Transferencia</option>
                  <option value="other">Outro</option>
                </select>
              </Field>
            </div>
          </div>

          <div className="rounded-[1.5rem] border bg-background p-4 md:col-span-2">
            <h2 className="font-serif text-2xl">Valores e conversao</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Informe o valor pago na moeda original. O app converte para a moeda base da viagem.
            </p>

            <div className="grid gap-5 md:grid-cols-2">
              <Field>
                <Label htmlFor="original_amount">Valor original</Label>
                <Input id="original_amount" step="0.01" type="number" {...form.register('original_amount')} />
                <ErrorText message={form.formState.errors.original_amount?.message} />
              </Field>

              <Field>
                <Label htmlFor="original_currency">Moeda original</Label>
                <select
                  className="h-12 rounded-2xl border border-border bg-background px-4 text-sm outline-none"
                  id="original_currency"
                  {...form.register('original_currency')}
                >
                  <option value="EUR">EUR</option>
                  <option value="BRL">BRL</option>
                </select>
              </Field>

              <Field>
                <Label htmlFor="exchange_rate">Taxa de cambio</Label>
                <Input id="exchange_rate" step="0.000001" type="number" {...form.register('exchange_rate')} />
                <ErrorText message={form.formState.errors.exchange_rate?.message} />
              </Field>

              <div className="rounded-[1.25rem] border bg-muted/20 px-4 py-3 text-sm">
                <p className="font-medium">Conversao estimada</p>
                <p className="mt-1 text-muted-foreground">
                  {baseCurrency} {baseAmount.toFixed(2)} na moeda base da viagem.
                </p>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <Field>
              <Label htmlFor="notes">Observacoes</Label>
              <textarea
                className="min-h-28 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none"
                id="notes"
                {...form.register('notes')}
              />
            </Field>
          </div>

          <div className="md:col-span-2 flex justify-end">
            <Button disabled={createExpenseMutation.isPending} type="submit">
              Salvar gasto
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function Field({ children }: { children: React.ReactNode }) {
  return <div className="space-y-2">{children}</div>
}

function ErrorText({ message }: { message?: string }) {
  return message ? <p className="text-sm text-destructive">{message}</p> : null
}

function SummaryTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="rounded-[1.25rem] border bg-muted/20 px-4 py-3">
      <div className="flex items-center gap-2 text-sm text-primary">
        {icon}
        <span>{label}</span>
      </div>
      <p className="mt-2 font-serif text-2xl">{value}</p>
    </div>
  )
}
