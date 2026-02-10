// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

// 1. Create a variable outside the function to hold the instance
let client: ReturnType<typeof createBrowserClient> | undefined

export function createClient() {
  // 2. If the client already exists, return the existing one.
  if (client) return client

  // 3. Only create it if it doesn't exist yet
  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        name: 'employee-auth-token', // Keeping our unique name
      },
    }
  )

  return client
}
