import type { Destination } from '@/types/trips'

export type Coordinates = {
  latitude: number
  longitude: number
}

export function isValidLatitude(latitude: number) {
  return Number.isFinite(latitude) && latitude >= -90 && latitude <= 90
}

export function isValidLongitude(longitude: number) {
  return Number.isFinite(longitude) && longitude >= -180 && longitude <= 180
}

export function isValidCoordinates(
  coordinates: Partial<Coordinates> | null | undefined,
): coordinates is Coordinates {
  return Boolean(
    coordinates &&
      isValidLatitude(coordinates.latitude ?? Number.NaN) &&
      isValidLongitude(coordinates.longitude ?? Number.NaN),
  )
}

export function toLngLat(coordinates: Coordinates) {
  return [coordinates.longitude, coordinates.latitude] as [number, number]
}

export function destinationToCoordinates(destination: Destination) {
  if (
    destination.latitude === null ||
    destination.longitude === null ||
    !isValidCoordinates({
      latitude: destination.latitude,
      longitude: destination.longitude,
    })
  ) {
    return null
  }

  return {
    latitude: destination.latitude,
    longitude: destination.longitude,
  }
}

export function haversineDistanceInKm(origin: Coordinates, destination: Coordinates) {
  const earthRadiusKm = 6371
  const dLat = degreesToRadians(destination.latitude - origin.latitude)
  const dLon = degreesToRadians(destination.longitude - origin.longitude)
  const lat1 = degreesToRadians(origin.latitude)
  const lat2 = degreesToRadians(destination.latitude)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return earthRadiusKm * c
}

export function parseCoordinatesInput(input: string) {
  const trimmed = input.trim()
  const coordinatePattern =
    /(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/u

  const directMatch = trimmed.match(coordinatePattern)
  if (directMatch) {
    return normalizeCoordinateMatch(directMatch[1], directMatch[2])
  }

  const googleMatch = trimmed.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/u)
  if (googleMatch) {
    return normalizeCoordinateMatch(googleMatch[1], googleMatch[2])
  }

  const appleMatch = trimmed.match(/[?&](?:ll|sll|near)=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/u)
  if (appleMatch) {
    return normalizeCoordinateMatch(appleMatch[1], appleMatch[2])
  }

  return null
}

function normalizeCoordinateMatch(latitudeLike: string, longitudeLike: string) {
  const latitude = Number(latitudeLike)
  const longitude = Number(longitudeLike)

  if (!isValidCoordinates({ latitude, longitude })) {
    return null
  }

  return { latitude, longitude }
}

function degreesToRadians(value: number) {
  return (value * Math.PI) / 180
}
