// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

// This variable lives in the global scope of the server or browser process
let client: ReturnType<typeof createBrowserClient> | undefined

export function createClient() {
  // 1. Check if a client already exists in this process (Server or Browser)
  if (client) return client

  // 2. Create the client
  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: { 
        name: 'employee-auth-token' 
      },
      // 3. IMPORTANT: This helps prevent the "Lock" errors in dev environments
      auth: {
        flowType: 'pkce',
        detectSessionInUrl: true,
        persistSession: true,
      }
    }
  )

  return client
}
