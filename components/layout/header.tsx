'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { 
  Search, 
  Bell, 
  Settings, 
  LogOut, 
  ChevronDown, 
  Wallet,
  Menu,
  X
} from 'lucide-react'

export function Header() {
  const router = useRouter()
  const supabase = createClient()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const navItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/transactions', label: 'Transactions' },
    { href: '/budgets', label: 'Budgets' },
    { href: '/categories', label: 'Categories' },
  ]

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 h-16">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">
          
          {/* Left Section: Logo */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center gap-2 group">
              <div className="bg-teal-50 p-2 rounded-lg group-hover:bg-teal-100 transition-colors">
                <Wallet className="h-6 w-6 text-teal-600" />
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">
                Budget<span className="text-teal-600">AI</span>
              </span>
            </Link>
          </div>

          {/* Right Section: Search, Notifications, Profile */}
          <div className="flex items-center gap-4">
            
            {/* Search Bar - Hidden on mobile, visible on lg */}
            <div className="hidden lg:block relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 w-64 bg-gray-50 border-none rounded-full text-sm focus:ring-2 focus:ring-teal-500/20 focus:bg-white transition-all duration-200 outline-none placeholder:text-gray-400"
              />
            </div>

            {/* Notifications */}
            <button className="relative p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-full transition-all duration-200">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1 pl-2 pr-3 rounded-full border border-gray-100 hover:border-teal-100 hover:bg-teal-50/50 transition-all duration-200"
              >
                <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-semibold text-sm">
                  JD
                </div>
                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 ring-1 ring-black ring-opacity-5 transform opacity-100 scale-100 transition-all duration-200">
                  <div className="px-4 py-3 border-b border-gray-50">
                    <p className="text-xs font-medium text-gray-500 uppercase">Signed in as</p>
                    <p className="text-sm font-semibold text-gray-900 truncate">user@example.com</p>
                  </div>
                  
                  <div className="py-1">
                    <Link href="/settings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700">
                      <Settings className="mr-3 h-4 w-4" />
                      Settings
                    </Link>
                  </div>
                  
                  <div className="py-1 border-t border-gray-50">
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 text-gray-400 hover:text-gray-600"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="pt-2 pb-3 space-y-1 px-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-teal-600 hover:bg-teal-50"
              >
                {item.label}
              </Link>
            ))}
            {/* Mobile Search */}
            <div className="pt-4 pb-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 w-full bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-teal-500/20 outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
