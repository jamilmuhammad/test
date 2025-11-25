import { createBrowserRouter, Navigate } from 'react-router-dom'
import { LoginPage } from './views/LoginPage'
import { AdminLoginPage } from './views/AdminLoginPage'
import { TransactionsPage } from './views/TransactionsPage'
import { useAuth } from './modules/auth/AuthContext'
import { CallbackPage } from './views/CallbackPage'
import { DetailPage } from './views/DetailPage'

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
  if (requiredRole && role && String(role).toLowerCase().includes(String(requiredRole).toLowerCase())) {
    return children
  }
  // if user is authenticated but does not have required role, send them to user area
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
      <RoleProtectedRoute requiredRole={'SuperAdmin'}>
        <TransactionsPage />
      </RoleProtectedRoute>
    )
  },
])
