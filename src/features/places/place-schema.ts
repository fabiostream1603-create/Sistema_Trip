import { z } from 'zod'

const placeCategories = [
  'restaurant',
  'attraction',
  'beach',
  'pharmacy',
  'hospital',
  'shopping',
  'viewpoint',
  'activity',
  'other',
] as const

const placeStatuses = ['saved', 'must_visit', 'visited', 'skipped'] as const

export const placeFormSchema = z.object({
  address: z.string().optional(),
  category: z.enum(placeCategories),
  city: z.string().optional(),
  country: z.string().optional(),
  destination_id: z.string().optional(),
  is_favorite: z.boolean(),
  latitude: z.coerce
    .number()
    .min(-90, 'Latitude must be at least -90.')
    .max(90, 'Latitude must be at most 90.'),
  longitude: z.coerce
    .number()
    .min(-180, 'Longitude must be at least -180.')
    .max(180, 'Longitude must be at most 180.'),
  notes: z.string().optional(),
  phone: z.string().optional(),
  price_level: z.union([
    z.literal(''),
    z.coerce.number().int().min(1, 'Choose a price level from 1 to 4.').max(4, 'Choose a price level from 1 to 4.'),
  ]),
  title: z.string().min(2, 'Enter a short place name.'),
  visit_status: z.enum(placeStatuses),
  website_url: z
    .string()
    .optional()
    .refine((value) => !value || /^https?:\/\//.test(value), 'Use a full URL starting with http:// or https://.'),
})

export type PlaceFormValues = z.output<typeof placeFormSchema>
export type PlaceFormInputValues = z.input<typeof placeFormSchema>
