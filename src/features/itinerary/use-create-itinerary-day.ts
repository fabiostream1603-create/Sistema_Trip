import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createItineraryDay } from '@/services/itinerary/itinerary-service'

export function useCreateItineraryDay(tripId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createItineraryDay,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['trip-itinerary', tripId] }),
        queryClient.invalidateQueries({ queryKey: ['trip-dashboard', tripId] }),
      ])
    },
  })
}
