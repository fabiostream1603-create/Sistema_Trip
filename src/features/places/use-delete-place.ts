import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deletePlace } from '@/services/places/places-service'

export function useDeletePlace(tripId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deletePlace,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['trip-places', tripId] })
    },
  })
}
