import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updatePlace } from '@/services/places/places-service'

export function useUpdatePlace(tripId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updatePlace,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['trip-places', tripId] })
    },
  })
}
