import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateProfileSettings } from '@/services/settings/settings-service'
import type { UpdateProfileSettingsInput } from '@/types/settings'

export function useUpdateProfileSettings(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateProfileSettingsInput) => updateProfileSettings(userId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['profile-settings', userId] })
    },
  })
}
