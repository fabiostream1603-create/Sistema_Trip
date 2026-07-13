import { useMutation, useQueryClient } from '@tanstack/react-query'
import { uploadTripDocument } from '@/services/documents/documents-service'

export function useUploadDocument(tripId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      onProgress,
      ...input
    }: Parameters<typeof uploadTripDocument>[0] & { onProgress?: (value: number) => void }) =>
      uploadTripDocument(input, onProgress),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['trip-documents', tripId] })
    },
  })
}
