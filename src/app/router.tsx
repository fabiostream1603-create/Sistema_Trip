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
import { TripDayItineraryPage } from '@/pages/trips/TripDayItineraryPage'
import { TripItineraryPage } from '@/pages/trips/TripItineraryPage'
import { TripMapPage } from '@/pages/trips/TripMapPage'
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
        element: (
          <PlaceholderPage
            title="Places"
            description="Saved places, favorites, and manual coordinate entry."
          />
        ),
      },
      {
        path: ':tripId/expenses',
        element: (
          <PlaceholderPage
            title="Expenses"
            description="Track budgets, real spending, and split logic."
          />
        ),
      },
      {
        path: ':tripId/expenses/new',
        element: (
          <PlaceholderPage
            title="New Expense"
            description="Quick mobile-first expense entry is planned next."
          />
        ),
      },
      {
        path: ':tripId/documents',
        element: (
          <PlaceholderPage
            title="Documents"
            description="Private document storage and previews land in later phases."
          />
        ),
      },
      {
        path: ':tripId/bookings',
        element: (
          <PlaceholderPage
            title="Bookings"
            description="Reservations, confirmation codes, and key details."
          />
        ),
      },
      {
        path: ':tripId/transports',
        element: (
          <PlaceholderPage
            title="Transport"
            description="Flights, ferries, trains, and transfers."
          />
        ),
      },
      {
        path: ':tripId/accommodations',
        element: (
          <PlaceholderPage
            title="Accommodations"
            description="Hotels, check-in times, and stay details."
          />
        ),
      },
      {
        path: ':tripId/checklists',
        element: (
          <PlaceholderPage
            title="Checklists"
            description="Packing, admin tasks, and traveler-specific prep lists."
          />
        ),
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
