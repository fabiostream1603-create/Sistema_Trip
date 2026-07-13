import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createItineraryItem } from '@/services/itinerary/itinerary-service'

export function useCreateItineraryItem(tripId: string, date: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createItineraryItem,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['trip-itinerary', tripId] }),
        queryClient.invalidateQueries({ queryKey: ['trip-day-itinerary', tripId, date] }),
      ])
    },
  })
}
