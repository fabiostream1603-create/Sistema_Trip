import {
  buildExternalNavigationUrl,
  getPreferredNavigationProvider,
} from '@/lib/maps/navigation'

describe('map navigation helpers', () => {
  it('builds Apple Maps and Waze URLs', () => {
    expect(
      buildExternalNavigationUrl({
        provider: 'apple_maps',
        latitude: 41.9028,
        longitude: 12.4964,
      }),
    ).toBe('https://maps.apple.com/?daddr=41.9028%2C12.4964')

    expect(
      buildExternalNavigationUrl({
        provider: 'waze',
        latitude: 41.9028,
        longitude: 12.4964,
      }),
    ).toBe('https://waze.com/ul?ll=41.9028%2C12.4964&navigate=yes')
  })

  it('prefers Apple Maps on iPhone user agents', () => {
    expect(
      getPreferredNavigationProvider(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)',
      ),
    ).toBe('apple_maps')
    expect(getPreferredNavigationProvider('Mozilla/5.0 (Windows NT 10.0; Win64; x64)')).toBe(
      'google_maps',
    )
  })
})
