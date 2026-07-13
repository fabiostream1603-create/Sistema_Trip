import { describe, expect, it } from 'vitest'
import { shouldQueueOfflineMutation } from '@/lib/offline/mutation-queue'

describe('shouldQueueOfflineMutation', () => {
  it('returns true for common fetch failures', () => {
    expect(shouldQueueOfflineMutation(new Error('Failed to fetch'))).toBe(true)
  })

  it('returns false for non-network errors', () => {
    expect(shouldQueueOfflineMutation(new Error('permission denied'))).toBe(false)
  })
})
