import { Download, Smartphone, WifiOff } from 'lucide-react'
import { useNetworkStatus } from '@/features/offline/use-network-status'
import { Card, CardContent } from '@/components/ui/card'

const steps = [
  'Open Voyage Hub in Safari on your iPhone.',
  'Tap the Share button in the Safari toolbar.',
  'Choose "Add to Home Screen".',
  'Confirm the name and tap "Add".',
] as const

export function InstallPage() {
  const isOnline = useNetworkStatus()

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Card className="overflow-hidden">
        <CardContent className="grid gap-8 p-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] bg-primary/10 p-8 text-primary">
            <Smartphone className="size-12" />
            <h1 className="mt-6 font-serif text-4xl text-foreground">
              Install on iPhone
            </h1>
            <p className="mt-4 text-sm text-muted-foreground">
              Voyage Hub is configured as a Progressive Web App so it can live on
              the home screen and open like a native trip companion.
            </p>
            <div className="mt-6 rounded-[1.5rem] border bg-background px-4 py-4 text-sm text-foreground">
              <div className="flex items-center gap-2">
                {isOnline ? <Download className="size-4 text-primary" /> : <WifiOff className="size-4 text-primary" />}
                <span>{isOnline ? 'Online now' : 'Offline right now'}</span>
              </div>
              <p className="mt-2 text-muted-foreground">
                The app shell, recent itinerary data, checklists, and core trip views are prepared for offline-first usage. Sensitive documents are not blindly cached.
              </p>
            </div>
          </div>
          <div>
            <ol className="space-y-4">
              {steps.map((step, index) => (
                <li
                  key={step}
                  className="flex gap-4 rounded-2xl border bg-background px-4 py-5"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    {index + 1}
                  </div>
                  <p className="pt-1">{step}</p>
                </li>
              ))}
            </ol>
            <p className="mt-6 text-sm text-muted-foreground">
              For the best install experience, keep the app online at least once
              so the shell and service worker can finish initial caching.
            </p>
            <div className="mt-6 rounded-[1.5rem] border bg-muted/40 p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">What works better offline</p>
              <p className="mt-2">App shell, recent itinerary, next activities, checklist state, and previously loaded summaries stay accessible. New syncs resume when the connection returns.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
