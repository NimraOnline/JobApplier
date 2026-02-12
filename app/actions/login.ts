"use server"

import { createActionClient } from "@/lib/supabase/server-action"
import { redirect } from "next/navigation"

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  
  // 1. Use the Write-Capable Client
  const supabase = await createActionClient()

  // 2. Attempt Sign In
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  if (!data.user) {
    return { error: "Login failed. Please try again." }
  }

  // 3. IMMEDIATE ROLE CHECK
  // We check the role before the user ever leaves this function.
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', data.user.id)
    .single()

  const allowedRoles = ['employee', 'manager', 'admin']
  const isAuthorized = profile && allowedRoles.includes(profile.role)

  if (!isAuthorized) {
    // 4. Security Block: Sign out immediately
    // This removes the cookie we just set, so the browser remains unauthenticated.
    await supabase.auth.signOut()
    
    return { 
      error: "Access Denied. You do not have permission to access the Employee Portal." 
    }
  }

  // 5. Success
  // No revalidatePath needed here as redirect forces a fresh navigation
  redirect("/dashboard")
}
