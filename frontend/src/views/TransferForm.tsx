import React, { useEffect, useState } from 'react'
import { useAuth } from '../modules/auth/AuthContext'
import { api, wallet, admin } from '../shared/api'
import { Button } from '../widgets/ui/button'

export default function TransferForm() {
  const { token, user } = useAuth()
  const [users, setUsers] = useState<Array<any>>([])
  const [toUserId, setToUserId] = useState<string>('')
  const [amount, setAmount] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [amountError, setAmountError] = useState<string | null>(null)
  const MAX_AMOUNT = 10000000 // amount must be less than this

  useEffect(() => {
    if (!token) return
    // fetch users for selection
    admin.listUsersForSelection<any[]>(token)
      .then((res) => {
        const payload = (res && (res as any).data) ? (res as any).data : res
        if (Array.isArray(payload)) {
          setUsers(payload)
          // default to first user if available and not current user
          const first = payload.find((u: any) => u.id !== (user as any)?.id) || payload[0]
          if (first) setToUserId(first.id || first.user_id || String(first.id))
        } else {
          console.warn('Unexpected users payload', payload)
        }
      })
      .catch((err) => {
        console.error('Failed to load users for selection', err)
      })
  }, [token])

  const handleDeposit = async () => {
    if (!token) return alert('Not authenticated')
    const amt = Number(amount)
    if (!amt || amt <= 0) return alert('Enter a valid amount')
    if (amt >= MAX_AMOUNT) return alert(`Amount must be less than ${MAX_AMOUNT.toLocaleString()}`)
    setLoading(true)
    try {
      const r = await wallet.deposit<any>(amt, { description }, token)
      alert('Deposit successful')
      // optionally refresh balance or other UI
    } catch (err: any) {
      console.error('Deposit failed', err)
      alert('Deposit failed: ' + (err?.message || JSON.stringify(err)))
    } finally {
      setLoading(false)
    }
  }

  const handleTransfer = async () => {
    if (!token) return alert('Not authenticated')
    const amt = Number(amount)
    if (!amt || amt <= 0) return alert('Enter a valid amount')
    if (amt >= MAX_AMOUNT) return alert(`Amount must be less than ${MAX_AMOUNT.toLocaleString()}`)
    if (!toUserId) return alert('Select a recipient')
    setLoading(true)
    try {
      const r = await wallet.transfer<any>(toUserId, amt, { description }, token)
      alert('Transfer successful')
    } catch (err: any) {
      console.error('Transfer failed', err)
      alert('Transfer failed: ' + (err?.message || JSON.stringify(err)))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded shadow">
      <h3 className="text-lg font-semibold mb-4">Wallet — deposit & transfer</h3>

      <label className="block text-sm mb-1">Amount</label>
      <input
        type="number"
        value={amount}
        onChange={(e) => {
          const v = e.target.value
          setAmount(v)
          const n = Number(v)
          if (v !== '' && !isNaN(n) && n >= MAX_AMOUNT) {
            setAmountError(`Amount must be less than ${MAX_AMOUNT.toLocaleString()}`)
          } else {
            setAmountError(null)
          }
        }}
        className="w-full border p-2 rounded mb-3"
        max={String(MAX_AMOUNT - 1)}
        placeholder="0.00"
      />
      {amountError ? <div className="text-sm text-red-600 mb-3">{amountError}</div> : null}

      <label className="block text-sm mb-1">Description (optional)</label>
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full border p-2 rounded mb-3"
        placeholder="Payment note"
      />

      <label className="block text-sm mb-1">Recipient (transfer)</label>
      <select
        value={toUserId}
        onChange={(e) => setToUserId(e.target.value)}
        className="w-full border p-2 rounded mb-4"
      >
        <option value="">-- Select user --</option>
        {users.map((u: any) => (
          <option key={u.id || u.user_id || u.value} value={u.id || u.user_id || u.value}>
            {u.name || u.username || u.email || u.id}
          </option>
        ))}
      </select>

      <div className="flex gap-2">
        <Button variant="default" onClick={handleDeposit} disabled={loading || !!amountError}>Deposit</Button>
        <Button variant="outline" onClick={handleTransfer} disabled={loading || !!amountError}>Transfer</Button>
      </div>
    </div>
  )
}
