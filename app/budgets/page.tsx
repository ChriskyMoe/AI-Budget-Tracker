import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BudgetsList } from '@/components/budgets/BudgetsList'
import { AddBudgetButton } from '@/components/budgets/AddBudgetButton'

export default async function BudgetsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const now = new Date()

  // Get user profile for base currency
  const { data: profile } = await supabase
    .from('profiles')
    .select('base_currency')
    .eq('id', user.id)
    .single()

  // Get budgets for current month
  const { data: budgets } = await supabase
    .from('budgets')
    .select(`
      *,
      categories (
        id,
        name
      )
    `)
    .eq('user_id', user.id)
    .eq('month', now.getMonth() + 1)
    .eq('year', now.getFullYear())

  // Get transactions for current month to calculate spending
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .eq('type', 'expense')
    .gte('date', monthStart.toISOString().split('T')[0])
    .lte('date', monthEnd.toISOString().split('T')[0])

  // Get categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', user.id)
    .eq('type', 'expense')
    .order('name', { ascending: true })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Budgets</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your monthly and category budgets
          </p>
        </div>
        <AddBudgetButton
          categories={categories || []}
          baseCurrency={profile?.base_currency || 'THB'}
          currentMonth={now.getMonth() + 1}
          currentYear={now.getFullYear()}
        />
      </div>

      <BudgetsList
        budgets={budgets || []}
        transactions={transactions || []}
        categories={categories || []}
        baseCurrency={profile?.base_currency || 'USD'}
      />
    </div>
  )
}
