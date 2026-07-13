import { z } from 'zod'

const envSchema = z.object({
  VITE_SUPABASE_URL: z.url().optional().or(z.literal('')),
  VITE_SUPABASE_ANON_KEY: z.string().optional(),
  VITE_APP_NAME: z.string().default('Voyage Hub'),
  VITE_APP_URL: z.string().default('http://localhost:5173'),
  VITE_MAP_STYLE_URL: z.string().default('https://tiles.openfreemap.org/styles/liberty'),
})

export const env = envSchema.parse(import.meta.env)
