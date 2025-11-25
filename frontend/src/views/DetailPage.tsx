import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '../modules/auth/AuthContext'
import { api } from '../shared/api'
import { Button } from '../widgets/ui/button'

type ChatResponse = {
  response: string
  session_id: string
  query_types: string[]
  context: string
  sql_query?: string
  query_results?: { success?: boolean; row_count?: number; data?: any[] }
  query_data?: Record<string, any>[]
  final_response: string
}

export function DetailPage() {
  const { token, user, logout } = useAuth()
  const [userDetail, setUserDetail] = useState<any | null>(null)
  const [balance, setBalance] = useState<string | number | null>(null)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([])
  const endRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const header = useMemo(() => (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-3">
        {userDetail?.picture || user?.picture ? <img src={userDetail?.picture || user?.picture} className="w-8 h-8 rounded-full" /> : null}
        <div className="text-sm">
          <div className="font-medium">{userDetail?.name || user?.name || 'Guest'}</div>
          <div className="text-muted-foreground">{userDetail?.email || (user as any)?.email}</div>
          <div className="text-xs text-muted-foreground">Balance: {balance !== null ? String(balance) : '—'}</div>
        </div>
      </div>
      <Button variant="outline" onClick={logout}>Logout</Button>
    </div>
  ), [user, logout])

  // fetch user details and balance for the current authenticated user
  useEffect(() => {
    if (!token || !user) return
    setDetailError(null)
    const userId = (user as any)?.id || (user as any)?.user_id || (user as any)?.sub || null
    if (!userId) return

    // user details
    api.get<any>(`/users/${userId}`, token)
      .then((res) => {
        const payload = res && (res as any).data ? (res as any).data : res
        setUserDetail(payload)
      })
      .catch((err: any) => {
        console.error('Failed to load user details', err)
        setDetailError(err?.message || 'Failed to load user details')
      })

    // balance
    api.get<any>('/wallets/balance', token)
      .then((res) => {
        const payload = res && (res as any).data ? (res as any).data : res
        // backend likely returns { balance: Decimal }
        if (payload && (payload.balance !== undefined)) {
          setBalance(payload.balance)
        } else if (typeof payload === 'number' || typeof payload === 'string') {
          setBalance(payload)
        } else if (payload?.data && (payload.data.balance !== undefined)) {
          setBalance(payload.data.balance)
        } else {
          // fallback: try reading a `balance` property at top level
          setBalance((payload && payload.balance) || null)
        }
      })
      .catch((err: any) => {
        console.error('Failed to load balance', err)
      })
  }, [token, user])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const text = input.trim()
    if (!text) return
    setInput('')
    setMessages(m => [...m, { role: 'user', text }])
    try {
      const res = await api.post<ChatResponse>('/rag-chat/rag', { message: text, session_id: sessionId }, token || undefined)
      setSessionId(res.session_id)
      const display = res.final_response || res.response
      setMessages(m => [...m, { role: 'assistant', text: display }])
    } catch (e: any) {
      setMessages(m => [...m, { role: 'assistant', text: `Error: ${e.message}` }])
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {header}
    </div>
  )
}
