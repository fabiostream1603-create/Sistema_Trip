import { z } from 'zod'

export const profileSettingsSchema = z.object({
  avatar_url: z
    .string()
    .optional()
    .refine((value) => !value || /^https?:\/\//.test(value), 'Use a full URL starting with http:// or https://.'),
  full_name: z.string().min(2, 'Enter your display name.'),
  locale: z.string().min(2, 'Enter a locale.'),
  preferred_currency: z.enum(['EUR', 'BRL']),
  preferred_navigation_app: z.enum(['apple_maps', 'google_maps', 'waze']),
  theme: z.enum(['light', 'dark', 'system']),
  timezone: z.string().min(2, 'Enter a timezone.'),
})

export type ProfileSettingsValues = z.output<typeof profileSettingsSchema>
export type ProfileSettingsInputValues = z.input<typeof profileSettingsSchema>
