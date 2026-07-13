import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toggleChecklistItem } from '@/services/checklists/checklists-service'

export function useToggleChecklistItem(tripId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: toggleChecklistItem,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['trip-checklists', tripId] })
    },
  })
}
