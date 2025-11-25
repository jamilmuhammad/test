import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../modules/auth/AuthContext'
import { Button } from '../widgets/ui/button'

export function LoginPage() {
  const { loginWithPassword, isAuthenticated } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!loginWithPassword) return setError('Login unavailable')
    setLoading(true)
    try {
      const me = await loginWithPassword(username, password)

      // decide where to navigate based on role
      const role = (me as any)?.role || (me as any)?.roleType || (me as any)?.role?.toString()
      if (role && String(role).toLowerCase().includes('super')) {
        navigate('/admin/transactions')
      } else {
        navigate('/detail')
      }
    } catch (err: any) {
      setError(err?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <h1 className="text-2xl font-bold text-center">{!isAuthenticated ? 'Sign in to Insignia' : 'Welcome to Insignia'}</h1>
        {!isAuthenticated ? (
          <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Username</label>
            <input className="mt-1 block w-full rounded-md border px-3 py-2" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium">Password</label>
            <input type="password" className="mt-1 block w-full rounded-md border px-3 py-2" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</Button>
        </form>)
         : (
          <a className="text-blue-600 underline block text-center" href="/detail">Go to detail</a>
        )}
      </div>
    </div>
  )
}
