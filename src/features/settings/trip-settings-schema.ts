import { z } from 'zod'

export const tripSettingsSchema = z
  .object({
    base_currency: z.enum(['EUR', 'BRL']),
    description: z.string().optional(),
    end_date: z.string().min(1, 'Choose an end date.'),
    name: z.string().min(2, 'Enter the trip name.'),
    start_date: z.string().min(1, 'Choose a start date.'),
    status: z.enum(['planning', 'booked', 'in_progress', 'completed', 'archived']),
    total_budget: z.union([
      z.literal(''),
      z.coerce.number().nonnegative('Budget must be zero or higher.'),
    ]),
  })
  .refine((values) => values.end_date >= values.start_date, {
    message: 'End date must be on or after the start date.',
    path: ['end_date'],
  })

export type TripSettingsValues = z.output<typeof tripSettingsSchema>
export type TripSettingsInputValues = z.input<typeof tripSettingsSchema>
