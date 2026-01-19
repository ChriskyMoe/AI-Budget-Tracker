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
}

interface Budget {
  id?: string
  category_id: string | null
  amount: number
  month: number
  year: number
  currency: string
}

interface BudgetFormProps {
  isOpen: boolean
  onClose: () => void
  categories: Category[]
  baseCurrency: string
  currentMonth: number
  currentYear: number
  budget?: Budget
}

export function BudgetForm({
  isOpen,
  onClose,
  categories,
  baseCurrency,
  currentMonth,
  currentYear,
  budget,
}: BudgetFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState<Budget>({
    category_id: budget?.category_id || null,
    amount: budget?.amount || 0,
    month: budget?.month || currentMonth,
    year: budget?.year || currentYear,
    currency: budget?.currency || baseCurrency,
  })

  useEffect(() => {
    if (budget) {
      setFormData({
        category_id: budget.category_id,
        amount: budget.amount,
        month: budget.month,
        year: budget.year,
        currency: budget.currency,
      })
    } else {
      setFormData({
        category_id: null,
        amount: 0,
        month: currentMonth,
        year: currentYear,
        currency: baseCurrency,
      })
    }
  }, [budget, baseCurrency, currentMonth, currentYear, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      if (budget?.id) {
        // Update existing budget
        const { error } = await supabase
          .from('budgets')
          .update({
            category_id: formData.category_id || null,
            amount: formData.amount,
            month: formData.month,
            year: formData.year,
            currency: formData.currency,
          })
          .eq('id', budget.id)
          .eq('user_id', user.id)

        if (error) throw error
      } else {
        // Create new budget
        const { error } = await supabase
          .from('budgets')
          .insert({
            user_id: user.id,
            category_id: formData.category_id || null,
            amount: formData.amount,
            month: formData.month,
            year: formData.year,
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

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={budget ? 'Edit Budget' : 'Add Budget'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Budget Type
          </label>
          <select
            value={formData.category_id ? 'category' : 'total'}
            onChange={(e) => {
              if (e.target.value === 'total') {
                setFormData({ ...formData, category_id: null })
              }
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="total">Total Monthly Budget</option>
            <option value="category">Category Budget</option>
          </select>
        </div>

        {formData.category_id !== null && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={formData.category_id || ''}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value || null })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required={formData.category_id !== null}
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <Input
          label="Amount"
          type="number"
          step="0.01"
          min="0"
          value={formData.amount || ''}
          onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Month
            </label>
            <select
              value={formData.month}
              onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {months.map((month, index) => (
                <option key={index} value={index + 1}>
                  {month}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year
            </label>
            <Input
              type="number"
              min="2000"
              max="2100"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
              required
            />
          </div>
        </div>

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
            {loading ? 'Saving...' : budget ? 'Update' : 'Add'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
