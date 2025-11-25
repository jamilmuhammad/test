import React, { useEffect, useMemo, useState } from 'react'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { api } from '../shared/api'
import { useAuth } from '../modules/auth/AuthContext'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

type TopUserData = { userId: string; username?: string; total: number }
type TopUser = TopUserData[]
type Transaction = { id: string; amount: number; fromWalletId?: string; toWalletId?: string; createdAt?: string }

export function TransactionsPage() {
  const { token } = useAuth()
  const [topUsers, setTopUsers] = useState<TopUserData[]>([])
    const [selectedUser, setSelectedUser] = useState<string>('all')
  const [txs, setTxs] = useState<Transaction[]>([])
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 10
    const [usersList, setUsersList] = useState<Array<{ id: string; username?: string; name?: string }>>([])

  useEffect(() => {
    if (!token) return
    api.get<any>('/transactions/top-users/20', token)
      .then((res) => {
        const payload = res && (res as any).data ? (res as any).data : res
        if (Array.isArray(payload)) return setTopUsers(payload)
        if (Array.isArray(payload?.data)) return setTopUsers(payload.data)
        if (Array.isArray(payload?.topUsers)) return setTopUsers(payload.topUsers)
        console.warn('Unexpected /top-users payload', payload)
        setTopUsers([])
      })
      .catch((err) => console.error(err))
  }, [token])

    // fetch users for selection
    useEffect(() => {
      if (!token) return
      api.get<any>('/transactions/users', token)
        .then((res) => {
          const payload = res && (res as any).data ? (res as any).data : res
          if (Array.isArray(payload)) return setUsersList(payload)
          if (Array.isArray(payload?.data)) return setUsersList(payload.data)
          if (Array.isArray(payload?.users)) return setUsersList(payload.users)
          console.warn('Unexpected /transactions/users payload', payload)
          setUsersList([])
        })
        .catch((err) => console.error(err))
    }, [token])

    useEffect(() => {
      if (!token) return
      // fetch top 200 transactions for selected user (or 'all') and paginate client-side
      const userId = selectedUser || 'all'
      api.get<any>(`/transactions/user/${userId}/top/200`, token)
        .then((res) => {
          const payload = res && (res as any).data ? (res as any).data : res
          if (Array.isArray(payload)) return setTxs(payload)
          if (Array.isArray(payload?.data)) return setTxs(payload.data)
          if (Array.isArray(payload?.transactions)) return setTxs(payload.transactions)
          console.warn('Unexpected user transactions payload', payload)
          setTxs([])
        })
        .catch((err) => console.error(err))
    }, [token, selectedUser])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return txs
    return txs.filter((t) => t.id.toLowerCase().includes(q) || String(t.amount).includes(q))
  }, [txs, query])

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize)

  const chartData = useMemo(() => ({
    labels: topUsers.map((u) => u.username || u.userId.slice(0, 8)),
    datasets: [
      {
        label: 'Total transacted',
        data: topUsers.map((u) => u.total),
        backgroundColor: 'rgba(59,130,246,0.8)'
      }
    ]
  }), [topUsers])

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Transactions Dashboard</h2>

      <section className="mb-6">
        <h3 className="text-sm font-medium mb-2">Top Transacting Users</h3>
        <div className="w-full max-w-4xl bg-white p-4 rounded shadow">
          <Bar data={chartData} />
        </div>
        <div className="mt-3 flex gap-2 flex-wrap">
          {topUsers.map((u) => (
            <button
              key={u.userId}
              onClick={() => { setSelectedUser(u.userId); setPage(1) }}
              className={`px-3 py-1 rounded ${selectedUser === u.userId ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>
              {u.username || u.userId.slice(0,8)} ({u.total})
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-medium mb-2">Transactions {selectedUser === 'all' ? 'for All users' : `for ${selectedUser.slice(0,8)}`}</h3>

        <div className="mb-3 flex items-center gap-3">
          <label className="text-sm">User:</label>
          <select
            value={selectedUser}
            onChange={(e) => { setSelectedUser(e.target.value); setPage(1) }}
            className="px-3 py-2 rounded border"
          >
            <option value="all">All users</option>
            {usersList.map((u) => (
              <option key={u.id} value={u.id}>{u.username || u.name || u.id.slice(0,8)}</option>
            ))}
          </select>
        </div>

        <div className="mb-2 flex gap-2">
          <input className="px-3 py-2 rounded border" placeholder="Search tx id or amount" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="bg-white rounded shadow overflow-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Amount</th>
                <th className="px-4 py-2 text-left">From</th>
                <th className="px-4 py-2 text-left">To</th>
                <th className="px-4 py-2 text-left">Created</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((t) => (
                <tr key={t.id} className="border-t">
                  <td className="px-4 py-2 text-sm font-mono">{t.id}</td>
                  <td className="px-4 py-2">{t.amount}</td>
                  <td className="px-4 py-2">{t.fromWalletId?.slice(0,8) || '-'}</td>
                  <td className="px-4 py-2">{t.toWalletId?.slice(0,8) || '-'}</td>
                  <td className="px-4 py-2">{t.createdAt ? new Date(t.createdAt).toLocaleString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <button className="px-3 py-1 rounded bg-gray-200" onClick={() => setPage((p) => Math.max(1, p-1))} disabled={page <= 1}>Prev</button>
          <div>Page {page} / {pages}</div>
          <button className="px-3 py-1 rounded bg-gray-200" onClick={() => setPage((p) => Math.min(pages, p+1))} disabled={page >= pages}>Next</button>
        </div>
      </section>
    </div>
  )
}

export default TransactionsPage
