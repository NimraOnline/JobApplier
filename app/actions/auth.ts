"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function signOutAction() {
  const supabase = await createClient()
  
  // 1. Tell Supabase to invalidate the session
  await supabase.auth.signOut()
  
  // 2. Redirect to login
  // (Server Actions automatically handle the cookie clearing during redirect)
  redirect("/login")
}
