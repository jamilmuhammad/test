import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '../modules/auth/AuthContext'
import { api } from '../shared/api'
import { Button } from '../widgets/ui/button'
import TransferForm from './TransferForm'
import TransactionsList from './TransactionsList'


export function DetailPage() {
  const { token, user, logout } = useAuth()
  const [userDetail, setUserDetail] = useState<any | null>(null)
  const [balance, setBalance] = useState<string | number | null>(null)

  const header = useMemo(() => (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-3">
        <div className="text-sm">
          <div className="text-xl font-semibold">Insignia</div>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <div className="text-sm">Halo, {(user as any)?.username}</div>
        <Button variant="outline" onClick={logout}>Logout</Button>
      </div>
    </div>
  ), [user, logout, userDetail, balance])

  // fetch user details and balance for the current authenticated user
  useEffect(() => {
    if (!token || !user) return
    const userId = (user as any)?.id || (user as any)?.user_id || (user as any)?.sub || null
    if (!userId) return

    // user details
    api.get<any>(`/users/${userId}`, token)
      .then((res) => {
        const payload = res && (res as any).data ? (res as any).data : res
        console.log('Fetched user details', payload)
        setUserDetail(payload)
      })
      .catch((err: any) => {
        console.error('Failed to load user details', err)
      })

    // balance
    api.get<any>('/wallets/balance', token)
      .then((res) => {
        const payload = res && (res as any).data ? (res as any).data : res
        console.log('Fetched balance', payload)
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

  return (
    <div className="min-h-screen flex flex-col">
      {header}
      {userDetail ? (
        <>  
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">{userDetail?.name || user?.name || 'Guest'}</h2>
            <h4 className="text-muted-foreground">{userDetail?.username || (user as any)?.username}</h4>
            <div className="text-xs text-muted-foreground">Balance: {balance !== null ? String(balance) : '—'}</div>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
              {JSON.stringify(userDetail, null, 2)}
            </pre>
          </div>
          <TransferForm />
          <TransactionsList />
        </>
      ) : null}
    </div>
  )
}
