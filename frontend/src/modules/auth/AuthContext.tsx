import React, { createContext, useContext, useMemo, useState } from 'react'
import { api } from '../../shared/api'

type UserProfile = {
  user_id: string
  google_id?: string
  email: string
  name: string
  picture?: string
}

type AuthToken = {
  accessToken: string
  refresh_token: string
  user: UserProfile
}

type AuthContextType = {
  token: string | null
  user: UserProfile | null
  isAuthenticated: boolean
  loading: boolean
  loginWithGoogle: () => Promise<void>
  loginWithPassword?: (username: string, password: string) => Promise<void>
  handleAuthSuccess: (data: AuthToken) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const TOKEN_KEY = 'insignia.token'
const USER_KEY = 'insignia.user'
const REFRESH_KEY = 'insignia.refresh'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Read from localStorage synchronously to avoid initial redirect flicker
  const [token, setToken] = useState<string | null>(() => {
    try { return localStorage.getItem(TOKEN_KEY) } catch { return null }
  })
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const raw = localStorage.getItem(USER_KEY)
      return raw ? JSON.parse(raw) as UserProfile : null
    } catch {
      return null
    }
  })
  const loading = false

  const handleAuthSuccess = (data: AuthToken) => {
    setToken((data as any).accessToken || (data as any).access_token)
    setUser((data as any).user || (data as any).user_profile || null)
    localStorage.setItem(TOKEN_KEY, (data as any).accessToken || (data as any).access_token)
    localStorage.setItem(USER_KEY, JSON.stringify((data as any).user || (data as any).user_profile || {}))
    // store refresh token if provided
    const refresh = (data as any).refreshToken || (data as any).refresh_token
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh)
  }

  // Username/password login for admin dashboard
  const loginWithPassword = async (username: string, password: string) => {
    // call backend login
    try {
      const res = await api.post<any>('/auth/login', { username, password })
      // some clients/wrappers (or future changes) may wrap the server payload in `data`.
      const payload = (res && (res as any).data) ? (res as any).data : (res as any)

      // Backend sometimes returns a soft error object like: { status: 401, message: 'Invalid credentials' }
      if (payload && payload.status && Number(payload.status) >= 400) {
        throw new Error(payload.message || 'Invalid credentials')
      }

      const tokenFromBackend = payload?.accessToken || payload?.accessToken
      if (!tokenFromBackend) throw new Error('Missing token from login response')
      // setToken(tokenFromBackend)
      // localStorage.setItem(TOKEN_KEY, tokenFromBackend)

      // fetch profile
      try {
        const me = await api.get<any>('/auth/me', tokenFromBackend)
        const payloadUser = (me && (me as any).data) ? (me as any).data : (me as any)
        setUser(me)
        handleAuthSuccess({ ...payload, user: payloadUser })
        return me
      } catch (err) {
        // profile fetch failed — clear user but keep token
        setUser(null)
        
        logout()
        return null
      }
    } catch (err) {
      // bubble up a friendly error message
      if (err instanceof Error) throw err
      throw new Error('Login failed')
    }
  }

  const loginWithGoogle = async () => {
    // Ask backend to generate auth URL with our frontend callback to capture the code
    const redirect_uri = `${window.location.origin}/auth/callback`
    const res = await api.get<{ auth_url: string }>(`/auth/google/url?redirect_uri=${encodeURIComponent(redirect_uri)}`)
    const { auth_url } = res
    window.location.href = auth_url
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem(REFRESH_KEY)
  }

  const value = useMemo(() => ({
    token,
    user,
    isAuthenticated: !!token,
    loading,
    loginWithGoogle,
    loginWithPassword,
    handleAuthSuccess,
    logout,
  }), [token, user])

  // keep in-memory token in sync when api refreshes it and dispatches an event
  const [sessionExpiredVisible, setSessionExpiredVisible] = React.useState(false)

  React.useEffect(() => {
    const handler = (e: any) => {
      const t = e?.detail?.token
      const r = e?.detail?.refresh
      if (t) {
        setToken(t)
        localStorage.setItem(TOKEN_KEY, t)
      }
      if (r) {
        localStorage.setItem(REFRESH_KEY, r)
      }
    }
    window.addEventListener('insignia:token-refreshed', handler as EventListener)

    let timeoutHandle: number | null = null
    const failHandler = () => {
      // show a small session-expired toast/modal and then logout after a short delay
      setSessionExpiredVisible(true)
      // auto-logout after 3.5s
      timeoutHandle = window.setTimeout(() => {
        logout()
        try { window.location.href = '/' } catch (e) {}
      }, 3500)
    }
    window.addEventListener('insignia:refresh-failed', failHandler as EventListener)
    return () => {
      window.removeEventListener('insignia:token-refreshed', handler as EventListener)
      window.removeEventListener('insignia:refresh-failed', failHandler as EventListener)
      if (timeoutHandle) window.clearTimeout(timeoutHandle)
    }
  }, [])

  return (
    <AuthContext.Provider value={value}>
      {children}
      {sessionExpiredVisible && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="bg-yellow-50 border border-yellow-300 text-yellow-900 p-3 rounded shadow flex items-center gap-3">
            <div className="text-sm">Your session expired. Redirecting to login…</div>
            <button
              className="ml-2 px-3 py-1 bg-yellow-600 text-white rounded text-sm"
              onClick={() => {
                setSessionExpiredVisible(false)
                logout()
                try { window.location.href = '/' } catch (e) {}
              }}
            >
              Sign in now
            </button>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  )
}


export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
