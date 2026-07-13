import { supabase } from '@/supabase/client'
import type {
  CreateExpenseInput,
  ExpenseCategory,
  ExpenseListItem,
  ExpensesPageData,
  FinancialSummary,
  TravelerBalance,
} from '@/types/expenses'

function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase credentials are missing.')
  }

  return supabase
}

export async function getTripExpensesData(tripId: string): Promise<ExpensesPageData> {
  const client = requireSupabase()
  const [
    categoriesResult,
    expensesResult,
    summaryResult,
    travelersResult,
    balancesResult,
  ] = await Promise.all([
    client
      .from('expense_categories')
      .select('*')
      .eq('trip_id', tripId)
      .order('position', { ascending: true }),
    client
      .from('expenses')
      .select(
        `
          *,
          expense_categories!inner(name),
          travelers!expenses_paid_by_traveler_id_fkey(name)
        `,
      )
      .eq('trip_id', tripId)
      .order('expense_date', { ascending: false }),
    client
      .from('trip_financial_summary')
      .select('*')
      .eq('trip_id', tripId)
      .maybeSingle(),
    client
      .from('travelers')
      .select('id, name')
      .eq('trip_id', tripId)
      .order('created_at', { ascending: true }),
    client
      .from('trip_member_balances')
      .select('*')
      .eq('trip_id', tripId),
  ])

  if (categoriesResult.error) throw categoriesResult.error
  if (expensesResult.error) throw expensesResult.error
  if (summaryResult.error) throw summaryResult.error
  if (travelersResult.error) throw travelersResult.error
  if (balancesResult.error) throw balancesResult.error

  const expenses: ExpenseListItem[] = (expensesResult.data ?? []).map((expense) => ({
    ...(expense as Record<string, unknown>),
    category_name: (expense.expense_categories as { name: string }).name,
    paid_by_name: (expense.travelers as { name: string }).name,
  })) as ExpenseListItem[]

  return {
    categories: (categoriesResult.data ?? []) as ExpenseCategory[],
    expenses,
    summary: (summaryResult.data ?? null) as FinancialSummary | null,
    travelers: (travelersResult.data ?? []) as Array<{ id: string; name: string }>,
    balances: (balancesResult.data ?? []) as TravelerBalance[],
  }
}

export async function createExpense(input: CreateExpenseInput) {
  const client = requireSupabase()

  const { data: expense, error: expenseError } = await client
    .from('expenses')
    .insert({
      base_currency: input.base_currency,
      base_amount: input.splits.reduce((sum, split) => sum + split.amount, 0),
      category_id: input.category_id,
      city: input.city,
      country: input.country,
      created_by: input.created_by,
      description: input.description,
      exchange_rate: input.exchange_rate,
      expense_date: input.expense_date,
      itinerary_item_id: input.itinerary_item_id || null,
      notes: input.notes,
      original_amount: input.original_amount,
      original_currency: input.original_currency,
      paid_by_traveler_id: input.paid_by_traveler_id,
      payment_method: input.payment_method,
      status: input.status,
      title: input.title,
      trip_id: input.trip_id,
    })
    .select('id')
    .single()

  if (expenseError) {
    throw expenseError
  }

  const { error: splitsError } = await client.from('expense_splits').insert(
    input.splits.map((split) => ({
      expense_id: expense.id,
      traveler_id: split.traveler_id,
      split_type: split.split_type,
      percentage: split.percentage ?? null,
      amount: split.amount,
      settlement_status: 'pending',
    })),
  )

  if (splitsError) {
    throw splitsError
  }

  return expense
}
