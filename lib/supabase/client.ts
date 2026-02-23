// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Prevent duplicate instances during development hot-reloads
  if (typeof window !== 'undefined' && (window as any).__supabase_client) {
    return (window as any).__supabase_client
  }

  const client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: { name: 'employee-auth-token' },
    }
  )

  if (typeof window !== 'undefined') {
    (window as any).__supabase_client = client
  }

  return client
}
