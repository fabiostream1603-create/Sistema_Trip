import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateTraveler } from '@/services/travelers/travelers-service'

export function useUpdateTraveler(tripId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateTraveler,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['trip-travelers', tripId] }),
        queryClient.invalidateQueries({ queryKey: ['trip-dashboard', tripId] }),
        queryClient.invalidateQueries({ queryKey: ['trip-expenses', tripId] }),
      ])
    },
  })
}
