import type { ReactNode } from 'react'
import { CalendarRange, Home, MoreHorizontal, Receipt, Route } from 'lucide-react'
import { NavLink, useParams } from 'react-router-dom'
import { cn } from '@/lib/utils'

const baseItems = [
  { label: 'Home', icon: Home, path: 'dashboard' },
  { label: 'Itinerary', icon: CalendarRange, path: 'itinerary' },
  { label: 'Expenses', icon: Receipt, path: 'expenses' },
  { label: 'More', icon: MoreHorizontal, path: 'settings' },
] as const

export function BottomNav() {
  const { tripId = 'demo-trip' } = useParams()

  return (
    <nav className="glass-panel fixed inset-x-3 bottom-3 z-40 rounded-[2rem] border p-2 shadow-[var(--shadow-card)] md:hidden">
      <ul className="grid grid-cols-5 items-center gap-1">
        {baseItems.slice(0, 2).map(({ label, icon: Icon, path }) => (
          <li key={label}>
            <BottomNavLink to={`/trips/${tripId}/${path}`} label={label}>
              <Icon className="size-5" />
            </BottomNavLink>
          </li>
        ))}
        <li>
          <div className="flex justify-center">
            <div className="rounded-full bg-primary/10 p-3 text-primary">
              <Route className="size-5" />
            </div>
          </div>
        </li>
        {baseItems.slice(2).map(({ label, icon: Icon, path }) => (
          <li key={label}>
            <BottomNavLink to={`/trips/${tripId}/${path}`} label={label}>
              <Icon className="size-5" />
            </BottomNavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

type BottomNavLinkProps = {
  children: ReactNode
  label: string
  to: string
}

function BottomNavLink({ children, label, to }: BottomNavLinkProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium text-muted-foreground transition',
          isActive && 'bg-primary text-primary-foreground',
        )
      }
    >
      {children}
      <span>{label}</span>
    </NavLink>
  )
}
