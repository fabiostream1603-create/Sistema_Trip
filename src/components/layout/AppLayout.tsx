import { CalendarRange, FileText, MapPinned, Plus, Receipt, Settings, Users } from 'lucide-react'
import type { PropsWithChildren } from 'react'
import { NavLink, useParams } from 'react-router-dom'
import { AddMenu } from '@/components/navigation/AddMenu'
import { BottomNav } from '@/components/navigation/BottomNav'
import { TopBar } from '@/components/navigation/TopBar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const tripDesktopNavItems = [
  { label: 'Painel', path: 'dashboard', icon: MapPinned },
  { label: 'Roteiro', path: 'itinerary', icon: CalendarRange },
  { label: 'Gastos', path: 'expenses', icon: Receipt },
  { label: 'Documentos', path: 'documents', icon: FileText },
  { label: 'Viajantes', path: 'travelers', icon: Users },
  { label: 'Ajustes', path: 'settings', icon: Settings },
] as const

export function AppLayout({ children }: PropsWithChildren) {
  const { tripId } = useParams()

  return (
    <div className="app-shell min-h-svh">
      <div className="mx-auto flex min-h-svh max-w-7xl flex-col px-4 pb-8 pt-4 sm:px-6 lg:px-8">
        <TopBar />
        {tripId ? (
          <div className="mt-4 hidden items-center justify-between gap-4 rounded-[2rem] border bg-background/80 px-4 py-3 shadow-[var(--shadow-card)] md:flex">
            <nav className="flex flex-wrap gap-2">
              {tripDesktopNavItems.map(({ label, path, icon: Icon }) => (
                <NavLink
                  key={path}
                  to={`/trips/${tripId}/${path}`}
                  className={({ isActive }) =>
                    cn(
                      'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted',
                      isActive && 'bg-primary text-primary-foreground',
                    )
                  }
                >
                  <Icon className="size-4" />
                  {label}
                </NavLink>
              ))}
            </nav>

            <AddMenu
              trigger={
                <Button>
                  <Plus className="size-4" />
                  Adicionar
                </Button>
              }
            />
          </div>
        ) : null}
        <main className="mt-6 flex-1">{children}</main>
      </div>
      {tripId ? (
        <div className="fixed bottom-24 right-4 z-40 md:hidden">
          <AddMenu
            trigger={
              <Button size="icon" className="size-14 shadow-[var(--shadow-card)]">
                <Plus className="size-6" />
                <span className="sr-only">Open add menu</span>
              </Button>
            }
          />
        </div>
      ) : null}
      <BottomNav />
    </div>
  )
}
