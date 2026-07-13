import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateTripSettings } from '@/services/settings/settings-service'

export function useUpdateTripSettings(tripId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateTripSettings,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['trip-settings', tripId] }),
        queryClient.invalidateQueries({ queryKey: ['trip-dashboard', tripId] }),
        queryClient.invalidateQueries({ queryKey: ['trips'] }),
      ])
    },
  })
}
