import { z } from 'zod'

export const expenseFormSchema = z.object({
  category_id: z.string().min(1, 'Escolha uma categoria.'),
  city: z.string().optional(),
  country: z.string().optional(),
  expense_date: z.string().min(1, 'Escolha a data do gasto.'),
  exchange_rate: z.coerce.number().positive('A taxa de cambio precisa ser maior que zero.'),
  notes: z.string().optional(),
  original_amount: z.coerce.number().nonnegative('O valor precisa ser zero ou maior.'),
  original_currency: z.enum(['EUR', 'BRL']),
  paid_by_traveler_id: z.string().min(1, 'Escolha quem pagou.'),
  payment_method: z.enum(['cash', 'card', 'pix', 'transfer', 'other']),
  status: z.enum(['planned', 'paid', 'reimbursed']),
  title: z.string().min(2, 'Informe um titulo curto para o gasto.'),
})

export type ExpenseFormValues = z.output<typeof expenseFormSchema>
export type ExpenseFormInputValues = z.input<typeof expenseFormSchema>
