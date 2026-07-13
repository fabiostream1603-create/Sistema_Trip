import type { Session } from '@supabase/supabase-js'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '@/features/auth/ProtectedRoute'
import * as authModule from '@/features/auth/AuthProvider'
import * as supabaseModule from '@/supabase/client'

vi.mock('@/features/auth/AuthProvider', async () => {
  const actual = await vi.importActual<typeof authModule>('@/features/auth/AuthProvider')
  return {
    ...actual,
    useAuth: vi.fn(),
  }
})

describe('ProtectedRoute', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('redirects unauthenticated users to login', () => {
    vi.spyOn(supabaseModule, 'hasSupabaseEnv', 'get').mockReturnValue(true)
    vi.mocked(authModule.useAuth).mockReturnValue({
      isLoading: false,
      session: null,
    })

    render(
      <MemoryRouter initialEntries={['/trips']}>
        <Routes>
          <Route path="/login" element={<div>Login page</div>} />
          <Route
            path="/trips"
            element={
              <ProtectedRoute>
                <div>Secret page</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Login page')).toBeInTheDocument()
  })

  it('renders children for authenticated users', () => {
    vi.spyOn(supabaseModule, 'hasSupabaseEnv', 'get').mockReturnValue(true)
    vi.mocked(authModule.useAuth).mockReturnValue({
      isLoading: false,
      session: { user: { id: '1', email: 'fabio@example.com' } } as Session,
    })

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Secret page</div>
        </ProtectedRoute>
      </MemoryRouter>,
    )

    expect(screen.getByText('Secret page')).toBeInTheDocument()
  })
})
