'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BudgetForm } from './BudgetForm'
import { Edit, Trash2, Target } from 'lucide-react'

interface Category {
  id: string
  name: string
}

interface Transaction {
  id: string
  amount: number
  category_id: string
}

interface Budget {
  id: string
  category_id: string | null
  amount: number
  month: number
  year: number
  currency: string
  categories: {
    id: string
    name: string
  } | null
}

interface BudgetsListProps {
  budgets: Budget[]
  transactions: Transaction[]
  categories: Category[]
  baseCurrency: string
}

export function BudgetsList({
  budgets,
  transactions,
  categories,
  baseCurrency,
}: BudgetsListProps) {
  const router = useRouter()
  const supabase = createClient()
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  const calculateSpending = (budget: Budget) => {
    if (!budget.category_id) {
      // Total monthly budget - sum all expenses
      return transactions.reduce((sum, t) => sum + Number(t.amount), 0)
    } else {
      // Category budget - sum expenses for this category
      return transactions
        .filter(t => t.category_id === budget.category_id)
        .reduce((sum, t) => sum + Number(t.amount), 0)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this budget?')) {
      return
    }

    setDeletingId(id)
    try {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id)

      if (error) throw error
      router.refresh()
    } catch (error: any) {
      alert(error.message || 'Failed to delete budget')
    } finally {
      setDeletingId(null)
    }
  }

  const totalBudget = budgets.find(b => !b.category_id)
  const categoryBudgets = budgets.filter(b => b.category_id)

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  if (budgets.length === 0) {
    return (
      <Card>
        <p className="text-gray-500 text-center py-8">No budgets set for this month. Add your first budget to get started!</p>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {totalBudget && (
          <Card title="Total Monthly Budget">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Budget Amount</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatCurrency(Number(totalBudget.amount), totalBudget.currency)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Spent</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatCurrency(calculateSpending(totalBudget), totalBudget.currency)}
                  </p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className={`h-4 rounded-full ${
                    calculateSpending(totalBudget) > totalBudget.amount
                      ? 'bg-red-600'
                      : 'bg-blue-600'
                  }`}
                  style={{
                    width: `${Math.min((calculateSpending(totalBudget) / Number(totalBudget.amount)) * 100, 100)}%`,
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  Remaining: {formatCurrency(
                    Math.max(0, Number(totalBudget.amount) - calculateSpending(totalBudget)),
                    totalBudget.currency
                  )}
                </span>
                <span className={`font-medium ${
                  calculateSpending(totalBudget) > totalBudget.amount
                    ? 'text-red-600'
                    : 'text-green-600'
                }`}>
                  {((calculateSpending(totalBudget) / Number(totalBudget.amount)) * 100).toFixed(1)}% used
                </span>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={() => setEditingBudget(totalBudget)}
                  className="text-blue-600 hover:text-blue-900"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => handleDelete(totalBudget.id)}
                  disabled={deletingId === totalBudget.id}
                  className="text-red-600 hover:text-red-900 disabled:opacity-50"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </Card>
        )}

        {categoryBudgets.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Category Budgets</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoryBudgets.map((budget) => {
                const spent = calculateSpending(budget)
                const remaining = Number(budget.amount) - spent
                const percentage = (spent / Number(budget.amount)) * 100

                return (
                  <Card key={budget.id}>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Target className="h-5 w-5 text-blue-600" />
                          <h3 className="font-semibold text-gray-900">
                            {budget.categories?.name || 'Uncategorized'}
                          </h3>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setEditingBudget(budget)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(budget.id)}
                            disabled={deletingId === budget.id}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Budget</span>
                          <span className="font-medium text-gray-900">
                            {formatCurrency(Number(budget.amount), budget.currency)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Spent</span>
                          <span className="font-medium text-gray-900">
                            {formatCurrency(spent, budget.currency)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Remaining</span>
                          <span className={`font-medium ${
                            remaining >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatCurrency(Math.max(0, remaining), budget.currency)}
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            percentage > 100 ? 'bg-red-600' : percentage > 80 ? 'bg-yellow-500' : 'bg-green-600'
                          }`}
                          style={{
                            width: `${Math.min(percentage, 100)}%`,
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 text-center">
                        {percentage.toFixed(1)}% of budget used
                      </p>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {editingBudget && (
        <BudgetForm
          isOpen={!!editingBudget}
          onClose={() => setEditingBudget(null)}
          categories={categories}
          baseCurrency={baseCurrency}
          currentMonth={editingBudget.month}
          currentYear={editingBudget.year}
          budget={editingBudget}
        />
      )}
    </>
  )
}
