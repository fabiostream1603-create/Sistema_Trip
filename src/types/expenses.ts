import type { CurrencyCode } from '@/types/trips'

export type ExpenseStatus = 'planned' | 'paid' | 'reimbursed'
export type PaymentMethod = 'cash' | 'card' | 'pix' | 'transfer' | 'other'
export type SplitType = 'equal' | 'percentage' | 'amount' | 'individual'

export type ExpenseCategory = {
  id: string
  trip_id: string | null
  name: string
  icon: string
  is_system: boolean
  position: number
}

export type Expense = {
  id: string
  trip_id: string
  title: string
  description: string | null
  category_id: string
  itinerary_item_id: string | null
  paid_by_traveler_id: string
  expense_date: string
  status: ExpenseStatus
  payment_method: PaymentMethod
  original_amount: number
  original_currency: CurrencyCode
  exchange_rate: number
  base_amount: number
  base_currency: CurrencyCode
  city: string | null
  country: string | null
  notes: string | null
}

export type ExpenseSplit = {
  id: string
  expense_id: string
  traveler_id: string
  split_type: SplitType
  percentage: number | null
  amount: number
  settlement_status: 'pending' | 'settled'
}

export type FinancialSummary = {
  trip_id: string
  base_currency: CurrencyCode
  expenses_count: number
  total_spent: number
  total_planned: number
  total_paid: number
  budget_remaining: number
}

export type TravelerBalance = {
  trip_id: string
  traveler_id: string
  traveler_name: string
  balance_amount: number
  base_currency: CurrencyCode
}

export type ExpenseListItem = Expense & {
  category_name: string
  paid_by_name: string
}

export type ExpensesPageData = {
  categories: ExpenseCategory[]
  expenses: ExpenseListItem[]
  summary: FinancialSummary | null
  travelers: Array<{ id: string; name: string }>
  balances: TravelerBalance[]
}

export type CreateExpenseInput = {
  base_currency: CurrencyCode
  category_id: string
  city?: string
  country?: string
  created_by: string
  description?: string
  exchange_rate: number
  expense_date: string
  itinerary_item_id?: string
  notes?: string
  original_amount: number
  original_currency: CurrencyCode
  paid_by_traveler_id: string
  payment_method: PaymentMethod
  splits: Array<{
    amount: number
    percentage?: number
    split_type: SplitType
    traveler_id: string
  }>
  status: ExpenseStatus
  title: string
  trip_id: string
}
