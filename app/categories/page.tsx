import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CategoriesList } from '@/components/categories/CategoriesList'
import { AddCategoryButton } from '@/components/categories/AddCategoryButton'

export default async function CategoriesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get all categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', user.id)
    .order('is_default', { ascending: false })
    .order('type', { ascending: true })
    .order('name', { ascending: true })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your income and expense categories
          </p>
        </div>
        <AddCategoryButton />
      </div>

      <CategoriesList categories={categories || []} />
    </div>
  )
}
