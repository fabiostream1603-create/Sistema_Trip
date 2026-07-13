import { Smartphone } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const steps = [
  'Open Voyage Hub in Safari on your iPhone.',
  'Tap the Share button in the Safari toolbar.',
  'Choose "Add to Home Screen".',
  'Confirm the name and tap "Add".',
] as const

export function InstallPage() {
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
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
