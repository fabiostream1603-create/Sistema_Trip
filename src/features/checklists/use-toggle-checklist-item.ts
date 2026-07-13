import { useMutation, useQueryClient } from '@tanstack/react-query'
import { runOrQueueOfflineMutation } from '@/lib/offline/mutation-queue'
import { toggleChecklistItem } from '@/services/checklists/checklists-service'
import type { ChecklistWithItems } from '@/types/checklists'

export function useToggleChecklistItem(tripId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: Parameters<typeof toggleChecklistItem>[0]) =>
      runOrQueueOfflineMutation({
        execute: () => toggleChecklistItem(input),
        mutation: {
          payload: input,
          type: 'checklist.toggle',
        },
      }),
    onMutate: async (input) => {
      const queryKey = ['trip-checklists', tripId] as const
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<ChecklistWithItems[]>(queryKey)

      queryClient.setQueryData<ChecklistWithItems[]>(queryKey, (current) =>
        current?.map((entry) => {
          if (!entry.items.some((item) => item.id === input.checklistItemId)) {
            return entry
          }

          const items = entry.items.map((item) =>
            item.id === input.checklistItemId
              ? {
                  ...item,
                  completed_at: input.isCompleted ? new Date().toISOString() : null,
                  completed_by: input.isCompleted ? input.completedBy : null,
                  is_completed: input.isCompleted,
                }
              : item,
          )
          const completedCount = items.filter((item) => item.is_completed).length

          return {
            ...entry,
            items,
            progress: items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0,
          }
        }),
      )

      return { previous, queryKey }
    },
    onError: (_error, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(context.queryKey, context.previous)
      }
    },
    onSuccess: async (result) => {
      if (!result.queued) {
        await queryClient.invalidateQueries({ queryKey: ['trip-checklists', tripId] })
      }
    },
  })
}
