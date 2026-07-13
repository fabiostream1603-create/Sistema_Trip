import { RouterProvider } from 'react-router-dom'
import { Toaster } from 'sonner'
import { OfflineBanner } from '@/components/offline/OfflineBanner'
import { AppProviders } from '@/app/providers'
import { router } from '@/app/router'

export function App() {
  return (
    <AppProviders>
      <OfflineBanner />
      <RouterProvider router={router} />
      <Toaster richColors position="top-center" />
    </AppProviders>
  )
}
