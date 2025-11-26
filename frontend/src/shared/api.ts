import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/v1'
const TOKEN_KEY = 'insignia.token'
const REFRESH_KEY = 'insignia.refresh'

// Axios instance
const instance: AxiosInstance = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

let isRefreshing = false as boolean
let failedQueue: Array<{ resolve: (value?: any) => void; reject: (err: any) => void }> = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((p) => {
    if (error) p.reject(error)
    else p.resolve(token)
  })
  failedQueue = []
}

// Attach token from localStorage to each request unless overridden
// use a loose any type to avoid Axios internal header typing mismatches
instance.interceptors.request.use((config: any) => {
  try {
    const t = localStorage.getItem(TOKEN_KEY)
    if (t && config && config.headers && !(config.headers as any).Authorization) {
      ;(config.headers as any).Authorization = `Bearer ${t}`
    }
  } catch (e) {}
  return config
})

instance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config
    if (!originalRequest) return Promise.reject(error)

    const status = error?.response?.status
    if (status === 401 && !originalRequest._retry) {
      // queue other requests while refreshing
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          originalRequest.headers = originalRequest.headers || {}
          originalRequest.headers.Authorization = `Bearer ${token}`
          return instance(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refresh = localStorage.getItem(REFRESH_KEY)
        if (!refresh) {
          // cannot refresh
          try { window.dispatchEvent(new CustomEvent('insignia:refresh-failed')) } catch (e) {}
          return Promise.reject(error)
        }

        const r = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken: refresh }, { headers: { 'Content-Type': 'application/json' }, withCredentials: true })
        const data = r.data || {}
        const newAccess = (data as any).accessToken || (data as any).access_token
        const newRefresh = (data as any).refreshToken || (data as any).refresh_token
        if (newAccess) {
          localStorage.setItem(TOKEN_KEY, newAccess)
          if (newRefresh) localStorage.setItem(REFRESH_KEY, newRefresh)
          try { window.dispatchEvent(new CustomEvent('insignia:token-refreshed', { detail: { token: newAccess, refresh: newRefresh } })) } catch (e) {}
          processQueue(null, newAccess)
          originalRequest.headers = originalRequest.headers || {}
          originalRequest.headers.Authorization = `Bearer ${newAccess}`
          return instance(originalRequest)
        }
        // refresh unsuccessful
        processQueue(error, null)
        try { window.dispatchEvent(new CustomEvent('insignia:refresh-failed')) } catch (e) {}
        return Promise.reject(error)
      } catch (err) {
        processQueue(err, null)
        try { window.dispatchEvent(new CustomEvent('insignia:refresh-failed')) } catch (e) {}
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export const api = {
  get: async <T>(path: string, token?: string) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined
    const res = await instance.get(path, { headers })
    return res.data as T
  },
  post: async <T>(path: string, body?: any, token?: string) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined
    const res = await instance.post(path, body, { headers })
    return res.data as T
  },
}

// Wallet helpers
export const wallet = {
  deposit: async <T>(amount: number, opts?: { description?: string; idempotencyKey?: string }, token?: string) => {
    const body: any = { amount }
    if (opts?.description) body.description = opts.description
    if (opts?.idempotencyKey) body.idempotencyKey = opts.idempotencyKey
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined
    const res = await instance.post(`/wallets/deposit`, body, { headers })
    return res.data as T
  },
  transfer: async <T>(toUserId: string, amount: number, opts?: { description?: string; idempotencyKey?: string }, token?: string) => {
    const body: any = { toUserId, amount }
    if (opts?.description) body.description = opts.description
    if (opts?.idempotencyKey) body.idempotencyKey = opts.idempotencyKey
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined
    const res = await instance.post(`/wallets/transfer`, body, { headers })
    return res.data as T
  },
}

// Admin/user listing helpers
export const admin = {
  listUsersForSelection: async <T>(token?: string) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined
    const res = await instance.get(`/transactions/users`, { headers })
    return res.data as T
  },
}

// Transactions helpers
export const transactions = {
  // fetch top N transactions for a given userId (or 'all')
  getUserTop: async <T>(userId: string, n = 200, token?: string) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined
    const res = await instance.get(`/transactions/user/${encodeURIComponent(userId)}/top/${n}`, { headers })
    return res.data as T
  },
}

// (keep the axios-backed api above)
