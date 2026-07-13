import { Plus } from 'lucide-react'
import type { PropsWithChildren } from 'react'
import { AddMenu } from '@/components/navigation/AddMenu'
import { BottomNav } from '@/components/navigation/BottomNav'
import { TopBar } from '@/components/navigation/TopBar'
import { Button } from '@/components/ui/button'

export function AppLayout({ children }: PropsWithChildren) {
  return (
    <div className="app-shell min-h-svh">
      <div className="mx-auto flex min-h-svh max-w-7xl flex-col px-4 pb-8 pt-4 sm:px-6 lg:px-8">
        <TopBar />
        <main className="mt-6 flex-1">{children}</main>
      </div>
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
      <BottomNav />
    </div>
  )
}
