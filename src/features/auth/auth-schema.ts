import { z } from 'zod'

export const loginSchema = z.object({
  email: z.email('Enter a valid email address.'),
  password: z
    .string()
    .min(8, 'Password must have at least 8 characters.'),
})

export type LoginValues = z.infer<typeof loginSchema>
