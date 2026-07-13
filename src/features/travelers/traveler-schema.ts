import { z } from 'zod'

export const travelerFormSchema = z.object({
  avatar_url: z
    .string()
    .optional()
    .refine((value) => !value || /^https?:\/\//.test(value), 'Use a full URL starting with http:// or https://.'),
  color_identifier: z.string().min(2, 'Choose a short color tag or identifier.'),
  email: z
    .string()
    .optional()
    .refine((value) => !value || z.email().safeParse(value).success, 'Enter a valid email address.'),
  linked_user_id: z.string().optional(),
  name: z.string().min(2, 'Enter the traveler name.'),
})

export type TravelerFormValues = z.output<typeof travelerFormSchema>
export type TravelerFormInputValues = z.input<typeof travelerFormSchema>
