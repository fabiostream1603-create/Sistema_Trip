import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createTrip } from '@/services/trips/trips-service'

export function useCreateTrip() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createTrip,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['trips'] })
    },
  })
}
