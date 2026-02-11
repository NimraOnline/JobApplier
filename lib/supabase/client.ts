import { createBrowserClient } from '@supabase/ssr'

// Define the client variable outside the function to keep it in memory
let client: ReturnType<typeof createBrowserClient> | undefined

export function createClient() {
  // If the client already exists, return it immediately
  if (client) return client

  // Otherwise, create it once
  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        name: 'employee-auth-token',
      },
    }
  )

  return client
}
