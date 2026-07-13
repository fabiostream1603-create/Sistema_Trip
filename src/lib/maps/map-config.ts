export const DEFAULT_MAP_STYLE_URL =
  'https://tiles.openfreemap.org/styles/liberty'

export const MAP_STYLE_OPTIONS = [
  {
    id: 'liberty',
    label: 'Liberty',
    styleUrl: 'https://tiles.openfreemap.org/styles/liberty',
  },
  {
    id: 'positron',
    label: 'Positron',
    styleUrl: 'https://tiles.openfreemap.org/styles/positron',
  },
  {
    id: 'bright',
    label: 'Bright',
    styleUrl: 'https://tiles.openfreemap.org/styles/bright',
  },
] as const

export const MAP_STYLE_URL =
  import.meta.env.VITE_MAP_STYLE_URL || DEFAULT_MAP_STYLE_URL

export const DEFAULT_MAP_VIEW = {
  longitude: 12.4964,
  latitude: 41.9028,
  zoom: 4.4,
}

export const MAP_ATTRIBUTION =
  'OpenFreeMap © OpenMapTiles Data from OpenStreetMap'
