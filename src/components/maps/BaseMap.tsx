import 'maplibre-gl/dist/maplibre-gl.css'
import type { ReactNode } from 'react'
import { useEffect, useMemo, useRef } from 'react'
import Map, { AttributionControl, NavigationControl } from 'react-map-gl/maplibre'
import type { MapRef, ViewState } from 'react-map-gl/maplibre'
import { DEFAULT_MAP_VIEW } from '@/lib/maps/map-config'
import { getMapProvider } from '@/lib/maps/map-provider'

type BaseMapProps = {
  children?: ReactNode
  className?: string
  interactive?: boolean
  onLoad?: (map: MapRef) => void
  onMoveEnd?: (viewState: ViewState) => void
}

export function BaseMap({
  children,
  className,
  interactive = true,
  onLoad,
  onMoveEnd,
}: BaseMapProps) {
  const mapRef = useRef<MapRef | null>(null)
  const provider = useMemo(() => getMapProvider(), [])

  useEffect(() => {
    if (mapRef.current && onLoad) {
      onLoad(mapRef.current)
    }
  }, [onLoad])

  return (
    <div className={className}>
      <Map
        attributionControl={false}
        cooperativeGestures
        dragRotate={false}
        initialViewState={DEFAULT_MAP_VIEW}
        mapStyle={provider.styleUrl}
        maxPitch={45}
        minZoom={2.5}
        ref={mapRef}
        style={{ width: '100%', height: '100%' }}
        touchZoomRotate={interactive}
        onMoveEnd={(event) => onMoveEnd?.(event.viewState)}
      >
        <AttributionControl compact customAttribution={provider.attribution} />
        <NavigationControl position="top-right" visualizePitch />
        {children}
      </Map>
    </div>
  )
}
