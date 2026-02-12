import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createActionClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // 1. Ensure cookie name matches Middleware and Client
      cookieOptions: { 
        name: 'employee-auth-token' 
      },
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          // 2. No try/catch here. If this fails, we WANT it to throw 
          // so we know auth is broken, but in a Server Action, this works.
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}
