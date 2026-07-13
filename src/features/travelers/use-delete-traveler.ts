import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteTraveler } from '@/services/travelers/travelers-service'

export function useDeleteTraveler(tripId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteTraveler,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['trip-travelers', tripId] }),
        queryClient.invalidateQueries({ queryKey: ['trip-dashboard', tripId] }),
        queryClient.invalidateQueries({ queryKey: ['trip-expenses', tripId] }),
      ])
    },
  })
}
