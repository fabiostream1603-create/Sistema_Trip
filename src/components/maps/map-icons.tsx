import {
  Activity,
  BadgePlus,
  BedDouble,
  BusFront,
  Cross,
  Landmark,
  MapPin,
  Mountain,
  Plane,
  ShoppingBag,
  ShipWheel,
  Soup,
  TrainFront,
  Waves,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { MapCategory } from '@/components/maps/types'

export const mapCategoryMeta: Record<
  MapCategory,
  { icon: LucideIcon; label: string; markerClassName: string }
> = {
  accommodation: {
    icon: BedDouble,
    label: 'Hospedagem',
    markerClassName: 'bg-sky-100 text-sky-700 border-sky-200',
  },
  restaurant: {
    icon: Soup,
    label: 'Restaurante',
    markerClassName: 'bg-orange-100 text-orange-700 border-orange-200',
  },
  attraction: {
    icon: Landmark,
    label: 'Atracao',
    markerClassName: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  beach: {
    icon: Waves,
    label: 'Praia',
    markerClassName: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  },
  airport: {
    icon: Plane,
    label: 'Aeroporto',
    markerClassName: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  port: {
    icon: ShipWheel,
    label: 'Porto',
    markerClassName: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  train_station: {
    icon: TrainFront,
    label: 'Estacao de trem',
    markerClassName: 'bg-violet-100 text-violet-700 border-violet-200',
  },
  bus_station: {
    icon: BusFront,
    label: 'Rodoviaria',
    markerClassName: 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200',
  },
  pharmacy: {
    icon: Cross,
    label: 'Farmacia',
    markerClassName: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
  hospital: {
    icon: Cross,
    label: 'Hospital',
    markerClassName: 'bg-red-100 text-red-700 border-red-200',
  },
  shopping: {
    icon: ShoppingBag,
    label: 'Shopping',
    markerClassName: 'bg-pink-100 text-pink-700 border-pink-200',
  },
  viewpoint: {
    icon: Mountain,
    label: 'Mirante',
    markerClassName: 'bg-lime-100 text-lime-700 border-lime-200',
  },
  activity: {
    icon: Activity,
    label: 'Atividade',
    markerClassName: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  },
  other: {
    icon: BadgePlus,
    label: 'Outro',
    markerClassName: 'bg-stone-100 text-stone-700 border-stone-200',
  },
  destination: {
    icon: MapPin,
    label: 'Destino',
    markerClassName: 'bg-primary/15 text-primary border-primary/30',
  },
}
