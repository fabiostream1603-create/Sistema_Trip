import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createExpense } from '@/services/expenses/expenses-service'

export function useCreateExpense(tripId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createExpense,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['trip-expenses', tripId] })
    },
  })
}
