import { MAP_ATTRIBUTION, MAP_STYLE_OPTIONS, MAP_STYLE_URL } from '@/lib/maps/map-config'

export type MapProvider = {
  attribution: string
  name: 'openfreemap'
  styleOptions: Array<{
    id: string
    label: string
    styleUrl: string
  }>
  styleUrl: string
}

export function getMapProvider(): MapProvider {
  const selectedStyle =
    MAP_STYLE_OPTIONS.find((option) => option.styleUrl === MAP_STYLE_URL)?.styleUrl ??
    MAP_STYLE_URL

  return {
    name: 'openfreemap',
    styleUrl: selectedStyle,
    styleOptions: [...MAP_STYLE_OPTIONS],
    attribution: MAP_ATTRIBUTION,
  }
}
