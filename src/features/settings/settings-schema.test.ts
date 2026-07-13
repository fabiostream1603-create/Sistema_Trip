import { describe, expect, it } from 'vitest'
import { profileSettingsSchema } from '@/features/settings/profile-schema'
import { tripSettingsSchema } from '@/features/settings/trip-settings-schema'

describe('settings schemas', () => {
  it('accepts valid profile settings', () => {
    const result = profileSettingsSchema.safeParse({
      full_name: 'Fabio',
      locale: 'pt-BR',
      preferred_currency: 'EUR',
      preferred_navigation_app: 'google_maps',
      theme: 'system',
      timezone: 'America/Sao_Paulo',
    })

    expect(result.success).toBe(true)
  })

  it('rejects a trip with an inverted date range', () => {
    const result = tripSettingsSchema.safeParse({
      base_currency: 'EUR',
      end_date: '2026-09-01',
      name: 'Italy',
      start_date: '2026-09-10',
      status: 'planning',
      total_budget: '1200',
    })

    expect(result.success).toBe(false)
  })
})
