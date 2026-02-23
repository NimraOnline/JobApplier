// app/actions/auth.ts
"use server"

import { createActionClient } from "@/lib/supabase/server-action"
import { redirect } from "next/navigation"

export async function signOutAction() {
  const supabase = await createActionClient()
  await supabase.auth.signOut()
  redirect("/login")
}
