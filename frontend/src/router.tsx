import { createBrowserRouter, Navigate } from 'react-router-dom'
import { LoginPage } from './views/LoginPage'
import { AdminLoginPage } from './views/AdminLoginPage'
import { TransactionsPage } from './views/TransactionsPage'
import { useAuth } from './modules/auth/AuthContext'
import { CallbackPage } from './views/CallbackPage'
import { DetailPage } from './views/DetailPage'
import { useEffect } from 'react'
import { toast, Toaster } from 'react-hot-toast'

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated, loading } = useAuth()
  // Avoid redirect during initial hydration
  if (loading) return null
  if (!isAuthenticated) return <Navigate to="/" replace />
  return children
}

function RoleProtectedRoute({ children, requiredRole }: { children: JSX.Element; requiredRole?: string }) {
  const { isAuthenticated, loading, user } = useAuth()
  if (loading) return null
  if (!isAuthenticated) return <Navigate to="/admin" replace />

  const role = (user as any)?.role || (user as any)?.roleType || null
  const hasRequiredRole =
    !requiredRole ||
    (role && String(role).toLowerCase().includes(String(requiredRole).toLowerCase()))

  useEffect(() => {
    if (!hasRequiredRole) {
      toast.error('You do not have permission to access that page.')
    }
  }, [hasRequiredRole])

  if (hasRequiredRole) return children
  return <Navigate to="/admin" replace />
}

export const router = createBrowserRouter([
  { path: '/', element: <LoginPage /> },
  { path: '/admin', element: <AdminLoginPage /> },
  { path: '/auth/callback', element: <CallbackPage /> },
  { path: '/detail', element: (
      <ProtectedRoute>
        <DetailPage />
      </ProtectedRoute>
    )
  },
  { path: '/admin/transactions', element: (
      <RoleProtectedRoute requiredRole={'super-admin'}>
        <>
          <TransactionsPage />
          <Toaster />
        </>
      </RoleProtectedRoute>
    )
  },
])
