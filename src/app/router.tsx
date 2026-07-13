import {
  createBrowserRouter,
  Navigate,
  Outlet,
} from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from '@/features/auth/ProtectedRoute'
import { LoginPage } from '@/pages/auth/LoginPage'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage'
import { InstallPage } from '@/pages/InstallPage'
import { LandingPage } from '@/pages/LandingPage'
import { PlaceholderPage } from '@/pages/PlaceholderPage'
import { NewExpensePage } from '@/pages/trips/NewExpensePage'
import { TripAccommodationsPage } from '@/pages/trips/TripAccommodationsPage'
import { TripBookingsPage } from '@/pages/trips/TripBookingsPage'
import { TripChecklistsPage } from '@/pages/trips/TripChecklistsPage'
import { TripDayItineraryPage } from '@/pages/trips/TripDayItineraryPage'
import { TripDocumentsPage } from '@/pages/trips/TripDocumentsPage'
import { TripExpensesPage } from '@/pages/trips/TripExpensesPage'
import { TripItineraryPage } from '@/pages/trips/TripItineraryPage'
import { TripMapPage } from '@/pages/trips/TripMapPage'
import { TripPlacesPage } from '@/pages/trips/TripPlacesPage'
import { TripTransportsPage } from '@/pages/trips/TripTransportsPage'
import { TripsPage } from '@/pages/trips/TripsPage'
import { TripDashboardPage } from '@/pages/trips/TripDashboardPage'

function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <Outlet />
      </AppLayout>
    </ProtectedRoute>
  )
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/reset-password',
    element: <ResetPasswordPage />,
  },
  {
    path: '/install',
    element: <InstallPage />,
  },
  {
    path: '/onboarding',
    element: (
      <ProtectedRoute>
        <PlaceholderPage
          title="Onboarding"
          description="Prepare your first trip, travelers, and preferences."
        />
      </ProtectedRoute>
    ),
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <PlaceholderPage
          title="Profile"
          description="Personal profile, theme, currency, and navigation preferences."
        />
      </ProtectedRoute>
    ),
  },
  {
    path: '/trips',
    element: <ProtectedLayout />,
    children: [
      {
        index: true,
        element: <TripsPage />,
      },
      {
        path: ':tripId',
        element: <Navigate to="dashboard" replace />,
      },
      {
        path: ':tripId/dashboard',
        element: <TripDashboardPage />,
      },
      {
        path: ':tripId/itinerary',
        element: <TripItineraryPage />,
      },
      {
        path: ':tripId/itinerary/:date',
        element: <TripDayItineraryPage />,
      },
      {
        path: ':tripId/map',
        element: <TripMapPage />,
      },
      {
        path: ':tripId/places',
        element: <TripPlacesPage />,
      },
      {
        path: ':tripId/expenses',
        element: <TripExpensesPage />,
      },
      {
        path: ':tripId/expenses/new',
        element: <NewExpensePage />,
      },
      {
        path: ':tripId/documents',
        element: <TripDocumentsPage />,
      },
      {
        path: ':tripId/bookings',
        element: <TripBookingsPage />,
      },
      {
        path: ':tripId/transports',
        element: <TripTransportsPage />,
      },
      {
        path: ':tripId/accommodations',
        element: <TripAccommodationsPage />,
      },
      {
        path: ':tripId/checklists',
        element: <TripChecklistsPage />,
      },
      {
        path: ':tripId/travelers',
        element: (
          <PlaceholderPage
            title="Travelers"
            description="Manage travelers, roles, and expense split identities."
          />
        ),
      },
      {
        path: ':tripId/settings',
        element: (
          <PlaceholderPage
            title="Trip Settings"
            description="Permissions, preferences, and trip-level configuration."
          />
        ),
      },
    ],
  },
])
