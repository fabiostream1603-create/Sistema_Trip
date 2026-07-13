import { useMutation, useQueryClient } from '@tanstack/react-query'
import { runOrQueueOfflineMutation } from '@/lib/offline/mutation-queue'
import { createExpense } from '@/services/expenses/expenses-service'

export function useCreateExpense(tripId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: Parameters<typeof createExpense>[0]) =>
      runOrQueueOfflineMutation({
        execute: () => createExpense(input),
        mutation: {
          payload: input,
          type: 'expense.create',
        },
      }),
    onSuccess: async (result) => {
      if (!result.queued) {
        await queryClient.invalidateQueries({ queryKey: ['trip-expenses', tripId] })
      }
    },
  })
}
