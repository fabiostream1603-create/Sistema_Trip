import type { ReactNode } from 'react'
import { FileText, MapPin, Receipt, SquareCheckBig, Waypoints } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

const items = [
  {
    label: 'New expense',
    icon: Receipt,
    segment: 'expenses/new',
  },
  {
    label: 'New activity',
    icon: Waypoints,
    segment: 'itinerary',
  },
  {
    label: 'New place',
    icon: MapPin,
    segment: 'places',
  },
  {
    label: 'New document',
    icon: FileText,
    segment: 'documents',
  },
  {
    label: 'New checklist',
    icon: SquareCheckBig,
    segment: 'checklists',
  },
] as const

export function AddMenu({ trigger }: { trigger: ReactNode }) {
  const { tripId = 'demo-trip' } = useParams()

  return (
    <Sheet>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="bottom" className="sm:max-w-lg">
        <SheetTitle className="font-serif text-2xl">Add something quickly</SheetTitle>
        <SheetDescription className="mt-2 text-sm text-muted-foreground">
          Mobile-first shortcuts for the most common travel updates.
        </SheetDescription>
        <div className="mt-6 grid gap-3">
          {items.map(({ label, icon: Icon, segment }) => (
            <Link
              key={label}
              className="flex items-center gap-3 rounded-2xl border px-4 py-4 transition hover:bg-muted"
              to={`/trips/${tripId}/${segment}`}
            >
              <div className="rounded-full bg-primary/10 p-3 text-primary">
                <Icon className="size-5" />
              </div>
              <span className="font-medium">{label}</span>
            </Link>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}
