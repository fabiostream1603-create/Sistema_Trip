import { useMutation } from '@tanstack/react-query'
import { env } from '@/lib/env'
import { supabase } from '@/supabase/client'
import type { LoginValues } from './auth-schema'

export function useSignUp() {
  return useMutation({
    mutationFn: async (values: LoginValues) => {
      if (!supabase) {
        throw new Error('Supabase credentials are missing.')
      }

      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          emailRedirectTo: `${env.VITE_APP_URL}/login`,
        },
      })

      if (error) {
        throw error
      }

      return data
    },
  })
}
