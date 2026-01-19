'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface Category {
  id?: string
  name: string
  type: 'income' | 'expense'
  is_default?: boolean
}

interface CategoryFormProps {
  isOpen: boolean
  onClose: () => void
  category?: Category
}

export function CategoryForm({ isOpen, onClose, category }: CategoryFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState<Category>({
    name: category?.name || '',
    type: category?.type || 'expense',
    is_default: false,
  })

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        type: category.type,
        is_default: category.is_default || false,
      })
    } else {
      setFormData({
        name: '',
        type: 'expense',
        is_default: false,
      })
    }
  }, [category, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      if (category?.id) {
        // Update existing category
        const { error } = await supabase
          .from('categories')
          .update({
            name: formData.name,
            type: formData.type,
          })
          .eq('id', category.id)
          .eq('user_id', user.id)

        if (error) throw error
      } else {
        // Create new category
        const { error } = await supabase
          .from('categories')
          .insert({
            user_id: user.id,
            name: formData.name,
            type: formData.type,
            is_default: false,
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
      title={category ? 'Edit Category' : 'Add Category'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' | 'expense' })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={!!category?.is_default}
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>

        <Input
          label="Category Name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          disabled={!!category?.is_default}
        />

        {category?.is_default && (
          <p className="text-sm text-gray-500">
            Default categories cannot be edited or deleted.
          </p>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading || !!category?.is_default}>
            {loading ? 'Saving...' : category ? 'Update' : 'Add'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
