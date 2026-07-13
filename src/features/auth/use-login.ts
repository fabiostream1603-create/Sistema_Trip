import { useMutation } from '@tanstack/react-query'
import { supabase } from '@/supabase/client'
import type { LoginValues } from './auth-schema'

export function useLogin() {
  return useMutation({
    mutationFn: async (values: LoginValues) => {
      if (!supabase) {
        throw new Error('Supabase credentials are missing.')
      }

      const { error } = await supabase.auth.signInWithPassword(values)

      if (error) {
        throw error
      }
    },
  })
}
