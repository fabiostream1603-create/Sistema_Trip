import { z } from 'zod'

export const expenseFormSchema = z.object({
  category_id: z.string().min(1, 'Choose a category.'),
  city: z.string().optional(),
  country: z.string().optional(),
  expense_date: z.string().min(1, 'Choose a date.'),
  exchange_rate: z.coerce.number().positive('Exchange rate must be greater than zero.'),
  notes: z.string().optional(),
  original_amount: z.coerce.number().nonnegative('Amount must be zero or higher.'),
  original_currency: z.enum(['EUR', 'BRL']),
  paid_by_traveler_id: z.string().min(1, 'Choose who paid.'),
  payment_method: z.enum(['cash', 'card', 'pix', 'transfer', 'other']),
  status: z.enum(['planned', 'paid', 'reimbursed']),
  title: z.string().min(2, 'Enter a short expense title.'),
})

export type ExpenseFormValues = z.output<typeof expenseFormSchema>
export type ExpenseFormInputValues = z.input<typeof expenseFormSchema>
