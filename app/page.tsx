import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function RootPage() {
  const supabase = await createClient()
  
  // We just check if a user exists. 
  // The middleware handles the role-based redirection to /login if they aren't an employee.
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect("/dashboard")
  } else {
    redirect("/login")
  }
}
