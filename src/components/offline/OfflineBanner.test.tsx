import { render, screen } from '@testing-library/react'
import { OfflineBanner } from '@/components/offline/OfflineBanner'

vi.mock('@/features/offline/use-network-status', () => ({
  useNetworkStatus: () => false,
}))

vi.mock('@/features/offline/use-pwa-updater', () => ({
  usePwaUpdater: () => ({
    needRefresh: [false],
    updateServiceWorker: vi.fn(),
  }),
}))

describe('OfflineBanner', () => {
  it('renders offline message when network is unavailable', () => {
    render(<OfflineBanner />)
    expect(screen.getByText(/Voce esta offline/i)).toBeInTheDocument()
  })
})
