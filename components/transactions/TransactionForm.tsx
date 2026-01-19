'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface Category {
  id: string
  name: string
  type: 'income' | 'expense'
}

interface Transaction {
  id?: string
  amount: number
  category_id: string
  type: 'income' | 'expense'
  date: string
  note: string | null
  currency: string
}

interface TransactionFormProps {
  isOpen: boolean
  onClose: () => void
  categories: Category[]
  baseCurrency: string
  transaction?: Transaction
}

export function TransactionForm({
  isOpen,
  onClose,
  categories,
  baseCurrency,
  transaction,
}: TransactionFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState<Transaction>({
    amount: transaction?.amount || 0,
    category_id: transaction?.category_id || '',
    type: transaction?.type || 'expense',
    date: transaction?.date || new Date().toISOString().split('T')[0],
    note: transaction?.note || '',
    currency: transaction?.currency || baseCurrency,
  })

  useEffect(() => {
    if (transaction) {
      setFormData({
        amount: transaction.amount,
        category_id: transaction.category_id,
        type: transaction.type,
        date: transaction.date,
        note: transaction.note || '',
        currency: transaction.currency,
      })
    } else {
      setFormData({
        amount: 0,
        category_id: '',
        type: 'expense',
        date: new Date().toISOString().split('T')[0],
        note: '',
        currency: baseCurrency,
      })
    }
  }, [transaction, baseCurrency, isOpen])

  const filteredCategories = categories.filter(c => c.type === formData.type)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      if (transaction?.id) {
        // Update existing transaction
        const { error } = await supabase
          .from('transactions')
          .update({
            amount: formData.amount,
            category_id: formData.category_id,
            type: formData.type,
            date: formData.date,
            note: formData.note || null,
            currency: formData.currency,
          })
          .eq('id', transaction.id)
          .eq('user_id', user.id)

        if (error) throw error
      } else {
        // Create new transaction
        const { error } = await supabase
          .from('transactions')
          .insert({
            user_id: user.id,
            amount: formData.amount,
            category_id: formData.category_id,
            type: formData.type,
            date: formData.date,
            note: formData.note || null,
            currency: formData.currency,
          })

        if (error) throw error
      }

      router.refresh()
      onClose()
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={transaction ? 'Edit Transaction' : 'Add Transaction'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <select
            value={formData.type}
            onChange={(e) => {
              setFormData({ ...formData, type: e.target.value as 'income' | 'expense', category_id: '' })
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={formData.category_id}
            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select a category</option>
            {filteredCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Amount"
          type="number"
          step="0.01"
          min="0"
          value={formData.amount || ''}
          onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
          required
        />

        <Input
          label="Date"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          required
        />

        <Input
          label="Note (optional)"
          type="text"
          value={formData.note || ''}
          onChange={(e) => setFormData({ ...formData, note: e.target.value })}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Currency
          </label>
          <select
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="THB">THB</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="JPY">JPY</option>
            <option value="CAD">CAD</option>
            <option value="AUD">AUD</option>
          </select>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : transaction ? 'Update' : 'Add'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
