import React, { useEffect, useState } from 'react'
import { useAuth } from '../modules/auth/AuthContext'
import { transactions, admin } from '../shared/api'

export default function TransactionsList() {
  const { token, user } = useAuth()
  const [txs, setTxs] = useState<Array<any>>([])
  const [loading, setLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState<string>('')
  const [users, setUsers] = useState<Array<any>>([])

  const isAdmin = (() => {
    const u = user as any
    if (!u) return false
    const role = (user as any)?.role || (user as any)?.roleType || null
    return (role && (role === 'super-admin')) || false
  })()

  useEffect(() => {
    if (!token || !user) return
    const myId = (user as any)?.id || (user as any)?.user_id || (user as any)?.sub
    if (!myId) return

    if (isAdmin) {
      // fetch user list for admin to choose from (including an 'all' option)
      admin.listUsersForSelection<any[]>(token)
        .then((res) => {
          const payload = (res && (res as any).data) ? (res as any).data : res
          if (Array.isArray(payload)) {
            setUsers(payload)
            setSelectedUser(myId)
          }
        })
        .catch((err) => {
          console.error('Failed to fetch users for transactions', err)
        })
    } else {
      setSelectedUser(myId)
    }
  }, [token, user])

  useEffect(() => {
    if (!token || !selectedUser) return
    const fetchTx = async () => {
      setLoading(true)
      try {
        const target = isAdmin && selectedUser === 'all' ? 'all' : selectedUser
        const r = await transactions.getUserTop<any[]>(target, 200, token)
        const payload = (r && (r as any).data) ? (r as any).data : r
        if (Array.isArray(payload)) setTxs(payload)
        else if (payload && Array.isArray((payload as any).transactions)) setTxs((payload as any).transactions)
        else setTxs([])
      } catch (err) {
        console.error('Failed to fetch transactions', err)
        setTxs([])
      } finally {
        setLoading(false)
      }
    }
    fetchTx()
  }, [token, selectedUser, isAdmin])

  return (
    <div className="p-4 bg-white rounded shadow mt-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold">Transactions</h4>
        {isAdmin ? (
          <div className="flex items-center gap-2">
            <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} className="border p-2 rounded">
              <option value="all">All users</option>
              {users.map((u: any) => (
                <option key={u.id || u.user_id} value={u.id || u.user_id}>{u.name || u.username || u.email || u.id}</option>
              ))}
            </select>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">Showing your transactions</div>
        )}
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">When</th>
                <th className="py-2">Type</th>
                <th className="py-2">Amount</th>
                <th className="py-2">From</th>
                <th className="py-2">To</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {txs.length === 0 ? (
                <tr><td colSpan={6} className="py-4 text-center text-muted-foreground">No transactions found</td></tr>
              ) : txs.map((t: any) => (
                <tr key={t.id || t.txId || JSON.stringify(t)} className="border-b">
                  <td className="py-2">{new Date(t.createdAt || t.created_at || t.timestamp || t.date || Date.now()).toLocaleString()}</td>
                  <td className="py-2">{t.type || t.txType || '—'}</td>
                  <td className="py-2">{t.amount ?? t.value ?? '—'}</td>
                  <td className="py-2">{t.fromUserId || t.from || t.source || '—'}</td>
                  <td className="py-2">{t.toUserId || t.to || t.destination || '—'}</td>
                  <td className="py-2">{t.status || t.txStatus || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
