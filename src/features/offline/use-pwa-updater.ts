import { useRegisterSW } from 'virtual:pwa-register/react'

export function usePwaUpdater() {
  const updateState = useRegisterSW({
    immediate: true,
  })

  return updateState
}
