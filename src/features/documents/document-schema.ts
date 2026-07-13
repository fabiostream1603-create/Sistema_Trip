import { z } from 'zod'

export const documentFormSchema = z.object({
  category: z.enum([
    'passport',
    'ticket',
    'booking',
    'insurance',
    'receipt',
    'identity',
    'health',
    'other',
  ]),
  description: z.string().optional(),
  expiration_date: z.string().optional(),
  is_favorite: z.boolean().default(false),
  issue_date: z.string().optional(),
  offline_priority: z.boolean().default(false),
  title: z.string().min(2, 'Informe um titulo para o documento.'),
  traveler_id: z.string().optional(),
})

export type DocumentFormValues = z.output<typeof documentFormSchema>
export type DocumentFormInputValues = z.input<typeof documentFormSchema>
