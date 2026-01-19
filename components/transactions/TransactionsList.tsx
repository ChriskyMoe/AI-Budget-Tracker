'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TransactionForm } from './TransactionForm'
import { Edit, Trash2, TrendingUp, TrendingDown } from 'lucide-react'
import { format, parseISO } from 'date-fns'

interface Category {
  id: string
  name: string
  type: 'income' | 'expense'
}

interface Transaction {
  id: string
  amount: number
  category_id: string
  type: 'income' | 'expense'
  date: string
  note: string | null
  currency: string
  categories: {
    id: string
    name: string
  }
}

interface TransactionsListProps {
  transactions: Transaction[]
  categories: Category[]
  baseCurrency: string
}

export function TransactionsList({
  transactions,
  categories,
  baseCurrency,
}: TransactionsListProps) {
  const router = useRouter()
  const supabase = createClient()
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) {
      return
    }

    setDeletingId(id)
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)

      if (error) throw error
      router.refresh()
    } catch (error: any) {
      alert(error.message || 'Failed to delete transaction')
    } finally {
      setDeletingId(null)
    }
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <p className="text-gray-500 text-center py-8">No transactions found. Add your first transaction to get started!</p>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Note
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(parseISO(transaction.date), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {transaction.type === 'income' ? (
                        <TrendingUp className="h-4 w-4 text-green-600 mr-2" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600 mr-2" />
                      )}
                      <span className="text-sm text-gray-900 capitalize">
                        {transaction.type}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.categories?.name || 'Uncategorized'}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(Number(transaction.amount), transaction.currency)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {transaction.note || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setEditingTransaction(transaction)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(transaction.id)}
                        disabled={deletingId === transaction.id}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {editingTransaction && (
        <TransactionForm
          isOpen={!!editingTransaction}
          onClose={() => setEditingTransaction(null)}
          categories={categories}
          baseCurrency={baseCurrency}
          transaction={editingTransaction}
        />
      )}
    </>
  )
}
