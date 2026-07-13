import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteDocument } from '@/services/documents/documents-service'

export function useDeleteDocument(tripId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteDocument,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['trip-documents', tripId] })
    },
  })
}
