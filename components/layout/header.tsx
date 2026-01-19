'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Wallet, LogOut, Settings } from 'lucide-react'

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const navItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/transactions', label: 'Transactions' },
    { href: '/budgets', label: 'Budgets' },
    { href: '/categories', label: 'Categories' },
  ]

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <Wallet className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Budget Tracker</span>
            </Link>
            <nav className="hidden md:flex space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/settings"
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Settings size={20} />
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
