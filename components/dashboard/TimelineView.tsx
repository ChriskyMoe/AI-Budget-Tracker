'use client'

import { Card } from '@/components/ui/card'
import { format, parseISO } from 'date-fns'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface Transaction {
  id: string
  amount: number
  type: 'income' | 'expense'
  date: string
  note: string | null
  categories: {
    id: string
    name: string
  }
}

interface TimelineViewProps {
  transactions: Transaction[]
  currency: string
}

export function TimelineView({ transactions, currency }: TimelineViewProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  // Group transactions by date
  const groupedByDate = transactions.reduce((acc, transaction) => {
    const date = transaction.date
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(transaction)
    return acc
  }, {} as Record<string, Transaction[]>)

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  ).slice(0, 10) // Show last 10 days

  if (sortedDates.length === 0) {
    return (
      <Card title="Recent Activity">
        <p className="text-gray-500 text-center py-8">No transactions recorded</p>
      </Card>
    )
  }

  return (
    <Card title="Recent Activity">
      <div className="space-y-4">
        {sortedDates.map((date) => {
          const dayTransactions = groupedByDate[date]
          const dayTotal = dayTransactions.reduce((sum, t) => {
            return sum + (t.type === 'income' ? Number(t.amount) : -Number(t.amount))
          }, 0)

          return (
            <div key={date} className="border-l-2 border-gray-200 pl-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">
                  {format(parseISO(date), 'MMM dd, yyyy')}
                </span>
                <span
                  className={`text-sm font-semibold ${
                    dayTotal >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {formatCurrency(Math.abs(dayTotal))}
                </span>
              </div>
              <div className="space-y-2">
                {dayTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center space-x-2">
                      {transaction.type === 'income' ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                      <span className="text-gray-600">
                        {transaction.categories?.name || 'Uncategorized'}
                      </span>
                      {transaction.note && (
                        <span className="text-gray-400">• {transaction.note}</span>
                      )}
                    </div>
                    <span
                      className={`font-medium ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(Number(transaction.amount))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
