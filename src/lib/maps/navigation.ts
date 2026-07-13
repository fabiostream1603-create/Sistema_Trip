import { isValidCoordinates } from '@/lib/maps/coordinates'

export type NavigationProvider = 'apple_maps' | 'google_maps' | 'waze'

type OpenExternalNavigationArgs = {
  label?: string
  latitude: number
  longitude: number
  provider: NavigationProvider
}

export function buildExternalNavigationUrl({
  provider,
  latitude,
  longitude,
  label,
}: OpenExternalNavigationArgs) {
  if (!isValidCoordinates({ latitude, longitude })) {
    throw new Error('Invalid coordinates for external navigation.')
  }

  const coords = `${latitude},${longitude}`
  const encodedCoords = encodeURIComponent(coords)
  const encodedLabel = label ? encodeURIComponent(label) : undefined

  switch (provider) {
    case 'apple_maps':
      return encodedLabel
        ? `https://maps.apple.com/?daddr=${encodedCoords}&q=${encodedLabel}`
        : `https://maps.apple.com/?daddr=${encodedCoords}`
    case 'google_maps':
      return encodedLabel
        ? `https://www.google.com/maps/dir/?api=1&destination=${encodedCoords}&query=${encodedLabel}`
        : `https://www.google.com/maps/dir/?api=1&destination=${encodedCoords}`
    case 'waze':
      return `https://waze.com/ul?ll=${encodedCoords}&navigate=yes`
    default:
      return assertNever(provider)
  }
}

export function openExternalNavigation(args: OpenExternalNavigationArgs) {
  const url = buildExternalNavigationUrl(args)
  window.open(url, '_blank', 'noopener,noreferrer')
}

export function getPreferredNavigationProvider(userAgent = navigator.userAgent) {
  return /iPhone|iPad|iPod/iu.test(userAgent) ? 'apple_maps' : 'google_maps'
}

function assertNever(value: never): never {
  throw new Error(`Unsupported navigation provider: ${String(value)}`)
}
