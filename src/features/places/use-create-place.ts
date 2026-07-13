import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createPlace } from '@/services/places/places-service'

export function useCreatePlace(tripId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createPlace,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['trip-places', tripId] })
    },
  })
}
