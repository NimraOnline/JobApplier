import { createBrowserClient } from '@supabase/ssr'

// 1. Create a variable outside the function to hold the instance
let client: ReturnType<typeof createBrowserClient> | undefined

export function createClient() {
  // 2. If the client already exists, return it immediately
  if (client) return client

  // 3. Otherwise, create it, save it, and return it
  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  return client
}
