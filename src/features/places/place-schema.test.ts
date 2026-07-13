import { describe, expect, it } from 'vitest'
import { placeFormSchema } from '@/features/places/place-schema'

describe('placeFormSchema', () => {
  it('accepts a valid place payload', () => {
    const result = placeFormSchema.safeParse({
      category: 'restaurant',
      is_favorite: true,
      latitude: '41.8902',
      longitude: '12.4922',
      price_level: '3',
      title: 'Roscioli',
      visit_status: 'must_visit',
      website_url: 'https://example.com',
    })

    expect(result.success).toBe(true)
  })

  it('rejects invalid coordinates and malformed URLs', () => {
    const result = placeFormSchema.safeParse({
      category: 'other',
      is_favorite: false,
      latitude: '200',
      longitude: '12.4922',
      title: 'Broken place',
      visit_status: 'saved',
      website_url: 'example.com',
    })

    expect(result.success).toBe(false)
  })
})
