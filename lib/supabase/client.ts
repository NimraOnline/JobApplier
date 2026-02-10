import { createBrowserClient } from '@supabase/ssr'

// 1. Define the variable OUTSIDE the function
let client: ReturnType<typeof createBrowserClient> | undefined

export function createClient() {
  // 2. Check if it already exists
  if (client) return client

  // 3. Create it ONLY if it doesn't exist
  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        name: 'employee-auth-token', // Your unique cookie name
      },
    }
  )

  return client
}
