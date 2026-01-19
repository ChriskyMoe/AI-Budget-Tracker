import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Check if env vars are missing or still have placeholder values
  const isPlaceholderUrl = supabaseUrl?.includes('your_supabase') || supabaseUrl?.includes('placeholder')
  const isPlaceholderKey = supabaseAnonKey?.includes('your_supabase') || supabaseAnonKey?.includes('placeholder')
  
  // Validate URL format
  const isValidUrl = supabaseUrl && (
    supabaseUrl.startsWith('http://') || 
    supabaseUrl.startsWith('https://')
  )

  if (!supabaseUrl || !supabaseAnonKey || isPlaceholderUrl || isPlaceholderKey || !isValidUrl) {
    throw new Error(
      '⚠️  Supabase environment variables not configured!\n\n' +
      'Please update your .env.local file with your actual Supabase credentials:\n\n' +
      'NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co\n' +
      'NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\n\n' +
      'Get these values from: https://supabase.com/dashboard/project/_/settings/api'
    )
  }

  return createBrowserClient<Database>(
    supabaseUrl,
    supabaseAnonKey
  )
}
