import { Copy, ExternalLink } from 'lucide-react'
import { Popup } from 'react-map-gl/maplibre'
import { toast } from 'sonner'
import { mapCategoryMeta } from '@/components/maps/map-icons'
import type { MapPoint, NavigationAction } from '@/components/maps/types'
import { buildExternalNavigationUrl } from '@/lib/maps/navigation'

type MapPopupProps = {
  navigationActions: NavigationAction[]
  onClose: () => void
  point: MapPoint
}

export function MapPopup({
  navigationActions,
  onClose,
  point,
}: MapPopupProps) {
  const meta = mapCategoryMeta[point.category]
  const Icon = meta.icon

  async function copyText(value: string, successMessage: string) {
    await navigator.clipboard.writeText(value)
    toast.success(successMessage)
  }

  return (
    <Popup
      anchor="top"
      closeButton={false}
      closeOnClick={false}
      latitude={point.latitude}
      longitude={point.longitude}
      maxWidth="320px"
      offset={18}
      onClose={onClose}
    >
      <div className="space-y-4 p-1">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-primary/10 p-2 text-primary">
              <Icon className="size-4" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                {meta.label}
              </p>
              <h3 className="font-semibold">{point.title}</h3>
            </div>
          </div>
          {point.subtitle ? (
            <p className="mt-3 text-sm text-muted-foreground">{point.subtitle}</p>
          ) : null}
          {point.notes ? (
            <p className="mt-2 text-sm text-muted-foreground">{point.notes}</p>
          ) : null}
          {point.dateLabel ? (
            <p className="mt-2 text-xs font-medium text-primary">{point.dateLabel}</p>
          ) : null}
        </div>

        <div className="grid gap-2">
          {navigationActions.map((action) => (
            <a
              key={action.provider}
              className="flex items-center justify-between rounded-2xl border px-3 py-2 text-sm transition hover:bg-muted"
              href={buildExternalNavigationUrl({
                provider: action.provider,
                latitude: point.latitude,
                longitude: point.longitude,
                label: point.navigationLabel ?? point.title,
              })}
              rel="noreferrer"
              target="_blank"
            >
              <span>{action.label}</span>
              <ExternalLink className="size-4" />
            </a>
          ))}

          <button
            className="flex items-center justify-between rounded-2xl border px-3 py-2 text-sm transition hover:bg-muted"
            type="button"
            onClick={() =>
              copyText(
                `${point.latitude}, ${point.longitude}`,
                'Coordinates copied.',
              )
            }
          >
            <span>Copy coordinates</span>
            <Copy className="size-4" />
          </button>
        </div>
      </div>
    </Popup>
  )
}
