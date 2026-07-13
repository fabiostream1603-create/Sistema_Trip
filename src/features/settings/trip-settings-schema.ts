import { z } from 'zod'

export const tripSettingsSchema = z
  .object({
    base_currency: z.enum(['EUR', 'BRL']),
    description: z.string().optional(),
    end_date: z.string().min(1, 'Escolha a data final.'),
    name: z.string().min(2, 'Informe o nome da viagem.'),
    start_date: z.string().min(1, 'Escolha a data inicial.'),
    status: z.enum(['planning', 'booked', 'in_progress', 'completed', 'archived']),
    total_budget: z.union([
      z.literal(''),
      z.coerce.number().nonnegative('O orcamento precisa ser zero ou maior.'),
    ]),
  })
  .refine((values) => values.end_date >= values.start_date, {
    message: 'A data final precisa ser igual ou posterior a data inicial.',
    path: ['end_date'],
  })

export type TripSettingsValues = z.output<typeof tripSettingsSchema>
export type TripSettingsInputValues = z.input<typeof tripSettingsSchema>
