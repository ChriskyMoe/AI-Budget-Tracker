'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CategoryForm } from './CategoryForm'
import { Edit, Trash2, TrendingUp, TrendingDown, Lock } from 'lucide-react'

interface Category {
  id: string
  name: string
  type: 'income' | 'expense'
  is_default: boolean
}

interface CategoriesListProps {
  categories: Category[]
}

export function CategoriesList({ categories }: CategoriesListProps) {
  const router = useRouter()
  const supabase = createClient()
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string, isDefault: boolean) => {
    if (isDefault) {
      alert('Default categories cannot be deleted')
      return
    }

    if (!confirm('Are you sure you want to delete this category?')) {
      return
    }

    setDeletingId(id)
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)

      if (error) throw error
      router.refresh()
    } catch (error: any) {
      alert(error.message || 'Failed to delete category')
    } finally {
      setDeletingId(null)
    }
  }

  const incomeCategories = categories.filter(c => c.type === 'income')
  const expenseCategories = categories.filter(c => c.type === 'expense')

  if (categories.length === 0) {
    return (
      <Card>
        <p className="text-gray-500 text-center py-8">No categories found. Add your first category to get started!</p>
      </Card>
    )
  }

  const CategorySection = ({ title, items }: { title: string; items: Category[] }) => (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((category) => (
          <Card key={category.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {category.type === 'income' ? (
                  <TrendingUp className="h-5 w-5 text-green-600" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-600" />
                )}
                <div>
                  <p className="font-medium text-gray-900">{category.name}</p>
                  {category.is_default && (
                    <p className="text-xs text-gray-500 flex items-center mt-1">
                      <Lock size={12} className="mr-1" />
                      Default
                    </p>
                  )}
                </div>
              </div>
              {!category.is_default && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditingCategory(category)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id, category.is_default)}
                    disabled={deletingId === category.id}
                    className="text-red-600 hover:text-red-900 disabled:opacity-50"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )

  return (
    <>
      <div className="space-y-8">
        <CategorySection title="Income Categories" items={incomeCategories} />
        <CategorySection title="Expense Categories" items={expenseCategories} />
      </div>

      {editingCategory && (
        <CategoryForm
          isOpen={!!editingCategory}
          onClose={() => setEditingCategory(null)}
          category={editingCategory}
        />
      )}
    </>
  )
}
