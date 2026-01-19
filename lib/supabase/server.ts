import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'

export async function createClient() {
  const cookieStore = await cookies()

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

  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
