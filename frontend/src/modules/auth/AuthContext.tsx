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
  access_token: string
  token_type: string
  expires_in: number
  user_profile: UserProfile
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
    setToken(data.access_token)
    setUser(data.user_profile)
    localStorage.setItem(TOKEN_KEY, data.access_token)
    localStorage.setItem(USER_KEY, JSON.stringify(data.user_profile))
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

      const tokenFromBackend = payload?.accessToken || payload?.access_token
      if (!tokenFromBackend) throw new Error('Missing token from login response')
      setToken(tokenFromBackend)
      localStorage.setItem(TOKEN_KEY, tokenFromBackend)

      // fetch profile
      try {
        const me = await api.get<any>('/auth/me', tokenFromBackend)
        setUser(me)
        localStorage.setItem(USER_KEY, JSON.stringify(me))
        return me
      } catch (err) {
        // profile fetch failed — clear user but keep token
        setUser(null)
        localStorage.removeItem(USER_KEY)
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
