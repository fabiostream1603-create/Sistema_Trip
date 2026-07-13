import {
  haversineDistanceInKm,
  isValidCoordinates,
  parseCoordinatesInput,
} from '@/lib/maps/coordinates'

describe('map coordinates', () => {
  it('validates latitude and longitude ranges', () => {
    expect(isValidCoordinates({ latitude: 41.9028, longitude: 12.4964 })).toBe(true)
    expect(isValidCoordinates({ latitude: 100, longitude: 12.4964 })).toBe(false)
  })

  it('parses raw coordinates and map links', () => {
    expect(parseCoordinatesInput('41.9028, 12.4964')).toEqual({
      latitude: 41.9028,
      longitude: 12.4964,
    })
    expect(
      parseCoordinatesInput(
        'https://www.google.com/maps/place/Rome/@41.9028,12.4964,14z',
      ),
    ).toEqual({
      latitude: 41.9028,
      longitude: 12.4964,
    })
  })

  it('calculates haversine distance', () => {
    const distance = haversineDistanceInKm(
      { latitude: 41.9028, longitude: 12.4964 },
      { latitude: 40.6263, longitude: 14.3758 },
    )

    expect(distance).toBeGreaterThan(210)
    expect(distance).toBeLessThan(220)
  })
})
