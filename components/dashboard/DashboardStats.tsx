'use client'

import { Card } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Wallet, Target } from 'lucide-react'

interface DashboardStatsProps {
  income: number
  expenses: number
  balance: number
  budget: number
  remainingBudget: number
  currency: string
}

export function DashboardStats({
  income,
  expenses,
  balance,
  budget,
  remainingBudget,
  currency,
}: DashboardStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  const stats = [
    {
      name: 'Income',
      value: formatCurrency(income),
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      name: 'Expenses',
      value: formatCurrency(expenses),
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      name: 'Balance',
      value: formatCurrency(balance),
      icon: Wallet,
      color: balance >= 0 ? 'text-blue-600' : 'text-red-600',
      bgColor: balance >= 0 ? 'bg-blue-50' : 'bg-red-50',
    },
    {
      name: 'Remaining Budget',
      value: formatCurrency(remainingBudget),
      icon: Target,
      color: remainingBudget >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: remainingBudget >= 0 ? 'bg-green-50' : 'bg-red-50',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.name} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="mt-2 text-2xl font-semibold text-gray-900">
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <Icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
