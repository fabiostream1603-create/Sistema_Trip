import { CalendarDays, CircleDollarSign, FileText, Navigation } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const cards = [
  {
    label: 'Countdown',
    value: '434 days',
    icon: CalendarDays,
    helper: 'Until Italy & Greece 2026',
  },
  {
    label: 'Budget snapshot',
    value: 'EUR 0.00',
    icon: CircleDollarSign,
    helper: 'Connect expenses in Phase 5',
  },
  {
    label: 'Documents',
    value: '0 favorites',
    icon: FileText,
    helper: 'Private storage arrives in Phase 6',
  },
  {
    label: 'Map',
    value: 'Ready',
    icon: Navigation,
    helper: 'MapLibre integration planned in Phase 3',
  },
] as const

export function TripDashboardPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border bg-[linear-gradient(140deg,rgba(15,118,110,0.95),rgba(23,60,83,0.92),rgba(240,139,111,0.78))] px-6 py-8 text-white shadow-[var(--shadow-card)]">
        <p className="text-sm uppercase tracking-[0.35em] text-white/75">
          Trip dashboard
        </p>
        <h1 className="mt-4 max-w-xl font-serif text-4xl leading-tight">
          Italy and Greece 2026 starts with a stable foundation.
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-white/80">
          The shell is ready for dashboards, itinerary planning, maps, documents,
          and finances without repainting the architecture later.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, helper, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{label}</p>
                <div className="rounded-full bg-primary/10 p-2 text-primary">
                  <Icon className="size-5" />
                </div>
              </div>
              <p className="font-serif text-3xl">{value}</p>
              <p className="text-sm text-muted-foreground">{helper}</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  )
}
