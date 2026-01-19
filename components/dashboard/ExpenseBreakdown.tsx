'use client'

import { Card } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface Transaction {
  id: string
  amount: number
  type: 'income' | 'expense'
  categories: {
    id: string
    name: string
  }
}

interface ExpenseBreakdownProps {
  transactions: Transaction[]
  currency: string
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C']

export function ExpenseBreakdown({ transactions, currency }: ExpenseBreakdownProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Group expenses by category
  const expenseData = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, transaction) => {
      const categoryName = transaction.categories?.name || 'Uncategorized'
      if (!acc[categoryName]) {
        acc[categoryName] = 0
      }
      acc[categoryName] += Number(transaction.amount)
      return acc
    }, {} as Record<string, number>)

  const chartData = Object.entries(expenseData).map(([name, value], index) => ({
    name,
    value: Number(value),
    color: COLORS[index % COLORS.length],
  }))

  const totalExpenses = chartData.reduce((sum, item) => sum + item.value, 0)

  if (chartData.length === 0) {
    return (
      <Card title="Expense Breakdown">
        <p className="text-gray-500 text-center py-8">No expenses recorded this month</p>
      </Card>
    )
  }

  return (
    <Card title="Expense Breakdown">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 space-y-2">
        {chartData.map((item) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-gray-600">{item.name}</span>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {formatCurrency(item.value)}
            </span>
          </div>
        ))}
      </div>
    </Card>
  )
}
