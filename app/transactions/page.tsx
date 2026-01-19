import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TransactionsList } from '@/components/transactions/TransactionsList'
import { AddTransactionButton } from '@/components/transactions/AddTransactionButton'

export default async function TransactionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile for base currency
  const { data: profile } = await supabase
    .from('profiles')
    .select('base_currency')
    .eq('id', user.id)
    .single()

  // Get all transactions
  const { data: transactions } = await supabase
    .from('transactions')
    .select(`
      *,
      categories (
        id,
        name
      )
    `)
    .eq('user_id', user.id)
    .order('date', { ascending: false })

  // Get categories for the form
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', user.id)
    .order('name', { ascending: true })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your income and expenses
          </p>
        </div>
        <AddTransactionButton
          categories={categories || []}
          baseCurrency={profile?.base_currency || 'THB'}
        />
      </div>

      <TransactionsList
        transactions={transactions || []}
        categories={categories || []}
        baseCurrency={profile?.base_currency || 'USD'}
      />
    </div>
  )
}
