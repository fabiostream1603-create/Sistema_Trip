import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createTraveler } from '@/services/travelers/travelers-service'

export function useCreateTraveler(tripId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createTraveler,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['trip-travelers', tripId] }),
        queryClient.invalidateQueries({ queryKey: ['trip-dashboard', tripId] }),
        queryClient.invalidateQueries({ queryKey: ['trip-expenses', tripId] }),
      ])
    },
  })
}
